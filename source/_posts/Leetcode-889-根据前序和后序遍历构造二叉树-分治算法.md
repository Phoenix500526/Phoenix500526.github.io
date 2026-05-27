---
title: Leetcode 889. 根据前序和后序遍历构造二叉树(分治算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-15 17:34:50
password:
summary:
tags: [Leetcode, 分治算法]
categories: 算法笔记
---

## 问题描述

> 返回与给定的前序和后序遍历匹配的任何二叉树。
> 
>  pre 和 post 遍历中的值是不同的正整数。

## Example

> 输入：pre = [1,2,4,5,3,6,7], post = [4,5,2,6,7,3,1]
> 
>  输出：[1,2,3,4,5,6,7]

## Note

> *   1 <= pre.length == post.length <= 30
> *   pre[] 和 post[] 都是 1, 2, ..., pre.length 的排列
> *   每个输入保证至少有一个答案。如果有多个答案，可以返回其中一个。

## 题目链接：[889. 根据前序和后序遍历构造二叉树 (难度:中等)](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/)

## 思路

在树的四序遍历当中，先序、后序和层序能够提供树中节点的父子关系，而中序则能够提供树中节点的左右关系，因此，只有中序+先序、中序+后序、中序+层序能够唯一确定一棵树，而先序+后序可以确定的树不唯一。当答案不唯一时，由于后序顺序为 LRN，先序顺序为 NLR，**当某个节点只有一个孩子时，无法从序列中确定是左子树还是右子树，为了方便起见，我们统一将其定义为左子树**

 对于这个问题采取分治法，先确定根节点，然后将序列分割为左右子树的序列，各个击破即可。在实现上，使用了 unordered_map 对序列进行缓存，既可以提高递归时的查找效率，同时也避免了查找过程当中的越界情况。具体过程可见下图：

![Image 2](/img/jianshu-imports/024bf158678f/4114134-e84711c72d4e6c50.webp)

左右子树同，则统一当作左子树处理

![Image 3](/img/jianshu-imports/024bf158678f/4114134-c3ed027ec958d435.webp)

左右子树不同，则分治处理左右子树

## 代码

```
class Solution {
public:
    unordered_map<int, int> pre_table;
    unordered_map<int, int> post_table;
    TreeNode* buildTree(vector<int>& pre, int l_pre, int r_pre, vector<int>& post, int l_post, int r_post){
        if(l_pre > r_pre)
            return NULL;
        TreeNode* root = new TreeNode(pre[l_pre]);
        if(l_post == r_post){
            return root;
        }
        int l_root = pre[l_pre + 1];
        int r_root = post[r_post - 1];
        if(l_root == r_root){
            root->left = buildTree(pre, l_pre + 1, r_pre, post, l_post, r_post - 1);
            root->right = NULL;
        }else{
            int r_pre_root = pre_table[r_root];
            int l_post_root = post_table[l_root];
            root->left = buildTree(pre, l_pre + 1, r_pre_root - 1, post, l_post, l_post_root);
            root->right = buildTree(pre, r_pre_root, r_pre, post, l_post_root + 1, r_post - 1);
        }
        return root;
    }
    TreeNode* constructFromPrePost(vector<int>& pre, vector<int>& post) {
        int len = pre.size();
        for(int i = 0;i < len;++i){
            pre_table[pre[i]] = i;
            post_table[post[i]] = i;
        }
        return buildTree(pre, 0, len - 1, post, 0, len - 1);
    }
};
```

**执行结果:** 28ms, 27.6MB

## 相关文章：

*   [Leetcode 105. 从前序与中序遍历序列构造二叉树(分治算法)](/2020/06/15/Leetcode-105-从前序与中序遍历序列构造二叉树-分治算法/)
*   [Leetcode 106. 从中序与后序遍历序列构造二叉树(分治算法)](/2020/06/15/Leetcode-106-从中序与后序遍历序列构造二叉树-分治算法/)
