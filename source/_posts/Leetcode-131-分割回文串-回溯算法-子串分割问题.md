---
title: Leetcode 131. 分割回文串（回溯算法 + 子串分割问题）
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-11 16:08:39
password:
summary:
tags: [Leetcode, 回溯算法, 子串分割问题]
categories: 算法笔记
---

## 问题描述

> 给定一个字符串 s，将 s 分割成一些子串，使每个子串都是回文串。
> 
>  返回 s 所有可能的分割方案。

## 示例

> 输入: "aab"
> 
>  输出:
> 
>  [
> 
>  ["aa","b"],
> 
>  ["a","a","b"]
> 
>  ]

## 题目链接： [131. 分割回文串 难度:中等](https://leetcode-cn.com/problems/palindrome-partitioning/)

## 思路：

这个问题可以看成是一个带有约束条件的字符串的子串分割问题。可以使用深度优先搜索枚举所有可能的子串，若当前子串不是回文串，则继续枚举下一个子串，直到将整个字符串分割完毕。

## 代码：

```C++
class Solution {
public:
    vector<vector<string>> ans;
    vector<string> res;
    // 判断子串是否为回文串
    inline bool isPlaid(const string& str){
        int left = 0, right = str.size()  - 1;
        while(left < right){
            if(str[left++] != str[right--]){
                return false;
            }
        }
        return true;
    }
    void dfs(string& str, int len){
        if(str.size() == 0){
            ans.push_back(res);
            return;
        }
        for(int i = 1;i <= len;++i){
            string tmp = str.substr(0,i);
            // 若当前子串 tmp 不是回文串，则枚举下一个子串
            if(!isPlaid(tmp)){
                continue;
            }
            res.push_back(tmp);
            string LeftStr = str.substr(i);
            dfs(LeftStr, LeftStr.size());
            res.pop_back();
        }
    }
    vector<vector<string>> partition(string s) {
        if(s.empty())  return ans;
        int len = s.size();
        if(len == 1){
            ans.push_back({s});
            return ans;
        }
        dfs(s,s.size());
        return ans;
    }
};
```
