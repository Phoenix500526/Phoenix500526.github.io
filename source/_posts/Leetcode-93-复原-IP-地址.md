---
title: Leetcode 93. 复原 IP 地址
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-11 15:42:25
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述

> 给定一个只包含数字的字符串，复原它并返回所有可能的 IP 地址格式。有效的 IP 地址正好由四个整数（每个整数位于 0 到 255 之间组成），整数之间用 '.' 分隔。

## 示例

> Input: "25525511135"
> 
>  Output: ["255.255.11.135", "255.255.111.35"]

## 题目链接:[Leetcode 93. Restore IP Addresses 难度:Medium](https://leetcode-cn.com/problems/restore-ip-addresses/)

## 思路

我们可以将这个问题看成是一个带特定约束条件的字符串的子串分割问题。我们需要用 . 来将 str 分割成 4 个子串，其中每个子串的应当满足以下 3 个约束条件：

1.   单个子串的长度仅能在 1 ~ 3 之间
2.   子串不能存在前导零，且子串的数值范围应该位于 0 ~ 255 之间
3.   子串的个数不能超过 4 个，比如已经枚举了 3 个子串，而最后一个子串的长度超过了 3，则直接回溯

另外，从约束条件中也可以看出一些特殊情况：当 str 的长度小于 4 或者大于 12 时，都不存在任何可行的分割方案。

## 代码实现

```
class Solution {
public:
    vector<string> res;
    bool isValid(const string& str){
        int len = str.size();
        if(str[0] == '0' && len > 1) return false;
        int num = stoi(str);
        return num < 256 && len < 4;
    }
    void dfs(string& s, int depth, string* nums, int idx){
        if(depth == 4 && s.size() > 0)  return;
        if(depth == 4 && s.size() == 0){
            string tmp = "";
            for(int i = 0;i < 4;++i){
                tmp += i == 3 ? nums[i] : nums[i] + ".";
            }
            res.push_back(tmp);
            return;
        }
        // 约束条件 3
        if(s.size() < 4 -  depth || s.size() > 12 - depth * 3) return;
        // 约束条件 1
        for(int i = 1; i <= 3;++i){
            if(i > s.size())  break;
            string IP_num = s.substr(0,i);
            // 约束条件 2
            if(isValid(IP_num)){
                string IP_str = s.substr(i);
                nums[idx] = IP_num;
                dfs(IP_str, depth + 1,nums, idx + 1);
            }
        }
    }

    vector<string> restoreIpAddresses(string s) {
        if(s.empty()) return res;
        int len = s.size();
        if(len < 4 || len > 12) return res;
        string nums[4] = {""};
        dfs(s, 0, nums, 0);
        return res;
    }
};
```
