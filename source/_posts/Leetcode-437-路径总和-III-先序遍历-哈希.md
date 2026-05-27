---
title: Leetcode 437. 路径总和 III(先序遍历+哈希)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 19:48:43
password:
summary:
tags: [Leetcode, 先序遍历, 哈希]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树，它的每个结点都存放着一个整数值。
> 
>  找出路径和等于给定数值的路径总数。
> 
>  路径不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。
> 
>  二叉树不超过1000个节点，且节点数值范围是 [-1000000,1000000] 的整数。

## Example

> root = [10,5,-3,3,2,null,11,3,-2,null,1], sum = 8
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/8677e051bb8d/4114134-58947074824ee9da.webp)
> 
> 
> 返回 3。和等于 8 的路径有:
> 
> 
> 1.   5 -> 3
> 2.   5 -> 2 -> 1
> 3.   -3 -> 11

## 题目链接：[437. 路径总和 III (难度：简单)](https://leetcode-cn.com/problems/path-sum-iii/)

## 思路

从题目来看，我们需要完成两个任务，一个是路径求和，另一个则统计。对于路径求和，可以采用先序遍历来实现，而统计则可以利用哈希的方式，将路径和以及出现的次数保存下来。这里有一个注意的点：那就是从当前节点向父节点回溯时，要注意扣掉当前的路径和，以避免对父节点的另一棵子树造成影响。

## 代码

```
class Solution {
public:
    unordered_map<int,int> preSum;
    int getPathSum(TreeNode* root, int sum, int target){
        if(root == NULL) return 0;
        int res = 0;
        sum += root->val;
        int idx = sum - target;
        if(preSum.count(idx)){
            res += preSum[idx];
        }
        ++preSum[sum];
        res += getPathSum(root->left, sum, target);
        res += getPathSum(root->right, sum, target);
        if(--preSum[sum] <= 0)
            preSum.erase(sum);
        return res;
    }
    int pathSum(TreeNode* root, int sum) {
        preSum[0] = 1;
        return  getPathSum(root,0,sum);
    }
};
```

**运行结果：** 24 ms, 20 MB
