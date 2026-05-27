---
title: Leetcode 106. 从中序与后序遍历序列构造二叉树(分治算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-15 12:35:14
password:
summary:
tags: [Leetcode, 分治算法]
categories: 算法笔记
---

## 问题描述

> 根据一棵树的中序遍历与后序遍历构造二叉树。
> 
>  注意：你可以假设树中没有重复的元素。

## Example

> 中序遍历 inorder = [9,3,15,20,7]
> 
>  后序遍历 postorder = [9,15,7,20,3]
> 
> 
> 
> 
> 
> ![Image 2](/img/jianshu-imports/07defec2c660/4114134-c4a08a9f426b6f41.webp)

## 题目链接：[106. 从中序与后序遍历序列构造二叉树 (难度:中等)](https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

## 思路

树的后序遍历顺序为 LRN，中序遍历顺序为 LNR。因此，我们可以采用分治的思想，以后序序列 postorder 中的 postorder[r_post] 为树的根节点 root，然后通过 root 我们可以中序序列划分为左右两棵子树，分别对左右两棵子树递归处理，即可完成建树，如下图所示

![Image 3](/img/jianshu-imports/07defec2c660/4114134-a56d891452798f9f.webp)

选择根节点，划分左右子树

![Image 4](/img/jianshu-imports/07defec2c660/4114134-1274154d1a1f59bb.webp)

递归处理右子树

## 代码

```
class Solution {
public:
    TreeNode* buildTree(vector<int>& inorder, int l_in, int r_in, vector<int>& postorder, int l_post, int r_post){
        if(l_in > r_in)
            return NULL;
        TreeNode* root = new TreeNode(postorder[r_post]);
        int pos = l_in;
        while(inorder[pos] != postorder[r_post]){
            ++pos;
        }
        root->left = buildTree(inorder, l_in, pos - 1, postorder, l_post, r_post - r_in + pos - 1);
        root->right = buildTree(inorder, pos + 1, r_in, postorder, r_post - r_in + pos, r_post - 1);
        return root;
    }
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        if(inorder.empty()) return NULL;
        int len = inorder.size() - 1;
        return buildTree(inorder, 0, len, postorder, 0, len);
    }
};
```

**执行结果：**40 ms, 17.6 MB

## 相关文章：

*   [Leetcode 105. 从前序与中序遍历序列构造二叉树(分治算法)](/2020/06/15/Leetcode-105-从前序与中序遍历序列构造二叉树-分治算法/)
*   [Leetcode 889. 根据前序和后序遍历构造二叉树(分治算法)](/2020/06/15/Leetcode-889-根据前序和后序遍历构造二叉树-分治算法/)
