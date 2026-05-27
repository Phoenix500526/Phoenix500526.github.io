---
title: Leetcode 1079. 活字印刷(回溯算法 + 带重复元素的全排列)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-14 10:14:06
password:
summary:
tags: [Leetcode, 回溯算法, 带重复元素的全排列]
categories: 算法笔记
---

## 问题描述

> 你有一套活字字模 tiles，其中每个字模上都刻有一个字母 tiles[i]。返回你可以印出的非空字母序列的数目。
> 
>  注意：本题中，每个活字字模只能使用一次。

## Example

> 示例1:
> 
>  输入："AAB"
> 
>  输出：8
> 
>  解释：可能的序列为 "A", "B", "AA", "AB", "BA", "AAB", "ABA", "BAA"。

> 示例2 :
> 
>  输入："AAABBC"
> 
>  输出：188

## Note

> *   1 <= tiles.length <= 7
> *   tiles 由大写英文字母组成

## 题目链接：[1079. 活字印刷 (难度:中等)](https://leetcode-cn.com/problems/letter-tile-possibilities/)

## 思路

这个问题可以看成是一个带有约束条件的全排列枚举问题。由于 title 的长度不超过 7，我们可以用回溯算法来枚举长度为 1 ~ n 的排列（n 为 title 的长度），但是要注意去除重复排列。

 去重操作：对 title 排序，使相同元素相互靠近在一起。在枚举排列的时候，使 sample 记录上一次选择的字符，并在下次选择时跳过与 sample 相同的字符

## 代码

```C++
class Solution {
public:
    int ans = 0;
    bool visited[8] = {false};
    void dfs(string& tiles,int t_len, int idx, int len){
        if(idx == len){
            ++ans;
            return;
        }
        char sample = ' ';
        for(int i = 0;i < t_len;++i){
            if(visited[i] || sample == tiles[i])   continue;
            visited[i] = true;
            dfs(tiles, t_len, idx + 1, len);
            visited[i] = false;
            sample = tiles[i];
        }
    }
    int numTilePossibilities(string tiles) {
        int len = tiles.size();
        sort(tiles.begin(), tiles.end());
        for(int i = 1;i <= len; ++i){
            dfs(tiles, len, 0, i);
        }
        return ans;
    }
};
```

**执行结果:**4 ms, 5.9 MB
