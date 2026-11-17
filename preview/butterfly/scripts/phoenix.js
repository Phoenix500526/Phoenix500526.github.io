'use strict';

const { stripHTML } = require('hexo-util');
const featuredTitles = [
  '对 muduo 网络库中的线程模型的思考与实践',
  'skynet 源码阅读笔记 —— 消息调度机制',
  '关于 C++ 智能指针的那些事'
];
const editorial = {
  [featuredTitles[0]]: { summary: '从线程标识与线程局部存储出发，分析 muduo 的线程模型，并尝试用 C++ 标准线程库重新实现。' },
  [featuredTitles[1]]: { summary: '沿着一条消息的旅程，理解二级消息队列、服务调度与 skynet 的多线程模型。', cover: '/img/skynet-message-queue/two-level-queue.svg' },
  [featuredTitles[2]]: { summary: '从所有权、引用计数到循环引用，梳理智能指针的实现，以及使用时容易忽视的细节。', cover: '/img/smart-pointers/shared-ptr-layout.svg' },
  'C++并发编程之内存模型': { summary: '理解可见性、指令重排与内存序：从硬件行为走向 C++ 并发程序的正确性。', cover: '/img/memory-model/multi-core-cache.svg' },
  '对 muduo 网络库中的进程监控方法的思考与实践': { summary: '从 HTTP 入口到运行时状态，探索 muduo 如何为服务提供可观察、可扩展的进程监控。', cover: '/img/muduo-inspect/http-inspector.svg' },
  '关于 C++ 的 lvalue、xvalue 和 prvalue': { cover: '/img/value-categories/expression-category-taxonomy.svg' }
};
const topics = [
  { name: 'muduo源码剖析', label: 'muduo', description: '网络库的设计与实践', series: true },
  { name: 'skynet源码剖析', label: 'skynet', description: '消息、服务与调度', series: true },
  { name: 'Libevent源码阅读笔记', label: 'Libevent', description: '事件驱动，从例子开始', series: true },
  { name: '算法笔记', label: '算法笔记', description: '拆解问题，理解方法' },
  { name: 'C++沉思录', label: 'C++ 沉思录', description: '语言机制与工程思考' },
  { name: '瑞士军刀', label: '工具笔记', description: '开发工具与方法' },
  { name: '学而时嬉之', label: '学习与生活', description: '技术之外的思考' }
];

hexo.extend.filter.register('before_post_render', data => {
  data.mathjax = /\$\$|\$[^\n$]+\$/.test(data.content);
  return data;
});

// This theme has its own preview database; source Markdown is never rewritten.
hexo.extend.filter.register('before_generate', async () => {
  const categoryModel = hexo.model('Category');
  const typo = categoryModel.findOne({ name: 'skynet码剖析' });
  if (!typo) return;
  for (const post of typo.posts.toArray()) await post.setCategories(['skynet源码剖析']);
  await categoryModel.removeById(typo._id);
});

hexo.extend.generator.register('phoenix-tags', () => ({
  path: 'tags/index.html', layout: 'page', data: { title: '标签', type: 'tags', comments: false }
}));
hexo.extend.generator.register('phoenix-categories', () => ({
  path: 'categories/index.html', layout: 'page', data: { title: '分类', type: 'categories', comments: false }
}));

hexo.extend.helper.register('ph_featured', function () {
  const posts = this.site.posts.toArray();
  return featuredTitles.map(title => posts.find(post => post.title === title)).filter(Boolean);
});
hexo.extend.helper.register('ph_summary', function (post) {
  if (editorial[post.title]?.summary) return editorial[post.title].summary;
  const text = stripHTML(post.excerpt || post.content || '').replace(/\s+/g, ' ').replace(/^(文前导读|问题描述|题目描述)\s*/, '').trim();
  return text.length > 145 ? text.slice(0, 145) + '…' : text;
});
hexo.extend.helper.register('ph_cover', post => editorial[post.title]?.cover || null);
hexo.extend.helper.register('ph_topics', function () {
  return topics.map(topic => {
    const category = this.site.categories.findOne({ name: topic.name });
    return category && { ...topic, path: category.path, count: category.length };
  }).filter(Boolean);
});
hexo.extend.helper.register('ph_series', function (post) {
  const names = post.categories.toArray().map(category => category.name);
  const topic = topics.find(topic => topic.series && names.includes(topic.name));
  if (!topic) return null;
  const category = this.site.categories.findOne({ name: topic.name });
  return { ...topic, path: category.path, posts: category.posts.sort('date', 1).toArray() };
});
hexo.extend.helper.register('ph_related', function (post) {
  const tags = new Set(post.tags.toArray().map(tag => tag.name));
  return this.site.posts.toArray().filter(candidate => candidate.path !== post.path)
    .map(candidate => ({ post: candidate, score: candidate.tags.toArray().filter(tag => tags.has(tag.name)).length }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.post);
});
