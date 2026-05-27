---
title: Leetcode 996. 正方形数组的数目(回溯算法+全排列问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-13 23:36:29
password:
summary:
tags: [Leetcode, 回溯算法, 全排列问题]
categories: 算法笔记
---

## 问题描述

> 给定一个非负整数数组 A，如果该数组每对相邻元素之和是一个完全平方数，则称这一数组为正方形数组。
> 
>  返回 A 的正方形排列的数目。两个排列 A1 和 A2 不同的充要条件是存在某个索引 i，使得 A1[i] != A2[i]。

## Example

> 示例1
> 
>  输入：[1,17,8]
> 
>  输出：2
> 
>  解释：
> 
>  [1,8,17] 和 [17,8,1] 都是有效的排列。

> 示例2
> 
>  输入：[2,2,2]
> 
>  输出：1

## Note

*   1 <= A.length <= 12
*   0 <= A[i] <= 1e9

## 题目链接:[996. 正方形数组的数目 (难度:困难)](https://leetcode-cn.com/problems/number-of-squareful-arrays/)

## 思路

这个问题可以看成是一个约束条件的全排列问题，其中约束条件为：对于特定的排列 A，必须满足 A[i] + A[i + 1] 为完全平方数。

 可以采用 DFS 算法枚举所有的全排列，对于若当前排列不满足约束条件则回溯

## 代码

```C++
class Solution {
public:
    vector<int> res;
    bool visited[12] = {false};
    void dfs(vector<int>& nums, int idx, int len, int& ans){
        if(idx == len){
            ++ans;
            return;
        }
        int sample = -1;
        for(int i = 0;i < len;++i){
            if(visited[i] || sample == nums[i]){
                continue;
            }
            if(!res.empty()){
                int sum = nums[i] + res.back();
                int factor = sqrt(sum);
                if(factor * factor != sum){
                    continue;
                }
            }
            res.push_back(nums[i]);
            visited[i] = true;
            sample = nums[i];
            dfs(nums,idx + 1, len, ans);
            visited[i] = false;
            res.pop_back();
        }
    }
    int numSquarefulPerms(vector<int>& A) {
        if(A.empty()) return 0;
        int len = A.size();
        if(len == 1)  return 1;
        sort(A.begin(),A.end());
        int ans = 0;
        dfs(A, 0, len, ans);
        return ans;
    }
};
```

**执行结果 : ** 0 ms, 7.9 MB
