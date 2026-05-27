---
title: Leetcode 526. 优美的排列(回溯算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-14 10:48:57
password:
summary:
tags: [Leetcode, 回溯算法]
categories: 算法笔记
---

## 问题描述

> 假设有从 1 到 N 的 N 个整数，如果从这 N 个数字中成功构造出一个数组，使得数组的第 i 位 (1 <= i <= N) 满足如下两个条件中的一个，我们就称这个数组为一个优美的排列。条件：
> 
> 
> *   第 i 位的数字能被 i 整除
> *   i 能被第 i 位上的数字整除
> 
> 
> 现在给定一个整数 N，请问可以构造多少个优美的排列？
> 
>  注意 : N 是一个正整数，并且不会超过15。

## Example

> 输入: 2
> 
>  输出: 2
> 
>  解释:
> 
>  第 1 个优美的排列是 [1, 2]:
> 
>  第 1 个位置（i=1）上的数字是1，1能被 i（i=1）整除
> 
>  第 2 个位置（i=2）上的数字是2，2能被 i（i=2）整除
> 
>  第 2 个优美的排列是 [2, 1]:
> 
>  第 1 个位置（i=1）上的数字是2，2能被 i（i=1）整除
> 
>  第 2 个位置（i=2）上的数字是1，i（i=2）能被 1 整除

## 题目链接:[526. 优美的排列 (难度:中等)](https://leetcode-cn.com/problems/beautiful-arrangement/)

## 思路

采用回溯算法,枚举出所有可能的全排列. 如果当前的排列 res 不满足 res[i] % i == 0 或者 i % res[i] == 0(i 为当前排列 res 最后一个元素的下标, 且 1 ≤ i ≤ N),则回溯

## 代码

```C++
class Solution {
public:
    bool visited[16] = {false};
    void dfs(int idx, int N, int& ans){
        if(idx == N + 1){
            ++ans;
            return;
        }
        for(int i = 1;i <= N;++i){
            if(visited[i])  continue;
            if(idx % i == 0 || i % idx == 0){
                visited[i] = true;
                dfs(idx + 1,N, ans);
                visited[i] = false;
            }else{
                continue;
            }
        }
    }
    int countArrangement(int N) {
        if(N == 1) return N;
        int ans = 0;
        dfs(1, N, ans);
        return ans;
    }
};
```

**执行结果:** 88 ms, 6.1 MB
