---
title: Leetcode 979. 在二叉树中分配硬币(树的后序遍历)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-15 14:30:53
password:
summary:
tags: [Leetcode, 树的后序遍历]
categories: 算法笔记
---

## 问题描述

> 给定一个有 N 个结点的二叉树的根结点 root，树中的每个结点上都对应有 node.val 枚硬币，并且总共有 N 枚硬币。
> 
>  在一次移动中，我们可以选择两个相邻的结点，然后将一枚硬币从其中一个结点移动到另一个结点。(移动可以是从父结点到子结点，或者从子结点移动到父结点。)。
> 
>  返回使每个结点上只有一枚硬币所需的移动次数。

## Example

> 示例1
> 
>  输入：[3,0,0]
> 
>  输出：2
> 
> 解释：从树的根结点开始，我们将一枚硬币移到它的左子结点上，一枚硬币移到它的右子结点上。
> 
> ![Image 2](/img/jianshu-imports/f5b463796098/4114134-f65dddc1772715a7.webp)
> 
> 
> 示例1

> 示例2
> 
>  输入：[0,3,0]
> 
>  输出：3
> 
> 解释：从根结点的左子结点开始，我们将两枚硬币移到根结点上 [移动两次]。然后，我们把一枚硬币从根结点移到右子结点上。
> 
> ![Image 3](/img/jianshu-imports/f5b463796098/4114134-e6a8b3d82346644e.webp)
> 
> 
> 示例2.png

## Note：

> 1<= N <= 100
> 
>  0 <= node.val <= N

## 题目链接：[979. 在二叉树中分配硬币 (难度:中等)](https://leetcode-cn.com/problems/distribute-coins-in-binary-tree/)

## 思路

倒过来看这个问题，不要想着先从某个有硬币的节点处搬硬币到没有硬币的结点处，而是反过来，如果子节点没有硬币，那就先借给它一枚硬币，然后“子债父偿”，回溯到父结点时，清算欠款，留一枚硬币给父结点后，若有剩余硬币则统统没收，继续回溯父节点，直至遍历完全树。在这个思路中，我们采用先访问子节点，后访问父节点的形式，因此选择后序遍历。

## 代码

```
class Solution {
public:
    int ans = 0;
    int dfs(TreeNode* root){
        if(root == NULL)
            return 0;
        int l_re = dfs(root->left);
        int r_re = dfs(root->right);
        ans += abs(l_re) + abs(r_re);
        return l_re + r_re + root->val - 1;
    }
    int distributeCoins(TreeNode* root) {
        dfs(root);
        return ans;
    }
};
```

**执行结果：** 8 ms, 13.9 MB
