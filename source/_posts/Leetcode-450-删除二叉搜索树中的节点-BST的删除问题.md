---
title: Leetcode 450. 删除二叉搜索树中的节点(BST的删除问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-18 11:02:21
password:
summary:
tags: [Leetcode, BST的删除问题]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉搜索树的根节点 root 和一个值 key，删除二叉搜索树中的 key 对应的节点，并保证二叉搜索树的性质不变。返回二叉搜索树（有可能被更新）的根节点的引用。
> 
>  一般来说，删除节点可分为两个步骤：
> 
> 
> *   首先找到需要删除的节点；
> *   如果找到了，删除它。
> 
> 
> 说明： 要求算法时间复杂度为 O(h)，h 为树的高度。

## Example

> root = [5,3,6,2,4,null,7]
> 
>  key = 3
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/746d0f6980bc/4114134-346ca1f2e4198156.webp)
> 
> 
> 给定需要删除的节点值是 3，所以我们首先找到 3 这个节点，然后删除它。
> 
> 一个正确的答案是 [5,4,6,2,null,null,7], 如下图所示。
> 
> ![](/img/jianshu-imports/746d0f6980bc/4114134-dedc990532c31b4c.webp)
> 
> 
> 
> 另一个正确答案是 [5,2,6,null,4,null,7], 如下图所示。
> 
> ![](/img/jianshu-imports/746d0f6980bc/4114134-9cc040f36ed25c6e.webp)
> 
## 题目链接：[450. 删除二叉搜索树中的节点 (难度：中等)](https://leetcode-cn.com/problems/delete-node-in-a-bst/)

## 思路

从题目描述中可知，我们需要做的事情有两个：找到节点和删除节点。我们考虑删除当前节点的情况：

> *   若当前节点是叶节点，则直接删除
> *   若当前节点的左右孩子中有一棵为空，则用另一个子树代替当前节点
> *   若当前节点的左右孩子均非空，我们统一将左子树作为根节点，并将右子树挂到左子树的最右结点的右端

其中，第一种情况是第二种情况的特例

## 代码

```
class Solution {
public:
    TreeNode* deleteNode(TreeNode* root, int key) {
        if(root == NULL)
            return NULL;
        if(root->val == key){
            if(root->left && root->right){
                TreeNode* tmp = root->left;
                while(tmp->right){
                    tmp = tmp->right;
                }
                tmp->right = root->right;
                return root->left;
            }
            return root->right == NULL ? root->left : root->right;
        }else if(root->val < key){
            root->right = deleteNode(root->right, key);
        }else{
            root->left = deleteNode(root->left, key);
        }
        return root;
    }
};
```

**执行结果：**64 ms，32.5 MB
