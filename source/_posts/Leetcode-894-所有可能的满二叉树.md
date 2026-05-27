---
title: Leetcode 894. 所有可能的满二叉树
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-15 09:07:31
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 满二叉树是一类二叉树，其中每个结点恰好有 0 或 2 个子结点。
> 
>  返回包含 N 个结点的所有可能满二叉树的列表。 答案的每个元素都是一个可能树的根结点。
> 
>  答案中每个树的每个结点都必须有 node.val=0。
> 
>  你可以按任何顺序返回树的最终列表。
> 
>  注意：
> 
> 
> *   1 <= N <= 20
> *   题中的“满二叉树”的定义其实是 2 - 正则树的定义

## Example

> 输入：7
> 
>  输出：[[0,0,0,null,null,0,0,null,null,0,0],[0,0,0,null,null,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,null,null,null,null,0,0],[0,0,0,0,0,null,null,0,0]]
> 
> 解释：
> 
> ![](/img/jianshu-imports/392736402566/4114134-97ff686622e75865.webp)

## 题目链接：[894. 所有可能的满二叉树 (难度:中等)](https://leetcode-cn.com/problems/all-possible-full-binary-trees/)

## 思路

由题目所给出的定义可知，对于任一棵满足 2 - 正则树定义的树，其节点个数必定为奇数个。**若为偶数个节点，则必定存在一个分支节点，其子节点仅有 1 个，与定义矛盾**。我们可以设 func(N) 代表了 N 个节点所能构成 2 - 正则树的所有树形，那么我们可以先看看当 N 为奇数 1，3，5, 7 的情况(对于 N == 7 的情况，可以参考题目示例，这里不赘述)

![](/img/jianshu-imports/392736402566/4114134-0c8dffe157977fa3.webp)

N = 1, 3, 5 的情况

从示例当中可以我们可以看出，要求解 func(3) 需要先求出 func(1), 而要求解出 func(5) 则需要求解出 func(1) 和 func(3)。为了避免重复计算，可以利用 dp 数组对应的结果，避免重复计算。至此，我们可以得出如下的递归模型：

> 递归模型 func(N) :
> 
> 
> *   当 N 为偶数时，不存在合法的二叉树，返回空的 dp 数组
> *   当 N == 1 时，将单个根节点压入 dp 并返回
> *   当 N 为大于 1 的奇数时，建立一个根节点 root，并令 root 的左右指针分别指向 func(i) 和 func(N - 1 - i)，其中 i 为大于 1 小于 N - 1 的全体奇数。

## 代码

```C++
class Solution {
public:
    vector<TreeNode*> allPossibleFBT(int N) {
        vector<TreeNode*> dp;
        if((N & 1) == 0)
            return dp;
        if(N == 1){
            dp.push_back(new TreeNode(0));
            return dp;
        }
        for(int i = 1;i < N - 1;i += 2){
            vector<TreeNode*> l_tree = allPossibleFBT(i);
            vector<TreeNode*> r_tree = allPossibleFBT(N - 1 - i);
            for(int j = 0;j < l_tree.size();++j){
                for(int k = 0;k < r_tree.size();++k){
                    TreeNode* root = new TreeNode(0);
                    root->left = l_tree[j];
                    root->right = r_tree[k];
                    dp.push_back(root);
                }
            }
        }
        return dp;
    }
};
```
