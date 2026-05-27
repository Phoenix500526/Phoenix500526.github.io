---
title: Leetcode 1080. 根到叶路径上的不足节点(后序遍历 + 树的删除问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-16 20:58:09
password:
summary:
tags: [Leetcode, 后序遍历, 树的删除问题]
categories: 算法笔记
---

## 问题描述

> 给定一棵二叉树的根 root，请你考虑它所有 从根到叶的路径：从根到任何叶的路径。（所谓一个叶子节点，就是一个没有子节点的节点）
> 
>  假如通过节点 node 的每种可能的 “根-叶” 路径上值的总和全都小于给定的 limit，则该节点被称之为「不足节点」，需要被删除。
> 
>  请你删除所有不足节点，并返回生成的二叉树的根。

## Example

> 示例1
> 
> ![](/img/jianshu-imports/76bb293143af/4114134-6ad0274d544f4666.webp)
> 
> 
> 输入
> 
> 
> 输入：root = [1,2,3,4,-99,-99,7,8,9,-99,-99,12,13,-99,14], limit = 1
> 
>  输出：[1,2,3,4,null,null,7,8,9,null,14]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/76bb293143af/4114134-b67a3745b0cb416c.webp)
> 
> 
> 输出

> 示例2
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/76bb293143af/4114134-b7bbfbfe540bc3cf.webp)
> 
> 
> 输入
> 
> 
> 输入：root = [5,-6,-6], limit = 0
> 
>  输出：[]

## 题目链接：[1080. 根到叶路径上的不足节点 (难度:中等)](https://leetcode-cn.com/problems/insufficient-nodes-in-root-to-leaf-paths/)

## 思路

对于二叉树的删除，我们一般有两种方式：

> *   利用父节点对左右孩子进行删除
> *   直接删除自身并返回(需要采用引用的方式删除)

从测试用例 2 上，我们可以看出**在某些情况下，连根节点都是需要删除的**。由于根节点没有父节点，故我们采用第二种方式，利用回溯的方式删除自身节点。同时为了避免像链表一样出现断链，我们采用**后序遍历**的方式进行删除。既然已经明确题目的主要任务(删除节点)以及删除方式后，接下来只需要找到删除的规则即可解决问题。

 不妨假设函数 bool dfs(X, sum, limit) 为判断 root 是否为不足节点的函数，其中 sum 记录从根节点 root 到 X 的父结点的路径和，显然若出现以下三种情况，则应当删除：

 1、若 X 的左孩子节点是不足节点，且右孩子也是不足节点，则 X 也是不足节点

 2、若 X 的左孩子节点是不足节点，且右孩子为空，则 X 也是不足节点

 3、若 X 的左孩子为空，且右孩子是不足节点，则 X 也是不足节点

 递归的 Base Case 为：若 X == NULL 则返回 sum < limit

## 代码

```C++
class Solution {
public:
    bool dfs(TreeNode* &root, int sum, int limit){
        if(root == NULL)
            return sum < limit;
        bool l_tree = dfs(root->left, sum + root->val, limit);
        if(l_tree && root->right == NULL){
            root = NULL;
            return true;
        }
        bool r_tree = dfs(root->right, sum + root->val, limit);
        if((r_tree && root->left == NULL) || (l_tree && r_tree)){
            root = NULL;dang
            return true;
        }
        return l_tree && r_tree;
    }
    TreeNode* sufficientSubset(TreeNode* root, int limit) {
        dfs(root, 0, limit);
        return root;
    }
};
```

**执行结果：** 104 ms, 32.8 MB
