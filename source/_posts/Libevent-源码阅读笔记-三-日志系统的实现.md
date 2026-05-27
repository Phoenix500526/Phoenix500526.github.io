---
title: Libevent 源码阅读笔记(三)、日志系统的实现
top: false
cover: false
toc: true
mathjax: true
date: 2020-08-11 14:59:57
password:
summary:
tags: [Libevent, C, 日志系统]
categories: Libevent源码阅读笔记
---

#### Libevent 如何定义自己的日志输出格式

Libevent 的日志系统中定义了四个日志的输出等级，默认情况下会将日志信息输出到终端。不过 Libevent 允许用户设置自定义的日志输出回调函数以及异常日志输出函数，以提供日志信息的进一步解释和输出重定向。回调函数的指针定义如下：

```C
//event.h
//日志输出等级
#define EVENT_LOG_DEBUG 0   
#define EVENT_LOG_MSG   1
#define EVENT_LOG_WARN  2
#define EVENT_LOG_ERR   3
//用户自定义的日志输出回调函数，其中 severity 代表日志输出等级
typedef void (*event_log_cb)(int severity, const char *msg);
typedef void (*event_fatal_cb)(int err);
```

Libevent 默认将这两个回调函数置为 NULL，用户可以通过函数`event_set_log_callback`和`event_set_fatal_callback`进行设置

```C
//log.c
static event_log_cb log_fn = NULL;
void event_set_log_callback(event_log_cb cb)
{
    log_fn = cb;
}
static event_fatal_cb fatal_fn = NULL;
void event_set_fatal_callback(event_fatal_cb cb)
{
    fatal_fn = cb;
}
```

若用户没有自定义日志输出函数，那么 Libevent 会根据 severity 的值调用相应的默认日志输出函数，并向 stderr 输出日志信息。具体的实现如下：

```C
//log.c
static void event_log(int severity, const char *msg)
{
    if (log_fn)
        log_fn(severity, msg);
    else {
        const char *severity_str;
        switch (severity) {
        case EVENT_LOG_DEBUG:
            severity_str = "debug";
            break;
        case EVENT_LOG_MSG:
            severity_str = "msg";
            break;
        case EVENT_LOG_WARN:
            severity_str = "warn";
            break;
        case EVENT_LOG_ERR:
            severity_str = "err";
            break;
        default:
            severity_str = "???";
            break;
        }
        //(void)的作用是减少编译器因为“未被使用的返回值”而产生的警告信息。
        (void)fprintf(stderr, "[%s] %s\n", severity_str, msg);
    }
}

static void event_exit(int errcode)
{
    if (fatal_fn) {
        fatal_fn(errcode);
        exit(errcode); /* should never be reached */
    } else if (errcode == EVENT_ERR_ABORT_)
        abort();
    else
        exit(errcode);
}
```

#### 日志系统的底层函数

看完了 Libevent 的日志系统留给用户的两个接口定义后，我们可以来看看 Libevent 默认的日志输出函数。在源码当中，日志系统相关的文件主要有两个: log.c 和 log-internal.h。我们先来看 log-internal.h 文件

```C
// log-internal.h 
#ifdef __GNUC__
#define EV_CHECK_FMT(a,b) __attribute__((format(printf, a, b)))
#define EV_NORETURN __attribute__((noreturn))
#else
#define EV_CHECK_FMT(a,b)
#define EV_NORETURN
#endif

//EVENT_DEBUG_LOGGING_ENABLED 为调试模式的开关
#ifdef EVENT_DEBUG_LOGGING_ENABLED
EVENT2_CORE_EXPORT_SYMBOL extern ev_uint32_t event_debug_logging_mask_;
#define event_debug_get_logging_mask_() (event_debug_logging_mask_)
#else
#define event_debug_get_logging_mask_() (0)
#endif

//EVENT_ERR_ABORT_ 代表终止程序时的错误码
#define EVENT_ERR_ABORT_ ((int)0xdeaddead)

/* EVENT2_EXPORT_SYMBOL是定义在 include/event2/visibility.h 下的一个宏
 * define EVENT2_EXPORT_SYMBOL __attribute__ ((visibility("default")))
 */
EVENT2_EXPORT_SYMBOL
void event_err(int eval, const char *fmt, ...) EV_CHECK_FMT(2,3) EV_NORETURN;
EVENT2_EXPORT_SYMBOL
void event_warn(const char *fmt, ...) EV_CHECK_FMT(1,2);
EVENT2_EXPORT_SYMBOL
void event_sock_err(int eval, evutil_socket_t sock, const char *fmt, ...) EV_CHECK_FMT(3,4) EV_NORETURN;
EVENT2_EXPORT_SYMBOL
void event_sock_warn(evutil_socket_t sock, const char *fmt, ...) EV_CHECK_FMT(2,3);
EVENT2_EXPORT_SYMBOL
void event_errx(int eval, const char *fmt, ...) EV_CHECK_FMT(2,3) EV_NORETURN;
EVENT2_EXPORT_SYMBOL
void event_warnx(const char *fmt, ...) EV_CHECK_FMT(1,2);
EVENT2_EXPORT_SYMBOL
void event_msgx(const char *fmt, ...) EV_CHECK_FMT(1,2);
EVENT2_EXPORT_SYMBOL
void event_debugx_(const char *fmt, ...) EV_CHECK_FMT(1,2);

EVENT2_EXPORT_SYMBOL
void event_logv_(int severity, const char *errstr, const char *fmt, va_list ap)
    EV_CHECK_FMT(3,0);
```

在 log-internal.h 中，我们可以看到 Libevent 中的日志系统其实运用到了编译器属性 __attribute__ 的一些技巧。

__attribute__ 是 GNU C 下的一种机制，可以用来设置函数属性、变量属性以及类型属性，它的语法格式如下

```C
__attribute__((attribute-list))
```

其中 attribute-list 是用逗号分隔开的列表。在 Libevent 的日志系统中，主要应用到的有以下三种 __attribute__ 属性：

**1. __attribute__((format(archetype, string-index, first-to-check)))**

该属性可以为函数添加上类似于 print、scanf、strftime 以及 strfmon 风格的格式化字符串，从而可以帮助我们完成对格式化字符串的类型检查。其中，archetype 代表参数的格式化风格，string-index 代表格式化字符串位于形参列表中的哪个位置，first-to-check 代表可变参数列表在形参列表中的哪个位置。结合一个 event_warn 的例子：

void event_warn(const char *fmt, ...) __attribute__((format(printf, 1, 2)));

__attribute__((format(printf, 1, 2))) 代表按照 printf 的风格检查格式化字符串，其中参数列表的第 1 个参数代表格式化字符串，第 2 个参数代表可变参数列表。

**2. __attribute__((noreturn))**

noreturn 是一个函数属性，用来通知编译器该函数在执行后不会将**控制权**返回给它的调用者。以函数 `event_err`为例，当程序使用该日志函数时，说明程序已然产生了严重的错误，不能再继续执行下去，除了抛出异常，或者调用如`exit()`或`abort()`函数终止程序以外，可以利用 noreturn 来处理。当函数执行 event_err 时，主程序会将控制权交给 event_err 函数，当 event_err 执行完毕后，控制流将不会返回主程序，而是停留在此处。

**3. __attribute__ ((visibility("default")))**

visibility属性可以将从动态库中导出可见符号，default 代表可见，而 hidden 代表隐藏。新版本的 Linux 内核限制了动态库的符号可见性，因为这样做可以提高程序的模块性，同时动态库装载和识别的符号越少，程序启动和运行的速度也就越快。Libevent 中被 EVENT2_EXPORT_SYMBOL 修饰的函数符号都将会被导出，因此使用该动态库程序都可以使用到这些函数。

对于`event_err`，`event_sock_err`，`event_debugx_`等函数，它们的实现大同小异，区别仅是部分参数的不同，以下选取部分函数进行讨论

```C
void event_err(int eval, const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    event_logv_(EVENT_LOG_ERR, strerror(errno), fmt, ap);
    va_end(ap);
    event_exit(eval);
}

void event_sock_err(int eval, evutil_socket_t sock, const char *fmt, ...)
{
    va_list ap;
    int err = evutil_socket_geterror(sock);

    va_start(ap, fmt);
    event_logv_(EVENT_LOG_ERR, evutil_socket_error_to_string(err), fmt, ap);
    va_end(ap);
    event_exit(eval);
}

void event_debugx_(const char *fmt, ...)
{
    va_list ap;

    va_start(ap, fmt);
    event_logv_(EVENT_LOG_DEBUG, NULL, fmt, ap);
    va_end(ap);
}

void event_logv_(int severity, const char *errstr, const char *fmt, va_list ap)
{
    char buf[1024];
    size_t len;
    //当 event_debug_get_logging_mask_() == 0 时关闭调试日志的输出
    if (severity == EVENT_LOG_DEBUG && !event_debug_get_logging_mask_())
        return;

    if (fmt != NULL)
        //将日志信息按照格式字符串进行格式化，并存入 buf 中
        evutil_vsnprintf(buf, sizeof(buf), fmt, ap);
    else
        buf[0] = '\0';
    //若有额外的错误信息，则将其一起放入 buf 
    if (errstr) {
        len = strlen(buf);
        if (len < sizeof(buf) - 3) {
            evutil_snprintf(buf + len, sizeof(buf) - len, ": %s", errstr);
        }
    }

    event_log(severity, buf);
}
```

上述的日志函数大体的结构是相同的，都采用了可变参数列表的形式实现，最终通过`event_logv_`以及`event_log`两个函数将日志输出。

#### 一些语法糖

在 log-internal.h 当中还定义了一个 `event_debug` 的宏，可以用于在调试期间打印出调试信息。利用这个宏来代替`event_debugx_`函数，一方面可以使得调试语义更加清晰，另一方面也可以非常方便地实现调试模式的开关。它的定义如下：

```C
#ifdef EVENT_DEBUG_LOGGING_ENABLED
#define event_debug(x) do {         \
    if (event_debug_get_logging_mask_()) {  \
        event_debugx_ x;        \
    }                   \
    } while (0)
#else
#define event_debug(x) ((void)0)
#endif
```

#### 总结

1.   Libevent 的日志系统为用户提供了两个接口`event_log_cb`和`event_fatal_cb`，以便用户实现自定义的日志处理功能，在需要的时候可以使用`event_set_log_callback`和`event_set_fatal_callback`进行设置
2.   如果用户没有定义自己的日志处理回调函数，则采用 Libevent 默认的日志处理系统，它将日志输出等级定义为四个，并会将日志输出到终端。
3.   在日志系统的开发过程当中，利用好 GNU C 的一些机制，如 __attribute__ 等，可以极大简化一些繁琐的检查过程，不仅有利于调试，帮助找到一些难以发现的错误，还有助于编译器进行优化。
