---
title: Leetcode 865. 具有所有最深结点的最小子树(后序遍历)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-21 16:57:08
password:
summary:
tags: [Leetcode, 后序遍历]
categories: 算法笔记
---

## 问题描述

> 给定一个根为 root 的二叉树，每个结点的深度是它到根的最短距离。
> 
>  如果一个结点在整个树的任意结点之间具有最大的深度，则该结点是最深的。
> 
>  一个结点的子树是该结点加上它的所有后代的集合。
> 
>  返回能满足“以该结点为根的子树中包含所有最深的结点”这一条件的具有最大深度的结点。

## Example

> 输入：[3,5,1,6,2,0,8,null,null,7,4]
> 
>  输出：[2,7,4]
> 
> 解释：
> 
> ![](/img/jianshu-imports/7579c45e870d/4114134-272232803826a5ac.webp)
> 
> 
> 
> 我们返回值为 2 的结点，在图中用黄色标记。
> 
> 在图中用蓝色标记的是树的最深的结点。 
> 输入 "[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]" 是对给定的树的序列化表述。
> 
>  输出 "[2, 7, 4]" 是对根结点的值为 2 的子树的序列化表述。
> 
>  输入和输出都具有 TreeNode 类型。

## 题目链接：[865. 具有所有最深结点的最小子树 (难度：中等)](https://leetcode-cn.com/problems/smallest-subtree-with-all-the-deepest-nodes/)

## 思路

我们可以采用后序遍历，将子树的根节点和子树的叶节点深度作为键值对返回。根据这个思路，我们可以提取出递归模型：

> 设 f(root, depth) = {tree, depth} 代表 root 深度为 depth 的叶节点子树 tree，则考虑：
> 
> 
> 1.   递归边界：当 root 为叶结点时，应当返回 {root, depth}
> 2.   递归体(l_tree 代表 root 的左最深子树，r_tree 代表 root 的右最深子树。)
> 
> 
> *   若 l_tree 的深度和 r_tree 的深度同，合并两棵子树
> *   若 l_tree 和 r_tree 的深度不同，返回其中更深的子树

## 代码

```C++
class Solution {
public:
    typedef pair<TreeNode*, int> pair;
    pair helper(TreeNode* root, int depth){
        if(root == NULL)
            return {NULL, 0};
        pair l_tree = helper(root->left, depth + 1);
        pair r_tree = helper(root->right, depth + 1);
        if(root->left == NULL && root->right == NULL){
            return {root, depth};
        }
        if(l_tree.second == r_tree.second){
            return {root, l_tree.second};
        }
        return l_tree.second < r_tree.second ? r_tree : l_tree;
    }
    TreeNode* subtreeWithAllDeepest(TreeNode* root) {
        return helper(root, 0).first;
    }
};
```

**执行结果：** 8 ms, 14.5 MB
