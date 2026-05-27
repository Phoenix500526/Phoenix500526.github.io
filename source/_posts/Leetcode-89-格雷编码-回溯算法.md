---
title: Leetcode 89. 格雷编码(回溯算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-13 23:22:25
password:
summary:
tags: [Leetcode, 回溯算法]
categories: 算法笔记
---

## 问题描述

> 格雷编码是一个二进制数字系统，在该系统中，两个连续的数值仅有一个位数的差异。
> 
>  给定一个代表编码总位数的非负整数 n，打印其格雷编码序列。即使有多个不同答案，你也只需要返回其中一种。
> 
>  格雷编码序列必须以 0 开头。

## Example

> 示例1
> 
>  输入: 2
> 
>  输出: [0,1,3,2]
> 
>  解释: 00 - 0、01 - 1、11 - 3、10 - 2
> 
>  对于给定的 n，其格雷编码序列并不唯一。
> 
>  例如，[0,2,3,1] 也是一个有效的格雷编码序列。
> 
>  00 - 0、10 - 2、11 - 3、01 - 1

> 示例2
> 
>  输入: 0
> 
>  输出: [0]
> 
>  解释: 我们定义格雷编码序列必须以 0 开头。
> 
>  给定编码总位数为 n 的格雷编码序列，其长度为 2n。当 n = 0 时，长度为 20 = 1。
> 
>  因此，当 n = 0 时，其格雷编码序列为 [0]。

## 题目链接：[89. 格雷编码 (难度：中等)](https://leetcode-cn.com/problems/gray-code/)

## 思路

我们可以把这个问题看成是一个带有约束条件的全排列问题。

*   对于给定的非负整数 N，枚举从 [1, ..., N] 的全排列
*   返回的全排列 ans 应当满足 ans[i] 与 ans[i + 1] 的二进制表示仅有一位不同 (1 ≤ i < N)

对于枚举全排列问题，可以使用回溯算法来解决，不过考虑到 N 比较大，对于 ans[i] 可以直接由 ans[i-1] 来生成，从而也就达成了剪枝的效果

## 代码

```
class Solution {
public:
    static const int MAX = 1 << 16;
    bool visited[MAX] = {false};
    bool dfs(vector<int>& res, int idx, int len, int n){
        if(idx == len){
            return true;
        }
        for(int i = 0;i < n;++i){
            int tmp = 1 << i;
            int next = tmp ^ res[idx - 1];
            if(visited[next])  continue;
            res[idx] = next;
            visited[next] = true;
            if(dfs(res, idx + 1, len, n))
                return true;
            visited[next] = false;
        }
        return false;
    }
    vector<int> grayCode(int n) {
        if(n == 0)  return {0};
        int len = 1 << n;
        vector<int> res(len,0);
        visited[0] = true;
        dfs(res, 1, len, n);
        return res;
    }
};
```

**执行结果:** 0 ms, 7 MB
