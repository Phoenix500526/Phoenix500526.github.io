---
title: Leetcode 95. 不同的二叉搜索树 II(根据中序序列枚举所有可能的树)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-23 16:45:39
password:
summary:
tags: [Leetcode, 根据中序序列枚举所有可能的树]
categories: 算法笔记
---

## 问题描述

> 给定一个整数 n，生成所有由 1 ... n 为节点所组成的 二叉搜索树 。
> 
>  注意：0 <= n <= 8

## Example

> 输入：3
> 
>  输出：
> 
>  [
> 
>  [1,null,3,2],
> 
>  [3,2,null,1],
> 
>  [3,1,null,null,2],
> 
>  [2,1,3],
> 
>  [1,null,2,null,3]
> 
>  ]
> 
>  解释如下：
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/5452cca9b2c0/4114134-833781672c0dc760.webp)

## 题目链接：[95. 不同的二叉搜索树 II (难度：中等)](https://leetcode-cn.com/problems/unique-binary-search-trees-ii/)

## 思路

由题目的要求可知，我们需要根据中序序列 [1 , ... , n] 去枚举出所有可能的二叉树。**对于一个已知的中序序列，所对应的可能的二叉树的个数为$\frac{C_{2n}^{n}}{n + 1}$棵(卡特兰数)。**

 具体策略见下：

> 设 f(left, right) 代表所有节点范围为 left 到 right 的所有二叉搜索树，则考虑如下情况：
> 
>  1、left > right：将 nullptr 压入 ans 并返回
> 
>  2、left == right：此时符合的 BST 有且仅有一棵，将其压入 ans 后返回
> 
>  3、left < right：枚举 [left, right] 中的所有值 root 作为根节点，其左子树应为 l_tree = f(left, root - 1)，右子树应为 r_tree = f(root + 1, right)，分别从 l_tree 和 r_tree 中取出对应的子树，和 root 连成一棵新树，并压入 ans 中。循环结束后返回 ans 即可

## 代码

```C++
class Solution {
public:
    vector<TreeNode*> helper(int left, int right){
        vector<TreeNode*> ans;
        if(left > right){
            ans.push_back(nullptr);
        }else if(left == right){
            ans.push_back(new TreeNode(left));
        }else{
            for(int i = left;i <= right;++i){
                vector<TreeNode*> l_tree = helper(left, i - 1);
                vector<TreeNode*> r_tree = helper(i + 1, right);
                for(int j = 0;j < l_tree.size();++j){
                    for(int k = 0;k < r_tree.size();++k){
                        TreeNode* root = new TreeNode(i);
                        root->left = l_tree[j];
                        root->right = r_tree[k];
                        ans.push_back(root);
                    }
                }
            }
        }
        return ans;
    }
    vector<TreeNode*> generateTrees(int n) {
        if(n == 0)
            return {};
        return helper(1, n);
    }
};
```

**执行结果：** 16ms, 13.7 MB
