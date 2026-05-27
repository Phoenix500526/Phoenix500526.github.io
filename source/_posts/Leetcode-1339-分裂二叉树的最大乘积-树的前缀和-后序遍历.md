---
title: Leetcode 1339. 分裂二叉树的最大乘积(树的前缀和 + 后序遍历)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-21 19:08:44
password:
summary:
tags: [Leetcode, 树的前缀和, 后序遍历]
categories: 算法笔记
---

## 问题描述

> 给你一棵二叉树，它的根为 root 。请你删除 1 条边，使二叉树分裂成两棵子树，且它们子树和的乘积尽可能大。
> 
>  由于答案可能会很大，请你将结果对 10^9 + 7 取模后再返回。

## Example

> ![](/img/jianshu-imports/efbd6bb0cd26/4114134-51a00bee94b6808f.webp)
> 
> 
> 输入：root = [1,2,3,4,5,6]
> 
>  输出：110
> 
>  解释：删除红色的边，得到 2 棵子树，和分别为 11 和 10 。它们的乘积是 110 （11*10）

## 题目链接：[1339. 分裂二叉树的最大乘积 (难度:中等)](https://leetcode-cn.com/problems/maximum-product-of-splitted-binary-tree/)

## 思路

这个问题的一个关键是如何计算删除边后的两棵子树和。这里可以采用前缀和的思想，比如假设整棵二叉树的和为 total, 则将 root 和 root->left 之间的边删除后，root 所在的子树和 = total - 以 root->left 为根节点的子树和。因此，我们可以使用先序遍历先求出 total，然后利用后序遍历枚举所有的子树和，同时记录最大积。这里要注意的是，**使用 max 的时候不要进行取模操作，因为大的数取模后未必比小的数要大。因此我们用 long long 保存结果，并对最终结果进行取模。**

## 代码：

```C++
class Solution {
public:
    static const int MOD = (int)1e9 + 7;
    long long ans = LLONG_MIN;
    long long Sum(TreeNode* root){
        if(root == NULL)
            return 0;
        return root->val + Sum(root->left) + Sum(root->right);
    }
    long long helper(TreeNode* root, long long total){
        if(root == NULL)
            return 0;
        long long l_sum = helper(root->left, total);
        long long r_sum = helper(root->right, total);
        long long l_product = (total - l_sum) * l_sum;
        long long r_product = (total - r_sum) * r_sum;
        ans = max(ans, max(l_product, r_product));
        return root->val + l_sum + r_sum;
    }
    int maxProduct(TreeNode* root) {
        long long total = Sum(root);
        helper(root, total);
        return ans % MOD;
    }
};
```

**执行结果：**260ms, 88.7 MB
