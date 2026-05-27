---
title: Leetcode 98. 验证二叉搜索树
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 20:30:15
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树，判断其是否是一个有效的二叉搜索树。
> 
>  假设一个二叉搜索树具有如下特征：
> 
> 
> *   节点的左子树只包含小于当前节点的数。
> *   节点的右子树只包含大于当前节点的数。
> *   所有左子树和右子树自身必须也是二叉搜索树。

## Example

> 输入：
> 
> ![Image 2](/img/jianshu-imports/5b0b595a0f31/4114134-2fccebd39b6a319a.webp)
> 
> 
> 输出: false
> 
>  解释: 输入为: [5,1,4,null,null,3,6]。
> 
>  根节点的值为 5 ，但是其右子节点值为 4 。

## 题目链接：[98. 验证二叉搜索树 (难度:中等)](https://leetcode-cn.com/problems/validate-binary-search-tree/)

## 思路

我们可以对 BST 做中序遍历，并判断当前序列是否为递增序列。若不是，则显然该树不是 BST，若是，则继续遍历，直到遍历完整棵树。由于题目当中的树节点是 int 类型，我们可以采用 long long 类型的 LLONG_MIN 来作为中序序列的前趋节点。这样可以简化代码的逻辑。

## 代码

```
class Solution {
public:
    //利用中序遍历是递增序列来做即可,tmp代表中序前趋
    bool isValidBST(TreeNode* root, long long& tmp){
        if(!root)  return true;
        //先判断左子树是不是二叉搜索树
        if(isValidBST(root->left, tmp)){
            //若是左子树，判断左子树的结点tmp
            if(tmp < root->val){
                tmp = root->val;
                return isValidBST(root->right, tmp);
            }
        }
        return false;
    }
    bool isValidBST(TreeNode* root) {
        if(!root) return true;
        long long tmp = LONG_LONG_MIN;
        return isValidBST(root,tmp);
    }
};
```

**执行结果：** 12 ms, 18.3 MB
