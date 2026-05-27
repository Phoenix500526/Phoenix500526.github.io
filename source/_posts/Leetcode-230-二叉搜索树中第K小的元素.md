---
title: Leetcode 230. 二叉搜索树中第K小的元素
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 21:30:58
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉搜索树，编写一个函数 kthSmallest 来查找其中第 k 个最小的元素。
> 
>  说明：
> 
>  你可以假设 k 总是有效的，1 ≤ k ≤ 二叉搜索树元素个数。

## Example

> 输入：root = [3,1,4,null,2], k = 1
> 
>  输出：1
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/bd45896b6882/4114134-f0e8a0f5c62adb04.webp)

## 题目链接：[230. 二叉搜索树中第K小的元素](https://leetcode-cn.com/problems/kth-smallest-element-in-a-bst/)

## 思路

直接对 BST 进行中序遍历，然后输出第 k 个节点即可

## 代码

```C++
class Solution {
public:
    bool inorder(TreeNode* root, int& pre, int& k){
        if(root == NULL)
            return false;
        if(inorder(root->left, pre, k))
            return true;
        pre = root->val;
        if(--k == 0)
            return true;
        return inorder(root->right,pre, k);
    }
    int kthSmallest(TreeNode* root, int k) {
        int ans = INT_MIN;
        inorder(root, ans, k);
        return ans;
    }
};
```

**执行结果：**36 ms, 24.1 MB
