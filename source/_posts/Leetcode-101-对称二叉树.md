---
title: Leetcode 101. 对称二叉树
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 22:42:48
password:
summary:
tags: [Leetcode, 二叉树]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树，检查它是否是镜像对称的。

## Example

> 例如，二叉树 [1,2,2,3,4,4,3] 是对称的。
> 
> 
> 
> 
> 
> ![Image 2](/img/jianshu-imports/6265008379b0/4114134-ce2267e1057b0822.webp)
> 
> 
> 但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的:
> 
> 
> 
> 
> 
> ![Image 3](/img/jianshu-imports/6265008379b0/4114134-15f30389f56784cd.webp)

## 题目链接：[101. 对称二叉树 (难度:简单)](https://leetcode-cn.com/problems/symmetric-tree/)

## 思路

从题目的表述当中，我们可以看出镜像对称其实是一种符合递归性质的定义，可以得出如下的递归模型:

> 设 f(root) 为判断 root 是否是镜像对称的函数，则有如下情况：
> 
> 
> *   若 root 为 nullptr 或者 root 为叶子节点，则显然 root 是镜像对称的
> *   若 root 非空，且不是叶子节点，则显然 root 为镜像对称当且仅当root->left 与 root->right 是镜像对称的

现在我们已经有了主体的递归模型了，接下来还需一个能够判断两棵树是否相互对称的递归模型，模型如下：

> 设 f(root1, root2) 为判断 root1 和 root2 是否对称的函数，则有
> 
> 
> *   若 root1 和 root2 均为 nullptr，则 root1 与 root2 对称
> *   若 root1 和 root2 仅有一个为 nullptr，则 root1 与 root2 不对称
> *   若 root1->val ≠ root2->val，则 root1 与 root2 不对称
> *   若 root1->val == root2->val, 则判断 root1->left 是否与 root2->right 相同且 root1->right 是否与 root2->left 是否相同

## 代码

```
class Solution {
public:
    bool isSymmetricHelper(TreeNode* ltree, TreeNode* rtree){
        if(ltree == NULL && rtree == NULL)
            return true;
        else if(ltree == NULL || rtree == NULL)
            return false;
        else{
            if(ltree->val != rtree->val)
                return false;
            else
                return isSymmetricHelper(ltree->left, rtree->right) && isSymmetricHelper(ltree->right, rtree->left);
        }
    }
    bool isSymmetric(TreeNode* root) {
        if(root == NULL || (root->left == NULL && root->right == NULL))
            return true;
        else if(root->left == NULL || root->right == NULL)
            return false;
        else
            return isSymmetricHelper(root->left, root->right);
    }
};
```

**执行结果：**8 ms, 12.5 MB
