---
title: Leetcode 951. 翻转等价二叉树(树的匹配问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-16 15:35:52
password:
summary:
tags: [Leetcode, 树的匹配问题]
categories: 算法笔记
---

## 问题描述

> 我们可以为二叉树 T 定义一个翻转操作，如下所示：选择任意节点，然后交换它的左子树和右子树。
> 
>  只要经过一定次数的翻转操作后，能使 X 等于 Y，我们就称二叉树 X 翻转等价于二叉树 Y。
> 
>  编写一个判断两个二叉树是否是翻转等价的函数。这些树由根节点 root1 和 root2 给出。

## Example

> ![](/img/jianshu-imports/4830046d3e87/4114134-b0b86c9f06c05049.webp)
> 
> 
> 输入：root1 = [1,2,3,4,5,6,null,null,null,7,8], root2 = [1,3,2,null,6,4,5,null,null,null,null,8,7]
> 
>  输出：true
> 
>  解释：我们翻转值为 1，3 以及 5 的三个节点。

## Note

> *   每棵树最多有 100 个节点。
> *   每棵树中的每个值都是唯一的、在 [0, 99] 范围内的整数。

## 题目链接：[951. 翻转等价二叉树 (难度:中等)](https://leetcode-cn.com/problems/flip-equivalent-binary-trees/)

## 思路

对于这个问题，我们依然采用遍历的方式来判断。为了便于将问题描述清楚，我们在这个地方定义 3 种状态：

> *   直接等价：root1 和 root2 无需经过翻转就等价 (对 root1 和root2均采用 LR 的顺序遍历)
> *   翻转等价：root1 和 root2 经过翻转之后等价(对 root1 采用 LR顺序遍历，对 root2 则采用 RL 的顺序遍历)
> *   不等价

按照题目定义，我们显然知道以下信息：

> 1.   两棵空树是直接等价的
> 2.   两棵树中仅有一棵空树，或者 root1->val != root2->val，则显然 root1 和 root2 是不等价的
> 3.   对于除前两种情况以外的情况，如果 root1 和 root2 是等价的，则要么是翻转等价，要么是直接等价，二者必属其一，是逻辑或的关系。

## 代码

```C++
class Solution {
public:
    bool flipEquiv(TreeNode* root1, TreeNode* root2) {
        if(root1 == NULL && root2 == NULL)
            return true;
        if(root1 == NULL || root2 == NULL)
            return false;
        if(root1->val != root2->val)
            return false;
        return (flipEquiv(root1->left, root2->left) && flipEquiv(root1->right, root2->right)) || (flipEquiv(root1->left, root2->right) && flipEquiv(root1->right, root2->left));
    }
};
```

**执行结果：** 8 ms，12.1 MB
