---
title: Libevent 源码阅读笔记(一)、从一个简单例子开始(上)
top: false
cover: false
toc: true
mathjax: true
date: 2020-08-10 15:15:58
password:
summary:
tags: [Libevent, C, 网络编程]
categories: Libevent源码阅读笔记
---

#### 什么是 Libevent

Libevent 是一款基于 Reactor 模式实现，由事件驱动的高性能开源 I/O 框架库，它提供一组 API 并允许开发者为事件注册回调函数。当事件发生时，Libevent 实例会执行相应的回调函数。使用 Libevent 来实现网络服务器的事件循环检查框架，可以使开发者更加集中于程序的逻辑之上，减少了工作量，而且 Libevent 在稳定性，性能及可移植性方面有着出色的表现。基于 Libevent 框架库实现的著名软件有：高性能分布式的内存缓存软件 memcached 和 Google 浏览器的 Chromium 的 Linux 版本。

 一个基于 Reactor 模式实现的 I/O 框架库大致上应当包含如下几个组件：

![](/img/jianshu-imports/a21a8b200275/4114134-f239be1bef63c78c.webp)

I/O 框架库组件

*   句柄(Handle)：一个句柄通常代表了一个事件源，在 Linux 下， I/O 事件对应的句柄是文件描述符(fd)，而信号事件对应的句柄是信号值
*   事件多路分发器(EventDemultiplexer)：将系统支持的各种 I/O 复用的系统调用封装成统一的接口，称为事件多路分发器。一般包含了事件注册`register_event()`，事件删除`remove_event()`和事件等待`demultiplex()`。其中`demultiplex()`是等待事件的核心函数，其内部调用的是select、poll、epoll_wait 等函数
*   事件处理器和具体事件处理器(EventHandler 和 ConcreteEventHandler)：事件处理器是一个接口，其中包含了一个或多个`handle_event()`方法。用户需要继承这一接口，并实现自己的事件处理器。
*   Reactor：整个 I/O 框架库的核心，主要提供了以下几个方法： 
    *   `handle_events()`：该方法执行事件循环，不断地等待事件，然后依次处理所有就绪事件对应的事件处理器
    *   `register_handler()`：调用事件多路分发器的 `register_event()` 方法来向事件多路分发器中注册一个事件
    *   `remove_handler()`：调用事件多路分发器的 `remove_event()` 方法来删除事件多路分发器中的一个事件

![](/img/jianshu-imports/a21a8b200275/4114134-4bc3054e11c22467.webp)

I/O 框架库的工作时序

Libevent 的源码链接：git clone [https://github.com/libevent/libevent.git](https://github.com/libevent/libevent.git)

 Libevent 官网: [http://libevent.org/](http://libevent.org/)

编译及安装方法(在 libevent 的源码目录下)：

> ./configure
> 
>  make
> 
>  make verify # (optional)
> 
>  sudo make install

#### 一个简单的 libevent 示例代码：

```C
//helloworld.cpp
#include <sys/signal.h>
#include <event.h>

void signal_cb(int fd, short event, void* argc){
    event_base* base = (event_base*)argc;
    timeval delay = {2,0};
    printf("Caught an interrupt signal; exiting cleanly in two seconds ...\n");
    event_base_loopexit(base, &delay);
}

void timeout_cb(int fd, short event, void* argc){
    printf("timeout\n");
}

int main(void){
    event_base* base = event_init();
    event* signal_event = evsignal_new(base, SIGINT,signal_cb, base);
    event_add(signal_event, nullptr);
    timeval tv = {1,0};
    event* timeout_event = evtimer_new(base, timeout_cb, nullptr);
    event_add(timeout_event,&tv);
    event_base_dispatch(base);
    event_free(timeout_event);
    event_free(signal_event);
    event_base_free(base);
    return 0;
}
```

编译方法：

> g++ helloworld.cpp -levent_core -std=c++11

在上述的 Demo 中，包含了使用 Libevent 库的一个基本逻辑：

> 1.   调用`event_init()`创建 event_base 对象，一个 event_base 对象相当于一个 Reactor 实例
> 2.   创建具体的事件处理器，其中 `evsignal_new()`创建的是信号事件处理器和`evtimer_new()`创建的是定时事件处理器
> 3.   调用`event_add()`将事件处理器插入到注册事件队列中，并将其对应的事件插入到事件多路分发器中，相当于 Reactor 中的`register_handler`方法
> 4.   调用`event_base_dispatch()`执行事件循环
> 5.   循环结束后，调用`*_free()`释放系统资源

接下来我们便按照上述 5 个步骤进行源码分析，出于篇幅考虑，会将这 5 个步骤拆分成 2 篇文章分别叙述，本篇只讨论前 2 个步骤。

#### event_init 函数的实现与相关的数据结构

在了解 `event_int()`函数做了何种操作之前，我们需要了解 event_base、eventop 这两个数据结构，它们都定义在 libevent-2.1.12-stable/event-internal.h 中。其中 event_base 构成了 Reactor 的角色， 而 eventop 则构成了 EventDemultiplexer 角色

```C
/** Structure to define the backend of a given event_base. */
struct eventop {
    //后端 I/O 复用技术的名称
    const char *name;
    
    //初始化函数，返回的指针将会通过 event_init 函数保存到 event_base.evbase 当中，失败返回 nullptr
    void *(*init)(struct event_base *);
    
    //注册事件：events 代表要新添加的事件，而 old 代表 fd 在添加新事件之前的状态。
    int (*add)(struct event_base *, evutil_socket_t fd, short old, short events, void *fdinfo);
    
    //删除事件，参数与 add 函数类似，但是 events 包含了我们想要删除的事件
    int (*del)(struct event_base *, evutil_socket_t fd, short old, short events, void *fdinfo);

    //分派事件：是实现事件循环的核心函数，它会判断被添加的事件是否处于激活状态，并通过 event_io_active 或者其他的方式来为每一个激活事件执行 event_active 函数
    int (*dispatch)(struct event_base *, struct timeval *);
    //从 event_base 中释放相应的资源
    void (*dealloc)(struct event_base *);

    //当 fork 之后是否需要重新初始化
    int need_reinit;
    /*event_method_feature 由EV_FEATURE_ET、EV_FEATURE_O1、EV_FEATURE_FDS 和 EV_FEATURE_EARLY_CLOSE 组成的枚举类型。
    EV_FEATURE_ET：支持边沿触发事件
    EV_FEATURE_O1：要求事件检测算法的事件复杂度O(1)，【select与poll均不在此列】
    EV_FEATURE_FDS：除了监听socket上的事件，还能监听其他类型文件描述符上的事件
    EV_FEATURE_EARLY_CLOSE：允许使用 EV_CLOSED 事件来直接检测关闭的链接，而无需读取全部的数据
    */
    enum event_method_feature features;
    
    //为每个拥有激活事件的 fd 提供额外的内存长度信息
    size_t fdinfo_len;
};

struct event_base {
    //代表所选择的 I/O 复用机制
    const struct eventop *evsel;
    // I/O 复用机制时所存储的数据，由 evsel 的 init 函数来初始化
    void *evbase;

    //事件变化队列，如果一个 fd 上注册的事件被多次修改，则可以使用缓冲来避免重复的系统调用(比如 epoll_ctl)，仅支持时间复杂度为 O(1) 的I/O复用技术
    struct event_changelist changelist;
    
    //代表信号的后端处理机制
    const struct eventop *evsigsel;
    //信号处理器使用的数据结构，其中封装了一个由 socketpair 创建的管道，被运用于信号处理函数和事件多路分发器之间的通信。(统一事件源)
    struct evsig_info sig;
    
    //被添加到该 event_base 的虚拟事件总数、虚拟事件最大值、事件总数、事件总数的上限，激活事件总数以及激活事件总数的上限
    int virtual_event_count;
    int virtual_event_count_max;
    int event_count;
    int event_count_max;
    int event_count_active;
    int event_count_active_max;
    
    //是否执行完活动时间队列上的剩余任务之后就退出事件循环
    int event_gotterm;
    //不管是否还有剩余事件，强制退出事件循环
    int event_break;
    //是否应该启动一个新的事件循环
    int event_continue;
    
    //目前处理的活动事件队列的优先级
    int event_running_priority;
    
    //循环是否已启动
    int running_loop;
    
    /** Set to the number of deferred_cbs we've made 'active' in the
     * loop.  This is a hack to prevent starvation; it would be smarter
     * to just use event_config_set_max_dispatch_interval's max_callbacks
     * feature */
    //用于设置在循环中被设置为激活状态的延迟回调函数的数量
    int n_deferreds_queued;
    
    //活动事件队列数组，索引值越小的队列，优先级越高
    struct evcallback_list *activequeues;
    //活动事件队列数组的大小
    int nactivequeues;
    /** A list of event_callbacks that should become active the next time
     * we process events, but not this time. */
    //稍后活动队列：队列当中存放的是下次应当被激活的事件
    struct evcallback_list active_later_queue;
    
    /* common timeout logic */
    //管理通用定时器队列的一些成员
    struct common_timeout_list **common_timeout_queues;
    //通用定时器队列中的定时器个数
    int n_common_timeouts;
    //通用定时器队列中的总容量
    int n_common_timeouts_allocated;
    
    //fd 与 I/O 事件之间的映射表
    struct event_io_map io;
    
    //信号值和信号事件之间的映射表
    struct event_signal_map sigmap;
    
    //时间堆
    struct min_heap timeheap;
    
    /** Stored timeval: used to avoid calling gettimeofday/clock_gettime
     * too often. */
    struct timeval tv_cache;
    
    struct evutil_monotonic_timer monotonic_timer;
    
    /** Difference between internal time (maybe from clock_gettime) and
     * gettimeofday. */
    struct timeval tv_clock_diff;
    /** Second in which we last updated tv_clock_diff, in monotonic time. */
    time_t last_updated_clock_diff;

//多线程支持
#ifndef EVENT__DISABLE_THREAD_SUPPORT
    //当前运行该 event_base 的事件循环的线程
    unsigned long th_owner_id;
    //event_base 的独占锁
    void *th_base_lock;

    //条件变量，用于唤醒正在等待某个事件处理完毕的线程
    void *current_event_cond;
    
    //正在等待 current_event_cond 的线程数
    int current_event_waiters;
#endif
    //代表当前正在执行的是哪个事件处理器的回调函数
    struct event_callback *current_event;

#ifdef _WIN32
    /** IOCP support structure, if IOCP is enabled. */
    struct event_iocp_port *iocp;
#endif

    /** Flags that this base was configured with */
    enum event_base_config_flag flags;
    
    struct timeval max_dispatch_time;
    int max_dispatch_callbacks;
    int limit_callbacks_after_prio;
    
    //为唤醒主线程提供了相关的变量与方法
    int is_notify_pending;
    evutil_socket_t th_notify_fd[2];
    /** An event used by some th_notify functions to wake up the main
     * thread. */
    struct event th_notify;
    /** A function used to wake up the main thread from another thread. */
    int (*th_notify_fn)(struct event_base *base);

    //伪随机数种子，以在不同的 socket 中实现公平的随机调度
    struct evutil_weakrand_state weakrand_seed;
    
    /** List of event_onces that have not yet fired. */
    LIST_HEAD(once_event_list, event_once) once_events;
};
```

正如先前所提到的那样，Libevent 向用户提供了统一的 I/O 复用接口，屏蔽了底层系统的之间的差异，而这一起都要通过定义在 event.c 文件中的 eventops 数组来实现。在不同的系统下有不同的优先级，对于 Linux 系统而言，默认使用的 I/O 复用技术是 epoll。

```C
//优先级
#ifdef EVENT__HAVE_WORKING_KQUEUE
#include "kqueue-internal.h"
#endif

#ifdef EVENT__HAVE_EVENT_PORTS
extern const struct eventop evportops;
#endif
#ifdef EVENT__HAVE_SELECT
extern const struct eventop selectops;
#endif
#ifdef EVENT__HAVE_POLL
extern const struct eventop pollops;
#endif
#ifdef EVENT__HAVE_EPOLL
extern const struct eventop epollops;
#endif
#ifdef EVENT__HAVE_WORKING_KQUEUE
extern const struct eventop kqops;
#endif
#ifdef EVENT__HAVE_DEVPOLL
extern const struct eventop devpollops;
#endif
#ifdef _WIN32
extern const struct eventop win32ops;
#endif

/* Array of backends in order of preference. */
static const struct eventop *eventops[] = {
#ifdef EVENT__HAVE_EVENT_PORTS
    &evportops,
#endif
#ifdef EVENT__HAVE_WORKING_KQUEUE
    &kqops,
#endif
#ifdef EVENT__HAVE_EPOLL
    &epollops,
#endif
#ifdef EVENT__HAVE_DEVPOLL
    &devpollops,
#endif
#ifdef EVENT__HAVE_POLL
    &pollops,
#endif
#ifdef EVENT__HAVE_SELECT
    &selectops,
#endif
#ifdef _WIN32
    &win32ops,
#endif
    NULL
};
```

`event_init()`定义在 event.c 中，它的主要作用是执行 `event_base_new_with_config(NULL)`来创建一个 event_base 实例并将其保存在全局静态变量 current_base 当中。其中 ``event_base_new_with_config(NULL)`的参数为 NULL 代表根据程序的环境设置相应的 event_base 配置

```C
struct event_base *event_init(void)
{
    struct event_base *base = event_base_new_with_config(NULL);
    if (base == NULL) {
        event_errx(1, "%s: Unable to construct event_base", __func__);
        return NULL;
    }
    //current_base 是一个用于保存全局 event_base 的静态指针
    current_base = base;
    return (base);
}
struct event_base *event_base_new_with_config(const struct event_config *cfg)
{
    int i;
    struct event_base *base;
    int should_check_environment;

#ifndef EVENT__DISABLE_DEBUG_MODE
    event_debug_mode_too_late = 1;
#endif

    if ((base = mm_calloc(1, sizeof(struct event_base))) == NULL) {
        event_warn("%s: calloc", __func__);
        return NULL;
    }

    if (cfg)
        base->flags = cfg->flags;

    should_check_environment =
        !(cfg && (cfg->flags & EVENT_BASE_FLAG_IGNORE_ENV));

    {
        struct timeval tmp;
        int precise_time =
            cfg && (cfg->flags & EVENT_BASE_FLAG_PRECISE_TIMER);
        int flags;
        if (should_check_environment && !precise_time) {
            precise_time = evutil_getenv_("EVENT_PRECISE_TIMER") != NULL;
            if (precise_time) {
                base->flags |= EVENT_BASE_FLAG_PRECISE_TIMER;
            }
        }
        flags = precise_time ? EV_MONOT_PRECISE : 0;
        evutil_configure_monotonic_time_(&base->monotonic_timer, flags);

        gettime(base, &tmp);
    }
    //初始化时间堆
    min_heap_ctor_(&base->timeheap);
    //初始化 base 的 sig 成员中的 Unix 域套接字，为统一事件源的实现做准备
    base->sig.ev_signal_pair[0] = -1;
    base->sig.ev_signal_pair[1] = -1;
    base->th_notify_fd[0] = -1;
    base->th_notify_fd[1] = -1;
    //初始化 event_base 当中的延后活动队列
    TAILQ_INIT(&base->active_later_queue);

    evmap_io_initmap_(&base->io);
    evmap_signal_initmap_(&base->sigmap);
    event_changelist_init_(&base->changelist);

    base->evbase = NULL;

    if (cfg) {
        memcpy(&base->max_dispatch_time,
            &cfg->max_dispatch_interval, sizeof(struct timeval));
        base->limit_callbacks_after_prio =
            cfg->limit_callbacks_after_prio;
    } else {
        base->max_dispatch_time.tv_sec = -1;
        base->limit_callbacks_after_prio = 1;
    }
    if (cfg && cfg->max_dispatch_callbacks >= 0) {
        base->max_dispatch_callbacks = cfg->max_dispatch_callbacks;
    } else {
        base->max_dispatch_callbacks = INT_MAX;
    }
    if (base->max_dispatch_callbacks == INT_MAX &&
        base->max_dispatch_time.tv_sec == -1)
        base->limit_callbacks_after_prio = INT_MAX;
    //遍历 eventops 数组，找到所应当使用的 I/O 复用技术，并将其保存到 base->evsel 中
    for (i = 0; eventops[i] && !base->evbase; i++) {
        if (cfg != NULL) {
            /* determine if this backend should be avoided */
            if (event_config_is_avoided_method(cfg,
                eventops[i]->name))
                continue;
            if ((eventops[i]->features & cfg->require_features)
                != cfg->require_features)
                continue;
        }

        /* also obey the environment variables */
        if (should_check_environment &&
            event_is_method_disabled(eventops[i]->name))
            continue;

        base->evsel = eventops[i];
        //利用多态调用相关的 init 函数进行初始化。例如 Linux 系统下会调用 epoll.c 中的 epoll_init 函数。该函数会创建一个 epoll 对象，成功返回该对象的指针，失败返回 nullptr
        base->evbase = base->evsel->init(base);
    }
    //获取 I/O 复用技术失败，输出警告信息并释放 base 对象
    if (base->evbase == NULL) {
        event_warnx("%s: no event mechanism available",
            __func__);
        base->evsel = NULL;
        event_base_free(base);
        return NULL;
    }
    //如果定义了 EVENT_SHOW_METHOD，则会输出当前后端所选择的 I/O 复用技术的名称，linux下会输出 “epoll”
    if (evutil_getenv_("EVENT_SHOW_METHOD"))
        event_msgx("libevent using: %s", base->evsel->name);

    /* allocate a single active event queue */
    if (event_base_priority_init(base, 1) < 0) {
        event_base_free(base);
        return NULL;
    }

    /* prepare for threading */

#if !defined(EVENT__DISABLE_THREAD_SUPPORT) && !defined(EVENT__DISABLE_DEBUG_MODE)
    event_debug_created_threadable_ctx_ = 1;
#endif

#ifndef EVENT__DISABLE_THREAD_SUPPORT
    if (EVTHREAD_LOCKING_ENABLED() &&
        (!cfg || !(cfg->flags & EVENT_BASE_FLAG_NOLOCK))) {
        int r;
        EVTHREAD_ALLOC_LOCK(base->th_base_lock, 0);
        EVTHREAD_ALLOC_COND(base->current_event_cond);
        r = evthread_make_base_notifiable(base);
        if (r<0) {
            event_warnx("%s: Unable to make base notifiable.", __func__);
            event_base_free(base);
            return NULL;
        }
    }
#endif

#ifdef _WIN32
    if (cfg && (cfg->flags & EVENT_BASE_FLAG_STARTUP_IOCP))
        event_base_start_iocp_(base, cfg->n_cpus_hint);
#endif

    return (base);
}
```

#### 创建具体的事件处理器

在 Linux 服务器编程中，需要考虑的事件通常有三种：I/O 事件、信号以及定时器事件，而 Libevent 中采用了统一事件源的方式，将这三种事件利用 Unix 域套接字和 I/O 复用的系统调用统一转换成为 I/O 事件进行处理。统一对于信号和定时器，通过`socketpair()`创建一对 Unix 域套接字，这对套接字起到了一个全双工管道的作用，当信号或是超时事件发生时，通过管道将信号或超时事件发送至 Reactor 进行处理。

要了解 Libevent 的事件类型，我们需要了解位于 libevent-2.1.12-stable\include\event2\event_struct.h 中的 event 结构体和 event_callback 结构体。

```C
//TAILQ_ENTRY：尾队列中的节点类型
#define TAILQ_ENTRY(type)                       \
struct {                                \
    struct type *tqe_next;  /* next element */          \
    struct type **tqe_prev; /* address of previous next element */  \
}

#define EVLIST_TIMEOUT      0x01    //事件处理器从属于通用定时器队列或时间堆
#define EVLIST_INSERTED     0x02    //事件处理器从属于注册事件队列
#define EVLIST_SIGNAL       0x04    //没有使用
#define EVLIST_ACTIVE       0x08    //事件处理器从属于活动事件队列
#define EVLIST_INTERNAL     0x10    //内部使用
#define EVLIST_ACTIVE_LATER 0x20    
#define EVLIST_FINALIZING   0x40
#define EVLIST_INIT     0x80    //事件处理器已被初始化

struct event_callback {
    TAILQ_ENTRY(event_callback) evcb_active_next;
    short evcb_flags;   //事件标志，可选值定义在上侧，如 EVLIST_TIMEOUT 等
    ev_uint8_t evcb_pri;    //事件处理器优先级，值越小优先级越高
    ev_uint8_t evcb_closure;//代表event_base执行事件处理器的回调函数时的行为
    /* evcb_closure的可选值定义在 event-internal.h 中
       #define EV_CLOSURE_EVENT 0  //默认行为
       #define EV_CLOSURE_EVENT_SIGNAL 1    //将回调函数执行 ev.ev_signal.ev_ncalls 次
       #define EV_CLOSURE_EVENT_PERSIST 2   //执行完回调函数后，再将事件处理器加入到注册事件队列中
       #define EV_CLOSURE_CB_SELF 3         //以 evcb_cb_union.evcb_selfcb 函数作为回调函数
       #define EV_CLOSURE_CB_FINALIZE 4     //以 evcb_cb_union.evcb_cbfinalize 函数作为回调函数
       #define EV_CLOSURE_EVENT_FINALIZE 5  //以 evcb_cb_union.evcb_evfinalize 函数作为回调函数
       #define EV_CLOSURE_EVENT_FINALIZE_FREE 6 //与 EV_CLOSURE_EVENT_FINALIZE 相同，但执行结束后会释放 ev 所占有的资源
     */
    /* allows us to adopt for different types of events */
        union {
        void (*evcb_callback)(evutil_socket_t, short, void *);
        void (*evcb_selfcb)(struct event_callback *, void *);
        void (*evcb_evfinalize)(struct event *, void *);
        void (*evcb_cbfinalize)(struct event_callback *, void *);
    } evcb_cb_union;
    void *evcb_arg; //回调函数参数
};

//event 结构体定义
struct event {
    struct event_callback ev_evcallback;

    /* for managing timeouts */
    union {
        TAILQ_ENTRY(event) ev_next_with_common_timeout; //指出该定时器在通用定时器队列中的位置
        int min_heap_idx;   //定时器在最小堆中的id
    } ev_timeout_pos;   //ev_timeout_pos仅用于定时事件处理器，而一个定时器是否为通用定时器，则由 event.c 中的 is_common_timeout 来判断
    evutil_socket_t ev_fd;  //对于I/O事件处理器而言，它是文件描述符；对于信号处理器而言，它是信号值

    struct event_base *ev_base; //该事件处理器所从属的 event_base 实例
    union {
        /* used for io events */
        struct {
            LIST_ENTRY (event)  ev_io_next //和下一节点相连。该尾队列称之为 I/O 事件队列;  
            struct timeval ev_timeout;  //对定时器有效，代表定时器的超时值
        } ev_io;    //I/O事件队列节点(所有具有相同文件描述符值的I/O事件处理器通过ev_io_next串联而成的尾队列)

        /* used by signal events */
        struct {
            LIST_ENTRY (event) ev_signal_next;  
            short ev_ncalls;    //指定信号发生时，Reactor需要执行多少次对应信号处理器中的回调函数
            /* Allows deletes in callback */
            short *ev_pncalls;  //要么为 nullptr，要么指向ev_ncalls
        } ev_signal;    //信号事件队列节点(所有具有相同信号值的信号事件处理器通过ev_signal_next串联而成的尾队列)
    } ev_;  

    short ev_events;    //代表事件类型，它所能支持的类型定义在 include/event2/event.h
    /*
    #define EV_TIMEOUT  0x01    定时事件
    #define EV_READ     0x02    可读事件
    #define EV_WRITE    0x04    可写事件
    #define EV_SIGNAL   0x08    信号事件
    #define EV_PERSIST  0x10    永久事件
    #define EV_ET       0x20    边缘触发事件
    #define EV_FINALIZE     0x40    在一个线程中以非阻塞形式调用 event_del() 而不管它的回调函数在其他的线程中是否已完成
    #define EV_CLOSED   0x80    连接关闭事件，可直接检测到连接是否关闭而无需读出所有数据
    */
    short ev_res;       //记录了当前激活事件的类型
    struct timeval ev_timeout;
};
```

通过上述对 event 和 event_callback 的定义，我们对它们所起到的作用有了一定的了解。首先对于 event_callback 而言，**它相当于一个 ConcreteEventHadler**，其中主要的两个成员是 evcb_active_next，它指向了活动事件链表中的下一个节点，以及联合体成员 evcb_cb_union，它代表了某一个特定的回调函数。而对于 event 结构体而言，**它相当于一个 EventHadler**，其中主要的成员有具体的事件处理器 ev_evcallback、超时事件ev_timeout_pos、注册事件 ev_（其中包含了 I/O 事件 ev_io 和信号事件 ev_signal)，以及句柄 ev_fd。

一旦了解了事件以及相应的处理器的定义后，我们就需要去看一看如何创建这两个数据结构，并将它们插入到注册事件列表中。event 的创建可以通过定义在 event.c 中的 `event_new()`来创建

```C
//evsignal_new 和 evtimer_new 都是定义在 include/event2/event.h 中的宏,都是调用了 event.c 中的 event_new() 来实现
#define evsignal_new(b, x, cb, arg)             \
    event_new((b), (x), EV_SIGNAL|EV_PERSIST, (cb), (arg))
#define evtimer_new(b, cb, arg)     event_new((b), -1, 0, (cb), (arg))

struct event* event_new(struct event_base *base, evutil_socket_t fd, short events, void (*cb)(evutil_socket_t, short, void *), void *arg)
{
    struct event *ev;
    //分配内存空间
    ev = mm_malloc(sizeof(struct event));
    if (ev == NULL)
        return (NULL);
    //为 ev 进行相关的赋值操作
    if (event_assign(ev, base, fd, events, cb, arg) < 0) {
        mm_free(ev);
        return (NULL);
    }
    return (ev);
}
```

#### 参考资料：

《Linux 高性能服务器编程》 —— 游双著

 《libevent-book》 —— Libevent 上的官方文档

 下篇：[Libevent 源码阅读笔记(二)、从一个简单例子开始(下)](/2020/08/10/Libevent-源码阅读笔记-二-从一个简单例子开始-下/)
