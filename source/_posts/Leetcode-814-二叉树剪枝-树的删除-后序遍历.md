---
title: Leetcode 814. 二叉树剪枝(树的删除+后序遍历)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 21:51:36
password:
summary:
tags: [Leetcode, 树的删除, 后序遍历]
categories: 算法笔记
---

## 问题描述

> 给定二叉树根结点 root ，此外树的每个结点的值要么是 0，要么是 1。
> 
>  返回移除了所有不包含 1 的子树的原二叉树。
> 
>  ( 节点 X 的子树为 X 本身，以及所有 X 的后代。)

## Example

> 示例:
> 
>  输入: [1,1,0,1,1,0,1,0]
> 
>  输出: [1,1,0,1,1,null,1]
> 
>  解释:
> 
>  只有红色节点满足条件“所有不包含 1 的子树”。
> 
>  右图为返回的答案。
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/84159290dc80/4114134-2fe70bb54f506012.webp)

## Note

> *   给定的二叉树最多有 100 个节点。
> *   每个节点的值只会为 0 或 1 。

## 题目链接：[814. 二叉树剪枝 (难度:中等)](https://leetcode-cn.com/problems/binary-tree-pruning/)

## 思路

题目的要求其实就是要你递归地删除所有值为 0 的叶子节点。显然如果一棵树中不包含值为 1 的节点，则递归删除值为 0 的叶子节点最终会删除掉这一整棵树。若一棵树中包含值为 1 的节点，则该节点的所有祖先节点哪怕值为 0 也不会被删除(因为它破坏了叶节点这个条件)。

## 代码

```
class Solution {
public:
    TreeNode* pruneTree(TreeNode* root) {
        if(root == NULL)
            return NULL;
        root->left = pruneTree(root->left);
        root->right = pruneTree(root->right);
        return root->val == 0 && root->left == NULL && root->right == NULL ? NULL : root;
    }
};
```

**执行结果：** 4 ms 9.5 MB
