---
title: Leetcode 1367. 二叉树中的列表(树的匹配问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-16 14:35:16
password:
summary:
tags: [Leetcode, 树的匹配问题]
categories: 算法笔记
---

## 问题描述

> 给你一棵以 root 为根的二叉树和一个 head 为第一个节点的链表。
> 
>  如果在二叉树中，存在一条一直向下的路径，且每个点的数值恰好一一对应以 head 为首的链表中每个节点的值，那么请你返回 True ，否则返回 False 。
> 
>  一直向下的路径的意思是：从树中某个节点开始，一直连续向下的路径。

## Example

> ![](/img/jianshu-imports/4d22e4581456/4114134-2351bb7f48fd128e.webp)
> 
> 
> 输入：head = [4,2,8], root = [1,4,4,null,2,2,null,1,null,6,8,null,null,null,null,1,3]
> 
>  输出：true
> 
>  解释：树中蓝色的节点构成了与链表对应的子路径。

## Note

> *   二叉树和链表中的每个节点的值都满足 1 <= node.val <= 100 。
> *   链表包含的节点数目在 1 到 100 之间。
> *   二叉树包含的节点数目在 1 到 2500 之间。

## 题目链接：[1367. 二叉树中的列表 (难度:中等)](https://leetcode-cn.com/problems/linked-list-in-binary-tree/)

## 思路

为了完成二叉树和链表的匹配任务，我们需要对 root 中的每一棵子树进行匹配。因此，我们需要实现两个函数，一个用于匹配当前以 root 为根的子树 (helper)，另一个函数用于枚举整棵树中的所有子树(isSubPath)。由于路径本身指定了从上到下，这两个函数均采用先序遍历的方式进行处理

## 代码

```
class Solution {
public:
    bool helper(ListNode* head, TreeNode* root){
        if(head == NULL)
            return true;
        if(root == NULL)
            return false;
        if(root->val == head->val){
            return helper(head->next, root->left) || helper(head->next, root->right);
        }
        return false;
    }
    bool isSubPath(ListNode* head, TreeNode* root) {
        if(head == NULL)
            return true;
        if(root == NULL)
            return false;
        if(helper(head, root))
            return true;
        return isSubPath(head, root->left) || isSubPath(head, root->right);
    }
};
```

**执行结果：** 52 ms， 22.1 MB

## 相关习题：[面试题26. 树的子结构](https://leetcode-cn.com/problems/shu-de-zi-jie-gou-lcof/)
