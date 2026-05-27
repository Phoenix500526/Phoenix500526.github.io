---
title: Libevent 源码阅读笔记(二)、从一个简单例子开始(下)
top: false
cover: false
toc: true
mathjax: true
date: 2020-08-10 16:44:02
password:
summary:
tags: [Libevent, C, 网络编程]
categories: Libevent源码阅读笔记
---

阅读本文之前请确保你看过上一篇文章：[Libevent 源码阅读笔记(一)、从一个简单例子开始(上)](/2020/08/10/Libevent-源码阅读笔记-一-从一个简单例子开始-上/)

在上一篇文章中，我们提到了关于 Libevent 使用的一个基本逻辑：

> 1.   调用`event_init()`创建 event_base 对象，一个 event_base 对象相当于一个 Reactor 实例
> 2.   创建具体的事件处理器，其中 `evsignal_new()`创建的是信号事件处理器和`evtimer_new()`创建的是定时事件处理器
> 3.   调用`event_add()`将事件处理器插入到注册事件队列中，并将其对应的事件插入到事件多路分发器中，相当于 Reactor 中的`register_handler`方法
> 4.   调用`event_base_dispatch()`执行事件循环
> 5.   循环结束后，调用`*_free()`释放系统资源

在这篇文章中，我们将继续分析剩余的后 3 个步骤

#### 将事件处理器添加到注册事件队列中

要了解如何将事件处理器插入到注册事件队列中，就需要先知道 Libevent 是如何将句柄和注册事件之间的联系定义出来。其相关的数据结构主要定义在 event-internal.h 和 evmap.c 文件中

```
//event-internal.h
//若定义了 EVMAP_USE_HT 则将 event_io_map 定义为哈希表。该哈希表存储了 event_map_entry 对象和 I/O 事件队列之间的映射关系
#ifdef EVMAP_USE_HT
#define HT_NO_CACHE_HASH_VALUES
#include "ht-internal.h"
struct event_map_entry;
HT_HEAD(event_io_map, event_map_entry);
#else
#define event_io_map event_signal_map
#endif

/* Used to map signal numbers to a list of events.  If EVMAP_USE_HT is not
   defined, this structure is also used as event_io_map, which maps fds to a
   list of events.
*/
struct event_signal_map {
    void **entries; //用于存放 evmap_io 或 evmap_signal 数组
    /* The number of entries available in entries */
    int nentries;   //entries 的大小
};

// evmap.c 文件
/** An entry for an evmap_io list: notes all the events that want to read or
    write on a given fd, and the number of each.
  */
struct evmap_io {
    struct event_dlist events;  //I/O 事件队列
    ev_uint16_t nread;      //记录事件队列中的读事件数量
    ev_uint16_t nwrite;     //记录事件队列中的写事件数量
    ev_uint16_t nclose;     //记录事件队列中的关闭事件数量
};

/* An entry for an evmap_signal list: notes all the events that want to know
   when a signal triggers. */
struct evmap_signal {
    struct event_dlist events;  //信号事件队列
};

/* On some platforms, fds start at 0 and increment by 1 as they are
   allocated, and old numbers get used.  For these platforms, we
   implement io maps just like signal maps: as an array of pointers to
   struct evmap_io.  But on other platforms (windows), sockets are not
   0-indexed, not necessarily consecutive, and not necessarily reused.
   There, we use a hashtable to implement evmap_io.
*/
#ifdef EVMAP_USE_HT
//哈希表中的节点类型：以 fd 为键， ent 为值
struct event_map_entry {
    HT_ENTRY(event_map_entry) map_node;
    evutil_socket_t fd;
    union { /* This is a union in case we need to make more things that can
               be in the hashtable. */
        struct evmap_io evmap_io;
    } ent;
};
```

创建好的 event 事件可以利用 `event_add()`插入相应的注册事件队列中

```
//向注册事件队列中添加事件处理器
int event_add(struct event *ev, const struct timeval *tv)
{
    int res;
    if (EVUTIL_FAILURE_CHECK(!ev->ev_base)) {
        event_warnx("%s: event has no event_base set.", __func__);
        return -1;
    }
    EVBASE_ACQUIRE_LOCK(ev->ev_base, th_base_lock);
    res = event_add_nolock_(ev, tv, 0);
    EVBASE_RELEASE_LOCK(ev->ev_base, th_base_lock);
    return (res);
}
int event_add_nolock_(struct event *ev, const struct timeval *tv,int tv_is_absolute)
{
    struct event_base *base = ev->ev_base;
    int res = 0;
    int notify = 0;

    EVENT_BASE_ASSERT_LOCKED(base);
    event_debug_assert_is_setup_(ev);

    event_debug((
         "event_add: event: %p (fd "EV_SOCK_FMT"), %s%s%s%scall %p",
         ev,
         EV_SOCK_ARG(ev->ev_fd),
         ev->ev_events & EV_READ ? "EV_READ " : " ",
         ev->ev_events & EV_WRITE ? "EV_WRITE " : " ",
         ev->ev_events & EV_CLOSED ? "EV_CLOSED " : " ",
         tv ? "EV_TIMEOUT " : " ",
         ev->ev_callback));

    EVUTIL_ASSERT(!(ev->ev_flags & ~EVLIST_ALL));

    if (ev->ev_flags & EVLIST_FINALIZING) {
        /* XXXX debug */
        return (-1);
    }

    /* 如果添加的事件处理器是一个尚未被插入到通用定时器队列或时间堆内的定时器，则为该定时器在时间堆上预留一个位置*/
    if (tv != NULL && !(ev->ev_flags & EVLIST_TIMEOUT)) {
        if (min_heap_reserve_(&base->timeheap,
            1 + min_heap_size_(&base->timeheap)) == -1)
            return (-1);  /* ENOMEM == errno */
    }

    /* 如果当前调用者不是主线程，且被添加的是信号事件处理器，而主线程也正在调用该信号事件的回调函数，则当前调用者必须等待主线程完成调用，以避免导致竞态的发生 */
#ifndef EVENT__DISABLE_THREAD_SUPPORT
    if (base->current_event == event_to_event_callback(ev) &&
        (ev->ev_events & EV_SIGNAL)
        && !EVBASE_IN_THREAD(base)) {
        ++base->current_event_waiters;
        EVTHREAD_COND_WAIT(base->current_event_cond, base->th_base_lock);
    }
#endif
    
    if ((ev->ev_events & (EV_READ|EV_WRITE|EV_CLOSED|EV_SIGNAL)) &&
        !(ev->ev_flags & (EVLIST_INSERTED|EVLIST_ACTIVE|EVLIST_ACTIVE_LATER))) {
        if (ev->ev_events & (EV_READ|EV_WRITE|EV_CLOSED))
            //添加 IO 事件和 IO 事件处理器的映射关系
            res = evmap_io_add_(base, ev->ev_fd, ev);
        else if (ev->ev_events & EV_SIGNAL)
            //添加信号事件和信号事件处理器的映射关系
            res = evmap_signal_add_(base, (int)ev->ev_fd, ev);
        if (res != -1)
            //将事件处理器插入到注册事件队列
            event_queue_insert_inserted(base, ev);
        if (res == 1) {
            //通知主线程，事件多路分发器中添加了新的事件
            notify = 1;
            res = 0;
        }
    }

    /* 在前一个事件添加成功，且该事件是一个定时器的话，将其添加至时间堆或通用定时器队列当中。*/
    if (res != -1 && tv != NULL) {
        struct timeval now;
        int common_timeout;
#ifdef USE_REINSERT_TIMEOUT
        int was_common;
        int old_timeout_idx;
#endif

        /* 对于永久性事件处理器，如果其超时时间不是绝对时间，则将该事件的超时时间保存到 ev->ev_io_timeout 中*/
        if (ev->ev_closure == EV_CLOSURE_EVENT_PERSIST && !tv_is_absolute)
            ev->ev_io_timeout = *tv;

#ifndef USE_REINSERT_TIMEOUT
        //若该事件处理器已经被插入到通用定时器队列或时间堆当中，则先对其进行删除
        if (ev->ev_flags & EVLIST_TIMEOUT) {
            event_queue_remove_timeout(base, ev);
        }
#endif

        /* Check if it is active due to a timeout.  Rescheduling
         * this timeout before the callback can be executed
         * removes it from the active list. */
        //如果待添加的事件处理器因超时而被激活，则要从活动事件队列当中删除它以便重新调度
        if ((ev->ev_flags & EVLIST_ACTIVE) &&
            (ev->ev_res & EV_TIMEOUT)) {
            if (ev->ev_events & EV_SIGNAL) {
                //若事件处理器的回调函数正在执行当中，则设置 ev_ncalls 的值为 0，就可以退出回调函数的执行循环
                if (ev->ev_ncalls && ev->ev_pncalls) {
                    /* Abort loop */
                    *ev->ev_pncalls = 0;
                }
            }

            event_queue_remove_active(base, event_to_event_callback(ev));
        }

        gettime(base, &now);

        common_timeout = is_common_timeout(tv, base);   //用于判断应该将定时器插入到通用定时器队列还是时间堆当中
#ifdef USE_REINSERT_TIMEOUT
        was_common = is_common_timeout(&ev->ev_timeout, base);
        old_timeout_idx = COMMON_TIMEOUT_IDX(&ev->ev_timeout);
#endif

        if (tv_is_absolute) {
            ev->ev_timeout = *tv;
        } else if (common_timeout) {
            struct timeval tmp = *tv;
            tmp.tv_usec &= MICROSECONDS_MASK;
            evutil_timeradd(&now, &tmp, &ev->ev_timeout);
            ev->ev_timeout.tv_usec |=
                (tv->tv_usec & ~MICROSECONDS_MASK);
        } else {
            //加上当前的系统时间以获得定时器超时的绝对时间
            evutil_timeradd(&now, tv, &ev->ev_timeout);
        }

        event_debug((
             "event_add: event %p, timeout in %d seconds %d useconds, call %p",
             ev, (int)tv->tv_sec, (int)tv->tv_usec, ev->ev_callback));
//插入定时器
#ifdef USE_REINSERT_TIMEOUT
        //根据 common_timeout 决定插入的位置是通用定时器队列还是时间堆
        event_queue_reinsert_timeout(base, ev, was_common, common_timeout, old_timeout_idx);
#else
        event_queue_insert_timeout(base, ev);
#endif

        if (common_timeout) {
            struct common_timeout_list *ctl =
                get_common_timeout_list(base, &ev->ev_timeout);
            //若被插入的定时器是通用定时器队列的首元素，则调用 common_timeout_schedule 将其转移到时间堆单中，这样可以使得时间堆和定时器链表的定时器得到相同的处理。
            if (ev == TAILQ_FIRST(&ctl->events)) {
                common_timeout_schedule(ctl, &now, ev);
            }
        } else {
            struct event* top = NULL;
            /* See if the earliest timeout is now earlier than it
             * was before: if so, we will need to tell the main
             * thread to wake up earlier than it would otherwise.
             * We double check the timeout of the top element to
             * handle time distortions due to system suspension.
             */
            //判断当前的定时器是否位于最小堆的堆顶，如果是的话，通知主线程以便更新 tick 的周期
            if (min_heap_elt_is_top_(ev))
                notify = 1;
            //若定时器不位于堆顶，则取出堆顶的定时器，判断是否小于当前时间，如果是，则通知主线程
            else if ((top = min_heap_top_(&base->timeheap)) != NULL &&
                     evutil_timercmp(&top->ev_timeout, &now, <))
                notify = 1;
            //猜测：time distortions：在一般情况下，主线程每次 tick 都对应了时间堆堆顶的定时器，因此不会出现堆顶定时器的时间小于当前时间的情况。但考虑到主线程可能因为阻塞无法及时发出 tick 信号，因此如果检测到堆顶定时器的时间小于当前时间，那说明发生了 time distortions，需要通知主线程，让它尽快 tick
        }
    }

    /* 若有必要，唤醒主线程 */
    if (res != -1 && notify && EVBASE_NEED_NOTIFY(base))
        evthread_notify_base(base);

    event_debug_note_add_(ev);

    return (res);
}
```

可以看到，在整个 `event_add_nolock_`函数中，主要的工作是为不同的事件提供对应的操作，主要分为 3 类操作，

*   调用 `evmap_io_add_` 将 I/O 事件添加到事件多路分发器中，并将对应的事件处理器添加到 I/O 事件队列当中，同时建立起 I/O 事件和 I/O 事件处理器之间的映射，最后将 I/O 事件处理器插入到注册事件队列中
*   调用 `evmap_signal_add_` 将信号事件添加到事件多路分发器中，并将对应的事件处理器添加到信号事件队列当中，同时建立起信号事件和信号事件处理器之间的映射，最后将信号事件处理器插入到注册事件队列中
*   调用 `event_queue_insert_inserted`修改 event_base 的事件处理器总数
*   根据是否允许将定时器重新插入到通用定时器队列或时间堆中，调用`event_queue_reinsert_timeout`和`event_queue_insert_timeout`来将定时器插入到通用定时器队列或时间堆中

接下来，对于注册事件，Libevent 通过`evmap_io_add_`、 `evmap_signal_add_` 以及 `event_queue_insert_inserted`进行将它们插入到对应的事件队列当中，其中`evmap_io_add_`、 `evmap_signal_add_` 被定义在 evmap.c 文件中，而`event_queue_insert_inserted`被定义在 event.c 文件中

```
// evmap.c 文件
int evmap_io_add_(struct event_base *base, evutil_socket_t fd, struct event *ev)
{
    //获得 event_base 的后端 I/O 复用机制实例
    const struct eventop *evsel = base->evsel;
    //获得 event_base 中文件描述符与 I/O 事件队列的映射表(哈希表或数组)，event_io_map 由宏 HT_HEAD 定义
    struct event_io_map *io = &base->io;
    //ctx代表 fd 所对应的 I/O 事件队列
    struct evmap_io *ctx = NULL;
    int nread, nwrite, nclose, retval = 0;
    short res = 0, old = 0;
    struct event *old_ev;

    EVUTIL_ASSERT(fd == ev->ev_fd);

    if (fd < 0)
        return 0;

#ifndef EVMAP_USE_HT
    if (fd >= io->nentries) {
        //当 fd 超过了映射表 io 的最大容量时，扩充哈希表
        if (evmap_make_space(io, fd, sizeof(struct evmap_io *)) == -1)
            return (-1);
    }
#endif
    //在映射表 io 中获取 ctx 和 fd 之间的映射关系，若没有映射关系，则建立对应的映射关系
    GET_IO_SLOT_AND_CTOR(ctx, io, fd, evmap_io, evmap_io_init,
                         evsel->fdinfo_len);

    nread = ctx->nread;
    nwrite = ctx->nwrite;
    nclose = ctx->nclose;

    if (nread)
        old |= EV_READ;
    if (nwrite)
        old |= EV_WRITE;
    if (nclose)
        old |= EV_CLOSED;
    //根据 ev 的事件类型，增加 I/O 事件队列中的相应的事件数量
    if (ev->ev_events & EV_READ) {
        if (++nread == 1)
            res |= EV_READ;
    }
    if (ev->ev_events & EV_WRITE) {
        if (++nwrite == 1)
            res |= EV_WRITE;
    }
    if (ev->ev_events & EV_CLOSED) {
        if (++nclose == 1)
            res |= EV_CLOSED;
    }
    if (EVUTIL_UNLIKELY(nread > 0xffff || nwrite > 0xffff || nclose > 0xffff)) {
        event_warnx("Too many events reading or writing on fd %d",
            (int)fd);
        return -1;
    }
    if (EVENT_DEBUG_MODE_IS_ON() &&
        (old_ev = LIST_FIRST(&ctx->events)) &&
        (old_ev->ev_events&EV_ET) != (ev->ev_events&EV_ET)) {
        event_warnx("Tried to mix edge-triggered and non-edge-triggered"
            " events on fd %d", (int)fd);
        return -1;
    }

    if (res) {
        void *extra = ((char*)ctx) + sizeof(struct evmap_io);
        /* XXX(niels): we cannot mix edge-triggered and
         * level-triggered, we should probably assert on
         * this. */
        //在事件多路分发器中注册事件。add 函数是事件多路分发器的接口。
        if (evsel->add(base, ev->ev_fd,
            old, (ev->ev_events & EV_ET) | res, extra) == -1)
            return (-1);
        retval = 1;
    }

    ctx->nread = (ev_uint16_t) nread;
    ctx->nwrite = (ev_uint16_t) nwrite;
    ctx->nclose = (ev_uint16_t) nclose;
    //将 ev 插入到 I/O 事件队列 ctx 的头部
    LIST_INSERT_HEAD(&ctx->events, ev, ev_io_next);

    return (retval);
}

int evmap_signal_add_(struct event_base *base, int sig, struct event *ev)
{
    const struct eventop *evsel = base->evsigsel;
    //获得 event_base 中信号值与信号事件队列的映射表(哈希表或数组)，event_signal_map 由宏 HT_HEAD 定义
    struct event_signal_map *map = &base->sigmap;
    struct evmap_signal *ctx = NULL;

    if (sig < 0 || sig >= NSIG)
        return (-1);
    //若信号值超出了 event_signal_map 的索引范围，则对 event_signal_map 进行扩容
    if (sig >= map->nentries) {
        if (evmap_make_space(
            map, sig, sizeof(struct evmap_signal *)) == -1)
            return (-1);
    }
    //在映射表 signal 中获取 ctx 和信号值之间的映射关系，若没有映射关系，则建立对应的映射关系
    GET_SIGNAL_SLOT_AND_CTOR(ctx, map, sig, evmap_signal, evmap_signal_init,
        base->evsigsel->fdinfo_len);
    //若 ctx 中的信号事件队列不为空，则调用 I/O 复用机制 evsel 中的 add 函数，对信号事件进行注册
    if (LIST_EMPTY(&ctx->events)) {
        if (evsel->add(base, ev->ev_fd, 0, EV_SIGNAL, NULL)
            == -1)
            return (-1);
    }
    //插入信号事件处理器
    LIST_INSERT_HEAD(&ctx->events, ev, ev_signal_next);

    return (1);
}

//event.c
static void event_queue_insert_inserted(struct event_base *base, struct event *ev)
{
    EVENT_BASE_ASSERT_LOCKED(base);

    if (EVUTIL_FAILURE_CHECK(ev->ev_flags & EVLIST_INSERTED)) {
        event_errx(1, "%s: %p(fd "EV_SOCK_FMT") already inserted", __func__,
            ev, EV_SOCK_ARG(ev->ev_fd));
        return;
    }
    //更新 base 当中 ev->ev_flags 类型的计数器
    INCR_EVENT_COUNT(base, ev->ev_flags);
    //标记事件 ev 已经被插入到注册事件队列中
    ev->ev_flags |= EVLIST_INSERTED;
}
```

对于超时事件，Libevent 则调用了`event_queue_insert_timeout`来将定时器插入到通用定时器队列或时间堆。

```
static void event_queue_insert_timeout(struct event_base *base, struct event *ev)
{
    EVENT_BASE_ASSERT_LOCKED(base);

    if (EVUTIL_FAILURE_CHECK(ev->ev_flags & EVLIST_TIMEOUT)) {
        event_errx(1, "%s: %p(fd "EV_SOCK_FMT") already on timeout", __func__,
            ev, EV_SOCK_ARG(ev->ev_fd));
        return;
    }
    //更新 base 中的超时事件计数器
    INCR_EVENT_COUNT(base, ev->ev_flags);
    //标记以将这个超时事件添加到通用定时器链表或时间堆当中
    ev->ev_flags |= EVLIST_TIMEOUT;
    //判断该定时器的类型是否为通用定时器，若是则插入到通用定时器链表中，否则插入到时间堆当中
    if (is_common_timeout(&ev->ev_timeout, base)) {
        struct common_timeout_list *ctl =
            get_common_timeout_list(base, &ev->ev_timeout);
        insert_common_timeout_inorder(ctl, ev);
    } else {
        min_heap_push_(&base->timeheap, ev);
    }
}
```

这里需要指出，早期的 Libevent 使用了时间堆来设计定时器。由于在某些场合下，升序定时器链表的效率会更高，因此新版本的 Libevent 同时支持通用定时器链表和时间堆的操作。

#### Libevent 的核心动力 —— 事件循环

正如前面提到，Libevent 是基于事件驱动的，整个框架库的运转核心在于事件驱动：Reactor 在接收到相应事件后，通过 `event_base_dispatch()` 的方法，将事件分派给对应的事件处理器去处理。`event_base_dispatch()`定义在 event.c 文件中

```
int event_base_dispatch(struct event_base *event_base)
{
    return (event_base_loop(event_base, 0));
}
int event_base_loop(struct event_base *base, int flags)
{
    const struct eventop *evsel = base->evsel;
    struct timeval tv;
    struct timeval *tv_p;
    int res, done, retval = 0;

    /* Grab the lock.  We will release it inside evsel.dispatch, and again
     * as we invoke user callbacks. */
    EVBASE_ACQUIRE_LOCK(base, th_base_lock);
    //一个 event_base 仅允许执行一个事件循环
    if (base->running_loop) {
        event_warnx("%s: reentrant invocation.  Only one event_base_loop"
            " can run on each event_base at once.", __func__);
        EVBASE_RELEASE_LOCK(base, th_base_lock);
        return -1;
    }

    base->running_loop = 1;

    clear_time_cache(base);
    //设置信号事件的 event_base 实例
    if (base->sig.ev_signal_added && base->sig.ev_n_signals_added)
        evsig_set_base_(base);

    done = 0;

#ifndef EVENT__DISABLE_THREAD_SUPPORT
    //获取当前线程 ID
    base->th_owner_id = EVTHREAD_GET_ID();
#endif

    base->event_gotterm = base->event_break = 0;

    while (!done) {
        base->event_continue = 0;
        base->n_deferreds_queued = 0;

        /* Terminate the loop if we have been asked to */
        //这几个值代表了事件执行后应当对其执行什么操作，具体可看上篇文章中 event_base 的注释代码
        if (base->event_gotterm) {
            break;
        }

        if (base->event_break) {
            break;
        }

        tv_p = &tv;
        if (!N_ACTIVE_CALLBACKS(base) && !(flags & EVLOOP_NONBLOCK)) {
            //获取时间堆的堆顶元素的超时值，并设为此次事件的超时值
            timeout_next(base, &tv_p);
        } else {
            //若有就绪事件尚未处理，则将I/O复用系统调用的超时时间设置为0，这样系统调用会直接返回，程序也就可以立即处理就绪事件了
            evutil_timerclear(&tv);
        }

        //如果 event_base 中没有注册任何事件，则直接退出事件循环
        if (0==(flags&EVLOOP_NO_EXIT_ON_EMPTY) &&
            !event_haveevents(base) && !N_ACTIVE_CALLBACKS(base)) {
            event_debug(("%s: no events registered.", __func__));
            retval = 1;
            goto done;
        }

        event_queue_make_later_events_active(base);

        clear_time_cache(base);
        //调用多路事件分发器的 dispatch 方法分发事件，将就绪事件插入到活动事件队列中
        res = evsel->dispatch(base, tv_p);

        if (res == -1) {
            event_debug(("%s: dispatch returned unsuccessfully.",
                __func__));
            retval = -1;
            goto done;
        }
        //更新时间缓冲为当前的系统时间
        update_time_cache(base);
        //检查时间堆上的到期事件并处理
        timeout_process(base);

        if (N_ACTIVE_CALLBACKS(base)) {
            //调用 event_process_active 处理活动事件
            int n = event_process_active(base);
            if ((flags & EVLOOP_ONCE)
                && N_ACTIVE_CALLBACKS(base) == 0
                && n != 0)
                done = 1;
        } else if (flags & EVLOOP_NONBLOCK)
            done = 1;
    }
    event_debug(("%s: asked to terminate loop.", __func__));

done:
    //循环结束时的工作：清空时间缓存，并设置停止循环标志位
    clear_time_cache(base);
    base->running_loop = 0;

    EVBASE_RELEASE_LOCK(base, th_base_lock);

    return (retval);
}
```

从代码中可以看出，`event_base_dispatch()`调用了`event_base_loop()`，而`event_base_loop()`的关键是

调用了 event_base 中的`evsel->dispatch()`，该方法封装了 I/O 复用系统调用。至于如何根据编程环境的不同，自动选择合适的 I/O 复用技术，可以看上一篇文章中关于 eventop 的介绍

#### 释放资源

```
static int event_base_free_queues_(struct event_base *base, int run_finalizers)
{
    int deleted = 0, i;
    //释放掉活动事件队列中的剩余事件
    for (i = 0; i < base->nactivequeues; ++i) {
        struct event_callback *evcb, *next;
        for (evcb = TAILQ_FIRST(&base->activequeues[i]); evcb; ) {
            next = TAILQ_NEXT(evcb, evcb_active_next);
            deleted += event_base_cancel_single_callback_(base, evcb, run_finalizers);
            evcb = next;
        }
    }
    //释放延后活动事件队列中的事件
    {
        struct event_callback *evcb;
        while ((evcb = TAILQ_FIRST(&base->active_later_queue))) {
            deleted += event_base_cancel_single_callback_(base, evcb, run_finalizers);
        }
    }

    return deleted;
}
static int event_base_cancel_single_callback_(struct event_base *base,
    struct event_callback *evcb,
    int run_finalizers)
{
    int result = 0;
    //将已初始化的事件处理器释放掉
    if (evcb->evcb_flags & EVLIST_INIT) {
        struct event *ev = event_callback_to_event(evcb);
        if (!(ev->ev_flags & EVLIST_INTERNAL)) {
            event_del_(ev, EVENT_DEL_EVEN_IF_FINALIZING);
            result = 1;
        }
    } else {
        EVBASE_ACQUIRE_LOCK(base, th_base_lock);
        event_callback_cancel_nolock_(base, evcb, 1);
        EVBASE_RELEASE_LOCK(base, th_base_lock);
        result = 1;
    }

    if (run_finalizers && (evcb->evcb_flags & EVLIST_FINALIZING)) {
        switch (evcb->evcb_closure) {
        //对于类型为 EV_CLOSURE_EVENT_FINALIZE 和 EV_CLOSURE_EVENT_FINALIZE_FREE 的事件，调用它们相应的回调函数，结束后释放掉它们的资源
        case EV_CLOSURE_EVENT_FINALIZE:
        case EV_CLOSURE_EVENT_FINALIZE_FREE: {
            struct event *ev = event_callback_to_event(evcb);
            ev->ev_evcallback.evcb_cb_union.evcb_evfinalize(ev, ev->ev_arg);
            if (evcb->evcb_closure == EV_CLOSURE_EVENT_FINALIZE_FREE)
                mm_free(ev);
            break;
        }
        case EV_CLOSURE_CB_FINALIZE:
            //执行 EV_CLOSURE_CB_FINALIZE 类型事件的回调函数，它们的回调函数当中包含了事件终止时所应当执行的操作
            evcb->evcb_cb_union.evcb_cbfinalize(evcb, evcb->evcb_arg);
            break;
        default:
            break;
        }
    }
    return result;
}
```

#### 参考资料

《Linux 高性能服务器编程》 —— 游双著

 《libevent-book》 —— Libevent 上的官方文档
