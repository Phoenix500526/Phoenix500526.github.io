---
title: Leetcode 1104. 二叉树寻路（数学规律+位运算）
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-17 19:47:34
password:
summary:
tags: [Leetcode, 数学规律, 位运算]
categories: 算法笔记
---

## 问题描述

> 在一棵无限的二叉树上，每个节点都有两个子节点，树中的节点 逐行 依次按 “之” 字形进行标记。
> 
>  如下图所示，在奇数行（即，第一行、第三行、第五行……）中，按从左到右的顺序进行标记；
> 
>  而偶数行（即，第二行、第四行、第六行……）中，按从右到左的顺序进行标记。
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/10a007616878/4114134-d26975fab64643a7.webp)
> 
> 
> 给你树上某一个节点的标号 label，请你返回从根节点到该标号为 label 节点的路径，该路径是由途经的节点标号所组成的。
> 
> 
> *   注意：1 <= label <= 10^6

## Example

> 示例1：
> 
>  输入：label = 14
> 
>  输出：[1,3,4,14]

> 示例2：
> 
>  输入：label = 26
> 
>  输出：[1,2,6,10,26]

## 思路

从题目中的描述可以看出，我们只需要对一棵拥有无限节点的完全二叉树进行如下操作，就可以得到题目当中所描述的二叉树(以下简称树)：以根节点所在层为第1 层，对于偶数层进行翻转，奇数层保持不变。那么要解决这个问题，我们需要找到题目当中的树和一棵完全二叉树之间节点的对应关系：

> 设 f(x, k) 代表树中第 k 层节点 x 的父节点，则有以下两种考虑：

## 代码

```C++
class Solution {
public:
    void helper(int x, int k, vector<int>& ans){
        if(k == 1){
            ans.push_back(x);
            return;
        }
        if(k & 1){
            int tmp = (1 << k - 1) + (1 << k - 2) - 1;
            helper(tmp - (x >> 1), k - 1, ans);
            ans.push_back(x);
        }else{
            int tmp = (1 << k) + (1 << k - 1) - 1 - x;
            helper(tmp >> 1, k - 1, ans);
            ans.push_back(x);
        }
    }
    vector<int> pathInZigZagTree(int label) {
        vector<int> ans;
        int level = 0, tmp = label;
        while(tmp){
            tmp >>= 1;
            ++level;
        }
        helper(label, level, ans);
        return ans;
    }
};
```

**执行结果：** 4 ms, 6.5 MB

## 改进思路

在题目的评论区当中，我看到了一种非常高效且优雅简洁的实现方式。对于一棵完全二叉树，每个节点的编号都可以和一个二进制数一一对应。而将某一层的节点翻转，只需要对该层的每个节点 X，保留最高位(保留最高位确保给节点所在的层次不发生变化)，再将其他位全部按位取反，即可将该层代码翻转。

> 举个例子：
> 
>  如示例 1 当中那样，14 的二进制表示为 1110b，位于第 4 层，我们要找到 14 对应的第 3 的元素，也就是 111b(右移一位即可做到)，然后对第 3 层进行翻转，即 111 ^ 011 = 100(保留最高位，剩下位取反)，也就是第 3 层的 4。对 4 进行相同的操作，又可以得到 4 对应第 2 层的节点 3.

这一做法好处非常明显：

> 1.它和题目当中所描述的操作是完全一致的
> 
>  2.前面找规律的方法，需要结合节点所在层次进行计算，而第二种方法无需考虑层次，因为它从第二层开始，每一层都进行翻转，则显然最终的结果只有偶数层发生了翻转，而奇数层的翻转次数始终为偶数，也就相当于没有翻转。

从这个思路当中可以知道两个结论，能够借鉴在未来的题目当中：

> *   完全二叉树的节点编号可以和二进制编码相结合，其中高位保证了对应的层次
> *   对二叉树的某层节点进行翻转或者求对称节点，可以通过和对应层掩码来进行异或的方式获得，这种高效简洁而且能够叠加使用。

## 代码

```C++
class Solution {
public:
    void helper(int x, int k, vector<int>& ans){
        if(k == 1){
            ans.push_back(x);
            return;
        }
        // 此处由于 x 右移了 1 位，所以是 k - 2，而不是 k - 1
        int tmp = (x >> 1) ^ ((1 << k - 2) - 1);
        helper(tmp, k - 1, ans);
        ans.push_back(x);
    }
    vector<int> pathInZigZagTree(int label) {
        vector<int> ans;
        int level = 0, tmp = label;
        while(tmp){
            tmp >>= 1;
            ++level;
        }
        helper(label, level, ans);
        return ans;
    }
};
```

**执行结果：** 0 ms, 6.5 MB
