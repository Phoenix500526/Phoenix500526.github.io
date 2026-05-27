---
title: Leetcode 113. 路径总和 II(先序遍历)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 20:09:53
password:
summary:
tags: [Leetcode, 先序遍历]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树和一个目标和，找到所有从根节点到叶子节点路径总和等于给定目标和的路径。

## Example

> 给定如下二叉树，以及目标和 sum = 22，
> 
> ![](/img/jianshu-imports/f36eb3f4702c/4114134-3a5309e3888c3945.webp)
> 
> 
> 返回：
> 
>  [
> 
>  [5,4,11,2],
> 
>  [5,8,4,5]
> 
>  ]

## 题目链接：[113. 路径总和 II (难度:中等)](https://leetcode-cn.com/problems/path-sum-ii/)

## 思路

采用先序遍历对所有路径求和，如果dang'qian

## 代码

```C++
class Solution {
public:
    vector<vector<int>> pathSum(TreeNode* root, int sum) {
        vector<vector<int>> path;
        vector<int> tmp;
        pathSum(root,sum,tmp,path);
        return path;
    }
    void pathSum(TreeNode* root,int sum,vector<int> &tmp,vector<vector<int>> &path){
        if(!root)
            return;
        if(!root->left && !root->right && root->val == sum){
            tmp.push_back(root->val);
            path.push_back(tmp);
            tmp.pop_back();
            return;
        }
        tmp.push_back(root->val);
        pathSum(root->left,sum - root->val,tmp,path);
        pathSum(root->right,sum - root->val,tmp,path);
        tmp.pop_back();
    }
};
```

**执行结果：** 8 ms, 20 MB
