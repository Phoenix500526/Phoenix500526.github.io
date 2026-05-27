---
title: Leetcode 105. 从前序与中序遍历序列构造二叉树(分治算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-15 09:07:36
password:
summary:
tags: [Leetcode, 分治算法]
categories: 算法笔记
---

## 问题描述

> 根据一棵树的前序遍历与中序遍历构造二叉树。
> 
>  注意:
> 
>  你可以假设树中没有重复的元素。

## Example

> 输入：前序遍历 preorder = [3,9,20,15,7]
> 
>  中序遍历 inorder = [9,3,15,20,7]
> 
> 返回如下的二叉树：
> 
> ![Image 2](/img/jianshu-imports/08d01f5f1e1b/4114134-39408e3a647c21be.webp)

## 题目链接：[105. 从前序与中序遍历序列构造二叉树 (难度:中等)](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

## 思路

树的先序遍历顺序为 NLR，中序遍历顺序为 LNR。因此，我们可以采用分治的思想，以先序序列 preorder 中的 preorder[0] 为树的根节点 root，然后通过 root 我们可以中序序列划分为左右两棵子树，分别对左右两棵子树递归处理，即可完成建树，如下图所示

![Image 3](/img/jianshu-imports/08d01f5f1e1b/4114134-e5cd6be7a194c400.webp)

选择根节点，并划分左右子树

![Image 4](/img/jianshu-imports/08d01f5f1e1b/4114134-8a76baf4473333c8.webp)

处理右子树

## 代码

```
class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        return buildTree(preorder,0,preorder.size()-1,inorder,0,inorder.size()-1);
    }
    // l_pre 和 r_pre 代表当前子树在 preorder 中的左右边界
    // l_in 和 r_in 代表当前子树在 inorder 中的左右边界
    TreeNode* buildTree(vector<int>& preorder, int l_pre,int r_pre,vector<int>& inorder,int l_in,int r_in) {
        if(l_pre > r_pre || l_in > r_in)
            return NULL;
        TreeNode* root = new TreeNode(preorder[l_pre]);
        int pos = l_in;
        while(inorder[pos] != preorder[l_pre]){
            pos++;
        }
        root->left = buildTree(preorder, l_pre + 1, l_pre + pos - l_in, inorder, l_in, pos - 1);
        root->right = buildTree(preorder, pos - l_in + l_pre + 1, r_pre, inorder, pos + 1, r_in);
        return root;
    }
};
```

## 相关练习：[1008. 先序遍历构造二叉树 (难度:中等)](https://leetcode-cn.com/problems/construct-binary-search-tree-from-preorder-traversal/)

## 相关文章：

*   [Leetcode 106. 从中序与后序遍历序列构造二叉树(分治算法)](/2020/06/15/Leetcode-106-从中序与后序遍历序列构造二叉树-分治算法/)
*   [Leetcode 889. 根据前序和后序遍历构造二叉树(分治算法)](/2020/06/15/Leetcode-889-根据前序和后序遍历构造二叉树-分治算法/)
