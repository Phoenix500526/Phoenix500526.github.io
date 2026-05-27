---
title: Leetcode 337. 打家劫舍 III（树形 dp）
top: false
cover: false
toc: true
mathjax: true
date: 2020-07-03 17:12:30
password:
summary:
tags: [Leetcode, 动态规划, 树形 DP]
categories: 算法笔记
---

## 问题描述

> 在上次打劫完一条街道之后和一圈房屋后，小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为“根”。 除了“根”之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 如果两个直接相连的房子在同一天晚上被打劫，房屋将自动报警。
> 
>  计算在不触动警报的情况下，小偷一晚能够盗取的最高金额。

## Example

> 示例 1：
> 
>  输入: [3,2,3,null,3,null,1]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/aaf3d355d3fa/4114134-bde30cd27edeffda.webp)
> 
> 
> 输出: 7
> 
>  解释: 小偷一晚能够盗取的最高金额 = 3 + 3 + 1 = 7.

> 示例 2：
> 
>  输入: [3,4,5,1,3,null,1]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/aaf3d355d3fa/4114134-768e448104957f36.webp)
> 
> 
> 输出: 9
> 
>  解释: 小偷一晚能够盗取的最高金额 = 4 + 5 = 9.

## 题目链接： [337. 打家劫舍 III (难度:中等)](https://leetcode-cn.com/problems/house-robber-iii/)

## 思路：

从题目上看，这显然是一个树形 dp 问题，同样还是离不开动规三要素

> 1、dp 定义：设 dp[root] 表示从 root 开始抢劫所能得到的最大价值
> 
>  2、状态转移：
> 
> 
> *   若不抢 root ，则 dp[root] = dp[root->left] + dp[root->right]
> *   若抢 root，则 root 的左右子树均不能抢， dp[root] = dp[root->left->left] + dp[root->left->right] + dp[root->right->left] + dp[root->right->right] + root->val;
> 
> 
> 3、初态和终态
> 
>  初态：dp[nullptr] = 0
> 
>  终态（答案）：dp[root]

由于最终答案为 dp[root]，所以采用后序遍历的方式进行访问

## 代码

```
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
private:
    unordered_map<TreeNode*, int> dp;
public:
    void helper(TreeNode* root){
        if(root == nullptr){
            if(!dp.count(root)){
                dp[root] = 0;
            }
            return;
        }
        helper(root->left);
        helper(root->right);
        // 不抢的情况
        int not_rob = dp[root->left] + dp[root->right];
        // 抢的情况
        int rob = root->val;
        if(root->left){
            rob += dp[root->left->left] + dp[root->left->right];
        }
        if(root->right){
            rob += dp[root->right->left] + dp[root->right->right];
        }
        dp[root] = max(rob, not_rob);
    }
    int rob(TreeNode* root) {
        helper(root);
        return dp[root];
    }
};
```

**执行结果：** 40 ms, 25.9 MB

## 相关练习题：

*   [198. 打家劫舍](https://leetcode-cn.com/problems/house-robber/)
*   [213. 打家劫舍 II](https://leetcode-cn.com/problems/house-robber-ii/)
