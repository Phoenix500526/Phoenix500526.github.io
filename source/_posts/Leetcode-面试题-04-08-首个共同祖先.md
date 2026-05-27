---
title: Leetcode 面试题 04.08. 首个共同祖先
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-21 15:53:04
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 设计并实现一个算法，找出二叉树中某两个节点的第一个共同祖先。不得将其他的节点存储在另外的数据结构中。注意：这不一定是二叉搜索树。
> 
>  注：一个节点的公共祖先可以是它本身

## Example

> ![](/img/jianshu-imports/ef853ff9f6de/4114134-6c58542851be01ee.webp)
> 
> 
> 示例1
> 
>  输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
> 
>  输出: 3
> 
>  解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
> 
>  示例2
> 
>  输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
> 
>  输出: 5
> 
>  解释: 节点 5 和节点 4 的最近公共祖先是节点 5。因为根据定义最近公共祖先节点可以为节点本身。

## 题目链接：[面试题 04.08. 首个共同祖先 (难度：中等)](https://leetcode-cn.com/problems/first-common-ancestor-lcci/)

## 思路

对于这个问题，我们可以将其分为两种情况：

*   p 和 q 之间不存在祖先关系，这是公共祖先的基本情况
*   p 和 q 之间存在祖先关系，则 p 或 q 为公共祖先

根据这两种情况，我们提取递归模型：

> 设 f(root, p, q) 代表 root 中 p 和 q 的首个公共祖先，则有
> 
> 
> 1.   当 f(root->left, p, q) && f(root->right, p, q) 成立，显然此时 root 为公共祖先
> 2.   当 f(root->left, p, q) || f(root->right, p, q) 成立，则 p 为 q 的祖先或 q 为 p 的祖先，返回首个访问到的节点。
> 3.   当 f(root->left, p, q) 和 f(root->right, p, q) 均为 NULL，说明 p 和 q 均不在 root 中，返回 NULL

## 代码

```
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if(root == NULL)
            return NULL;
        TreeNode* l_tree = lowestCommonAncestor(root->left, p, q);
        TreeNode* r_tree = lowestCommonAncestor(root->right, p, q);
        if(root == p || root == q)
            return root;
        if(l_tree && r_tree)
            return root;
        else if(l_tree || r_tree)
            return l_tree ? l_tree : r_tree;
        return NULL;
    }
};
```

**执行结果：** 20 ms，14.4 MB
