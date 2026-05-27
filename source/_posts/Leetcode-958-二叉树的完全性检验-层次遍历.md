---
title: Leetcode 958. 二叉树的完全性检验（层次遍历）
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-19 14:02:58
password:
summary:
tags: [Leetcode, 层次遍历]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树，确定它是否是一个完全二叉树。
> 
>  百度百科中对完全二叉树的定义如下：
> 
>  若设二叉树的深度为 h，除第 h 层外，其它各层 (1～h-1) 的结点数都达到最大个数，第 h 层所有的结点都连续集中在最左边，这就是完全二叉树。（注：第 h 层可能包含 1~ 2h 个节点。）

## Example

> 示例1：
> 
>  输入：[1,2,3,4,5,6]
> 
>  输出：true
> 
>  解释：最后一层前的每一层都是满的（即，结点值为 {1} 和 {2,3} 的两层），且最后一层中的所有结点（{4,5,6}）都尽可能地向左。
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/7492114203a2/4114134-03b0fdd900d162ab.webp)

> 示例2：
> 
>  输入：[1,2,3,4,5,null,7]
> 
>  输出：false
> 
>  解释：值为 7 的结点没有尽可能靠向左侧。
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/7492114203a2/4114134-7a75511e40cedc9d.webp)

## 题目链接：[958. 二叉树的完全性检验 (难度:中等)](https://leetcode-cn.com/problems/check-completeness-of-a-binary-tree/)

## 思路

对完全二叉树进行层次遍历即可发现，在层次序列当中，所有的非空节点都是连在一起的，而所有的空节点也是连在一起，并靠在非空节点的后方。因此我们只需要对树进行层次遍历，一旦队头出现空节点则检查剩下的队列当中的节点是否含有非空节点，若有则必定不是完全二叉树，若没有则为完全二叉树

## 代码

```C++
class Solution {
public:
    bool isCompleteTree(TreeNode* root) {
        queue<TreeNode*> my_queue;
        my_queue.push(root);
        TreeNode* cur = NULL;
        while((cur = my_queue.front()) != NULL){
            my_queue.push(cur->left);
            my_queue.push(cur->right);
            my_queue.pop();
        }
        while(!my_queue.empty()){
            if(my_queue.front() != NULL)
                return false;
            my_queue.pop();
        }
        return true;
    }
};
```

**执行结果：** 0 ms, 10.5 MB
