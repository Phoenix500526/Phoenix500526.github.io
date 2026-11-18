(() => {
  const storageKey = 'ph-ui-language';
  let language = /^zh\b/i.test(navigator.language || '') ? 'zh-CN' : 'en';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'zh-CN' || saved === 'en') language = saved;
  } catch { /* The switch still works when browser storage is unavailable. */ }

  // Independent quote lists; select once from the visitor's local calendar date.
  // No timer: even a page left open overnight keeps its opening day's quotes.
  const quotes = {
    'zh-CN': [
      '真正的进步，不在于你记住了多少知识，而在于你的直觉发生了怎样的变化',
      '且视他人之疑目如盏盏鬼火，大胆去走你的夜路',
      '虽然行驶缓慢，但我们始终在前行的路上'
    ],
    en: [
      'We should consider every day lost on which we have not danced at least once.',
      'There are dark shadows on the earth, but its lights are stronger in the contrast.',
      "How do I best get to the top of this hill? Climb it, don't think it, and maybe you will."
    ]
  };
  const today = new Date();
  const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const dailyQuotes = Object.fromEntries(Object.entries(quotes).map(([locale, choices]) => {
    // FNV-1a supplies a deterministic daily choice without storage or requests.
    let hash = 2166136261;
    for (const character of `${dayKey}:${locale}`) {
      hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    }
    return [locale, choices[(hash >>> 0) % choices.length]];
  }));

  const english = {
    '首页': 'Home', '分类': 'Categories', '归档': 'Archives', '关于我': 'About Me',
    '文章': 'Articles', '标签': 'Tags', '搜索': 'Search', '目录': 'Contents',
    '界面语言': 'Interface language', '网站导航': 'Site navigation',
    '切换深浅色模式': 'Switch color theme', '日间和夜间模式切换': 'Switch color theme',
    '打开导航菜单': 'Open navigation', '关闭导航菜单': 'Close navigation',
    '关闭 ×': 'Close ×', '关闭目录': 'Close contents', '关闭搜索': 'Close search',
    '搜索文章': 'Search articles', '搜索文章、源码与算法': 'Search articles, code and algorithms',
    '搜索文章、源码与算法…': 'Search articles, code and algorithms…',
    '跳到正文': 'Skip to content', '数据加载中': 'Loading search index',
    '从这里开始': 'Start here', '精选阅读 / Selected notes': 'Selected notes',
    '全部文章': 'All articles', '阅读这篇文章': 'Read this article', '阅读': 'Read',
    '源码阅读 · MUDUO': 'SOURCE NOTES · MUDUO',
    '线程封装与线程局部上下文示意': 'Thread wrapper and thread-local context diagram',
    '每个线程自己的上下文': 'Each thread has its own context',
    'C++ / 从源码到实践': 'C++ / From source to practice',
    '源码阅读系列': 'Source code reading series', '源码阅读': 'Source notes',
    '沿着实现，理解设计': 'Understand the design through the code',
    '网络库的设计与实践': 'Network library design in practice',
    '消息、服务与调度': 'Messages, services and scheduling',
    '事件驱动，从例子开始': 'Event-driven design, by example',
    '其他主题': 'Other topics', '常用标签': 'Popular tags', '网站信息': 'Site info',
    '文章总数': 'Articles', '全站字数': 'Total word count', '访客数': 'Unique visitors',
    '总浏览量': 'Page views', '最近内容更新': 'Last content update',
    '最近一次文章发布或内容更新': 'Most recent article publication or content update',
    '加载中…': 'Loading…', '暂不可用': 'Unavailable', '本地不统计': 'Disabled in preview',
    '博客统计': 'Blog statistics', 'Phoenix 的头像': "Phoenix’s avatar",
    '在 GitHub 关注 Phoenix': 'Follow Phoenix on GitHub', 'Phoenix 的 GitHub': 'Phoenix on GitHub',
    '发送邮件给 Phoenix': 'Email Phoenix', 'Phoenix 的推特': 'Phoenix on Twitter / X',
    'RSS 订阅': 'RSS feed', 'RSS 订阅 ↗': 'RSS feed ↗',
    '唯有热爱可抵岁月漫长': 'Let passion carry you through the years.',
    '热爱可抵岁月漫长': 'Let passion carry you through the years.',
    '当前位置': 'Breadcrumb', '本文目录': 'Contents', '相关笔记': 'Related notes',
    '继续探索': 'Keep exploring', '本系列文章': 'Articles in this series', '正在阅读': 'Reading now',
    '← 返回首页': '← Back to home', '留言与讨论': 'Comments & discussion',
    '写完代码，出去走走。': 'Code done. Time for a walk.',
    '读完一篇，出去走走。': 'A good read. Now, a little walk.',
    '慢慢走，慢慢想': 'Wander. Wonder.',
    '蓝帽小狗的城市散步': 'A city walk with the blue-hat dog',
    '蓝帽小狗沿着有树木、书店和路灯的像素街道散步': 'A blue-hat dog walks past trees, bookshops and streetlights on a pixel-art street',
    '你好，我是 Phoenix。': 'Hi, I’m Phoenix.', '邮箱 ↗': 'Email ↗',
    '我关注分布式系统、AI Agent、数据基础设施与 eBPF。参与开源、解决实际问题，是我学习和理解系统的方式。': 'I work on distributed systems, AI agents, data infrastructure and eBPF. Contributing to open source and solving real problems is how I learn and understand systems.',
    'Phoenix 的蓝帽小狗头像': 'Phoenix’s blue-hat dog avatar',
    '开源贡献分区': 'Open source contribution sections', '开源贡献': 'Open source contributions',
    '分布式系统与共识': 'Distributed systems & consensus', 'AI Agent 系统': 'AI agent systems',
    '数据基础设施': 'Data infrastructure', 'eBPF 与内核': 'eBPF & the kernel', '其他贡献': 'Other contributions',
    'GitHub 上的更多记录 ↗': 'More on GitHub ↗',
    '这页笔记不在这里。': 'This note isn’t here.',
    '可以返回首页，或者使用右上角搜索查找文章。': 'Head back home, or use search to find an article.',
    '复制代码': 'Copy code', '切换代码全屏': 'Toggle full-screen code',
    '展开完整代码': 'Expand code', '收起代码': 'Collapse code',
    '复制成功': 'Copied', '复制失败': 'Copy failed', '浏览器不支持': 'Not supported by this browser',
    '阅读模式': 'Reading mode', '回到顶部': 'Back to top', '前往评论': 'Jump to comments',
    '设置': 'Settings', '单栏和双栏切换': 'Toggle sidebar',
    '上一页': 'Previous page', '下一页': 'Next page', '上一篇': 'Previous', '下一篇': 'Next'
  };
  const patterns = [
    [/^(\d+) 篇笔记 · 按发布日期$/, (_, n) => `${n} notes · By publication date`],
    [/^所属系列 · (.+) 源码阅读$/, (_, name) => `Series · ${name}`],
    [/^查看全部 (\d+) 篇 ([↓→])$/, (_, n, arrow) => `View all ${n} ${arrow}`],
    [/^(.+) · 继续阅读$/, (_, name) => `${name} · Keep reading`],
    [/^全部 (\d+) 篇 ↗$/, (_, n) => `All ${n} articles ↗`],
    [/^作者：(.+) · 转载请注明作者与原文链接。$/, (_, name) => `By ${name} · Please credit the author and link to the original when reposting.`],
    [/^阅读：(.+)$/, (_, title) => `Read: ${title}`],
    [/^全部文章 - (\d+)$/, (_, n) => `All articles - ${n}`],
    [/^分类 - (.+)$/, (_, name) => `Category - ${name}`],
    [/^标签 - (.+)$/, (_, name) => `Tag - ${name}`],
    [/^共找到 (\d+) 篇文章$/, (_, n) => `${n} article${n === '1' ? '' : 's'} found`],
    [/^未找到符合您查询的内容：([\s\S]*)$/, (_, query) => `No results for: ${query}`],
    [/^第 (\d+) 页 \/ 共 (\d+) 页$/, (_, n, total) => `Page ${n} of ${total}`]
  ];
  const translate = value => {
    if (language === 'zh-CN') return value;
    const trimmed = value.trim();
    const translated = english[trimmed] ?? patterns.reduce((result, [pattern, replace]) =>
      result ?? (pattern.test(trimmed) ? trimmed.replace(pattern, replace) : undefined), undefined);
    return translated === undefined ? value : value.replace(trimmed, () => translated);
  };

  // Only interface elements are eligible. Never walk article text, titles,
  // summaries, taxonomy links, the contribution attachment or search results.
  const textSelectors = [
    '#nav .site-page', '#sidebar-menus .menus_item', '#sidebar-menus .headline',
    '.ph-skip', '.ph-section-label', '.ph-lead-copy > .ph-eyebrow',
    '.ph-text-link', '.ph-thread-local small', '.ph-diagram-foot', '.ph-read-link',
    '.ph-author-signature', '.ph-author-stats span', '.ph-topics h2', '.ph-widget-note',
    '.ph-topic small', '.ph-tags h2', '.ph-webinfo h2', '.ph-webinfo dt', '.ph-webinfo dd',
    '.ph-breadcrumb > a:first-child', '.ph-series-entry', '.ph-mobile-toc',
    '.ph-series-reading small', '.ph-article-footer > p', '#comments-title',
    '.ph-walk-heading', '.ph-walk-sign small', '.ph-footer > a',
    '#about-title', '.ph-about-bio', '.ph-about-motto', '.ph-about-links', '.ph-about-nav',
    '.ph-not-found', '.page-title', '.article-sort-title', '.ph-panel-close',
    '#card-toc > .item-headline', '.search-dialog-title', '#loading-database',
    '#local-search-stats', '#pagination .page-number', '#pagination .extend'
  ].join(',');
  const attrSelectors = [
    '#nav [aria-label]', '#nav [title]', '.ph-language-switch', '#sidebar-menus',
    '.ph-panel-close', '.ph-author [aria-label]', '.ph-author img', '.ph-author [title]',
    '.ph-webinfo time', '.ph-thread-diagram', '.ph-mobile-topics', '.ph-read-link',
    '.ph-breadcrumb', '.ph-series-reading', '.ph-city-walk', '.ph-walk-scene',
    '.ph-about-avatar', '.ph-about-nav', '.search-dialog', '.search-close-button',
    '.local-search-input input', '#rightside [title]', '.highlight-tools button', '.code-expand-btn'
  ].join(',');
  const originals = new WeakMap();
  const localize = (node, key, get, set) => {
    const values = originals.get(node) || {};
    const current = get();
    if (!values[key] || current !== values[key].rendered) values[key] = { source: current };
    const rendered = translate(values[key].source);
    values[key].rendered = rendered;
    originals.set(node, values);
    if (current !== rendered) set(rendered);
  };
  const translateText = element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      localize(node, 'text', () => node.nodeValue, value => { node.nodeValue = value; });
    }
  };
  const translateAttributes = element => {
    for (const name of ['aria-label', 'title', 'placeholder', 'alt']) {
      if (element.hasAttribute(name)) localize(element, name, () => element.getAttribute(name), value => element.setAttribute(name, value));
    }
  };
  const syncComments = () => {
    document.querySelector('#giscus-wrap iframe')?.contentWindow.postMessage(
      { giscus: { setConfig: { lang: language } } }, 'https://giscus.app');
  };
  const apply = () => {
    document.documentElement.lang = language;
    const quote = document.querySelector('.ph-daily-quote');
    if (quote && quote.textContent !== dailyQuotes[language]) quote.textContent = dailyQuotes[language];
    document.querySelectorAll(textSelectors).forEach(translateText);
    document.querySelectorAll(attrSelectors).forEach(translateAttributes);
    document.querySelectorAll('[data-ui-language]').forEach(button => {
      button.dataset.uiLanguage = language === 'en' ? 'zh-CN' : 'en';
      const label = language === 'en' ? 'Switch to Chinese' : '切换到英文';
      button.setAttribute('aria-label', label);
      button.title = label;
    });
    if (typeof GLOBAL_CONFIG !== 'undefined') {
      for (const key of Object.keys(GLOBAL_CONFIG.copy || {})) {
        localize(GLOBAL_CONFIG.copy, key, () => GLOBAL_CONFIG.copy[key], value => { GLOBAL_CONFIG.copy[key] = value; });
      }
    }
    syncComments();
  };
  window.phI18n = { get language() { return language; } };
  document.documentElement.lang = language;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ui-language]').forEach(button => button.addEventListener('click', () => {
      language = button.dataset.uiLanguage;
      try { localStorage.setItem(storageKey, language); } catch { /* Session-only choice. */ }
      apply();
    }));
    apply();
    // These widgets replace their own text after requests and user interaction.
    for (const selector of ['.ph-webinfo', '#local-search-stats']) {
      const element = document.querySelector(selector);
      if (element) new MutationObserver(() => {
        element.querySelectorAll('dt, dd, .search-result-stats').forEach(translateText);
      }).observe(element, { childList: true, characterData: true, subtree: true });
    }
    document.querySelectorAll('.code-expand-btn').forEach(button => {
      new MutationObserver(() => translateAttributes(button)).observe(button, { attributes: true, attributeFilter: ['aria-label'] });
    });
    const wrap = document.getElementById('giscus-wrap');
    const bindComments = () => {
      const iframe = wrap?.querySelector('iframe');
      if (iframe && !iframe.dataset.phLanguageBound) {
        iframe.dataset.phLanguageBound = 'true';
        iframe.addEventListener('load', syncComments);
      }
    };
    bindComments();
    if (wrap) new MutationObserver(bindComments).observe(wrap, { childList: true, subtree: true });
  });
})();
