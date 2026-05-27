---
title: Leetcode 652. 寻找重复的子树(序列化 + 哈希表)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-18 17:34:07
password:
summary:
tags: [Leetcode, 序列化, 哈希表]
categories: 算法笔记
---

## 问题描述

> 给定一棵二叉树，返回所有重复的子树。**对于同一类的重复子树，你只需要返回其中任意一棵的根结点即可。**
> 
>  两棵树重复是指它们具有相同的结构以及相同的结点值。

## Example

> 输入：[1,2,3,4,null,2,4,null,null,4]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/033b7edabfea/4114134-9c24d7c2629aa1e5.webp)
> 
> 
> 输出:[[2,4],[4]]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/033b7edabfea/4114134-bc0089fe0a8d1c2a.webp)

## 思路

对于一棵树的子树间的匹配问题，可以采用序列化 + 哈希表的方式来求解。通过对树的序列化，并使用哈希表记录对应序列的出现次数。若当前节点 root 的序列化在哈希表中出现且仅出现过一次，则 root 就是我们要找的重复子树

## 代码

```
class Solution {
public:
    unordered_map<string, int> table;
    string helper(TreeNode* root, vector<TreeNode*>& ans){
        if(root == nullptr)
            return "#";
        string tmp = to_string(root->val) + " " + helper(root->left, ans) + " " + helper(root->right, ans);
        if(table[tmp] == 1){
            ans.push_back(root);
        }
        ++table[tmp];
        return tmp;
    }
    vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
        vector<TreeNode*> ans;
        helper(root, ans);
        return ans;
    }
};
```

**执行结果：** 76 ms, 49.6 MB
