---
title: Leetcode 1145. 二叉树着色游戏
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 18:03:37
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 有两位极客玩家参与了一场「二叉树着色」的游戏。游戏中，给出二叉树的根节点 root，树上总共有 n 个节点，且 n 为奇数，其中每个节点上的值从 1 到 n 各不相同。游戏从「一号」玩家开始（「一号」玩家为红色，「二号」玩家为蓝色），最开始时，
> 
>  「一号」玩家从 [1, n] 中取一个值 x（1 <= x <= n）；
> 
>  「二号」玩家也从 [1, n] 中取一个值 y（1 <= y <= n）且 y != x。
> 
>  「一号」玩家给值为 x 的节点染上红色，而「二号」玩家给值为 y 的节点染上蓝色。
> 
>  之后两位玩家轮流进行操作，每一回合，玩家选择一个他之前涂好颜色的节点，将所选节点一个 未着色 的邻节点（即左右子节点、或父节点）进行染色。
> 
>  如果当前玩家无法找到这样的节点来染色时，他的回合就会被跳过。
> 
>  若两个玩家都没有可以染色的节点时，游戏结束。着色节点最多的那位玩家获得胜利 ✌️。
> 
>  现在，假设你是「二号」玩家，根据所给出的输入，假如存在一个 y 值可以确保你赢得这场游戏，则返回 true；若无法获胜，就请返回 false。

## Example

> ![](/img/jianshu-imports/8015cc903be7/4114134-66928656cdc938d8.webp)
> 
> 
> 输入：root = [1,2,3,4,5,6,7,8,9,10,11], n = 11, x = 3
> 
>  输出：True
> 
>  解释：第二个玩家可以选择值为 2 的节点。

## 题目链接：[1145. 二叉树着色游戏 (难度:中等)](https://leetcode-cn.com/problems/binary-tree-coloring-game/)

## 思路

题目比较长，但思路却比较简单，我们只需要弄清楚游戏规则以及获胜的判定条件即可。对于这道题而言，比较关键的有两个点：

*   规则：双方除了首个点以外，后续所有的着色点都必须和首个点连通。
*   获胜判定：谁的着色点多谁就获胜

 因此我们只需要找到 x 对应的二叉树的节点，同时考虑 x 的左子树、右子树以及父结点的另一棵子树上的节点个数是否大于 n / 2。若存在这样的二叉树，则返回 true，否则返回 false

## 代码

```
class Solution {
public:
    int count(TreeNode* root){
        if(root == nullptr)
            return 0;
        return 1 + count(root->left) + count(root->right);
    }
    TreeNode* search(TreeNode* root, int x){
        if(root == nullptr)
            return nullptr;
        if(root->val == x){
            return root;
        }
        TreeNode* l_tree = search(root->left, x);
        if(l_tree)
            return l_tree;
        TreeNode* r_tree = search(root->right, x);
        if(r_tree)
            return r_tree;
        return nullptr;
    }
    bool btreeGameWinningMove(TreeNode* root, int n, int x) {
        TreeNode* x_root = search(root, x);
        int flag = n >> 1;
        int nodes_cnt = count(x_root);
        if(n - nodes_cnt > flag)
            return true;
        int left_nodes = count(x_root->left);
        if(left_nodes > flag)
            return true;
        int right_nodes = count(x_root->right);
        if(right_nodes > flag)
            return true;
        return false;
    }
};
```

**执行结果:** 4 ms, 10.9 MB
