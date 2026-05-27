---
title: Leetcode 971. 翻转二叉树以匹配先序遍历
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-11 16:19:36
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 给定一个有 N 个节点的二叉树，每个节点都有一个不同于其他节点且处于 {1, ..., N} 中的值。通过交换节点的左子节点和右子节点，可以翻转该二叉树中的节点。考虑从根节点开始的先序遍历报告的 N 值序列。将这一 N 值序列称为树的行程。
> 
>  我们的目标是翻转最少的树中节点，以便树的行程与给定的行程 voyage 相匹配。
> 
>  如果可以，则返回翻转的所有节点的值的列表。你可以按任何顺序返回答案。
> 
>  如果不能，则返回列表 [-1]。

## 示例

![](/img/jianshu-imports/002e0d06cd75/4114134-567b449820b7e79a.webp)

示例1

> 示例1：
> 
>  输入：root = [1,2,3], voyage = [1,2,3]
> 
>  输出：[]

![](/img/jianshu-imports/002e0d06cd75/4114134-3d38ee850f57cb73.webp)

示例2

> 示例2：
> 
>  输入：root = [1,2,3], voyage = [1,3,2]
> 
>  输出：[1]

## 题目链接: [971. 翻转二叉树以匹配先序遍历 难度:中等](https://leetcode-cn.com/problems/flip-binary-tree-to-match-preorder-traversal/)

## 思路

对于这个问题，我们可以反过来思考，不是去翻转二叉树匹配先序序列，而是根据先序序列来指定遍历二叉树的方式。若能够遍历完成二叉树，则说明可以通过翻转二叉树得到指定的先序序列。若不能遍历，则无法通过翻转得到指定的先序序列

 设 bool dfs(root, idx, voyage) 表示能否按照 voyage 指定顺序遍历 root 树，其中 idx 为当前 voyage 中的下标，则过程如下：

 1、若 idx == len 或 root == NULL(由于 NULL 不会出现在 voyage 数组中，因此可对于数组当中的元素的匹配没有影响), 则返回 true

 2、若 root != voyage[idx++]，则返回 false，

 3、若 root 的左右子树都非空，则根据 voyage[idx] 判断接下来应该访问左子树还是右子树，并返回访问结果

 4、若条件 3 不满足，则依然按照先序遍历的方式继续访问二叉树

 注：先序遍历的顺序为 NLR, 当左右子树中有一个为空(此时先序序列为 NL 或 NR)或者两个都为空(此时先序序列为 N)，翻转前和翻转后的二叉树的先序序列都是相同的。因此只要判断左右子树都非空的情况即可。

## 代码

```
class Solution {
public:
    vector<int> ans;
    int len = 0;
    bool dfs(TreeNode* root, int& idx, vector<int>& voyage){
        if(idx == len || root == NULL){
            return true;
        }
        if(root->val != voyage[idx++]){
            return false;
        }
        if(root->left && root->right){
            if(voyage[idx] == root->left->val){
                if(!dfs(root->left, idx, voyage) || !dfs(root->right, idx, voyage)){
                    return false;
                }else{
                    return true;
                }
            }else{
                if(voyage[idx] == root->right->val){
                    ans.push_back(root->val);
                    if(!dfs(root->right, idx, voyage) || !dfs(root->left, idx, voyage)){
                        return false;
                    }else{
                        return true;
                    }
                }
            }
        }
        return dfs(root->left, idx, voyage) && dfs(root->right, idx, voyage);
         
    }
    vector<int> flipMatchVoyage(TreeNode* root, vector<int>& voyage) {
        if(root->val != voyage[0])
            return {-1};
        int idx = 0;
        len = voyage.size();
        if(dfs(root, idx, voyage))
            return ans;
        else
            return {-1};
    }
};
```
