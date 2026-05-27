---
title: Leetcode 面试题 16.18. 模式匹配(DFS + 子串分割问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-22 16:00:07
password:
summary:
tags: [Leetcode, DFS, 子串分割问题]
categories: 算法笔记
---

## 问题描述

> 你有两个字符串，即pattern和value。 pattern字符串由字母"a"和"b"组成，用于描述字符串中的模式。例如，字符串"catcatgocatgo"匹配模式"aabab"（其中"cat"是"a"，"go"是"b"），该字符串也匹配像"a"、"ab"和"b"这样的模式。但需注意"a"和"b"不能同时表示相同的字符串。编写一个方法判断value字符串是否匹配pattern字符串。

## Example

> 示例1
> 
>  输入： pattern = "abba", value = "dogdogdogdog"
> 
>  输出： true
> 
>  解释： "a"="dogdog",b=""，反之也符合规则

> 示例2
> 
>  输入： pattern = "abba", value = "dogcatcatdog"
> 
>  输出： true

## Note

> *   0 <= len(pattern) <= 1000
> *   0 <= len(value) <= 1000
> *   你可以假设pattern只包含字母"a"和"b"，value仅包含小写字母。

## 题目链接：[面试题 16.18. 模式匹配 (难度:中等)](https://leetcode-cn.com/problems/pattern-matching-lcci/)

## 思路

> 可以将问题看成是一个带有约束条件的子串分割问题，其中约束条件为分割后的子串需要和 pattern 能够成功匹配。由于 pattern 中只包含 a 和 b，分别代表 value 的两种不同的子串。因此我们可以用回溯的方法，先尝试性地枚举 a 和 b 所可能代表的全部子串，一旦将 a 和 b 确定后，再利用 a 和 b 对 value 进行匹配。
> 
>  注意：**本题中空串也是子串之一**

## 代码

```C++
class Solution {
public:
    // p_idx 代表当前 pattern 中字符下标
    bool dfs(int p_idx, string& pattern, string& value, vector<string>& table){
        if(pattern.size() == p_idx){
            return value.size() == 0;
        }
        int idx = pattern[p_idx] - 'a';
        // a 或 b 尚未被枚举出来
        if(table[idx] == "#"){
            for(int i = 0;i <= value.size();++i){
                string val_sub = value.substr(0, i);
                // 若 a 和 b 代表的子串相同则跳过
                if(val_sub == table[1 - idx]){
                    continue;
                }
                table[idx] = val_sub;
                string val_left = value.substr(i);
                if(dfs(p_idx + 1, pattern, val_left, table)){
                    return true;
                }
                table[idx] = "#";
            }
        }else{
            // 枚举成功后，直接利用 a 和 b 对 value 进行验证。
            int len = table[idx].size();
            string val_sub = value.substr(0, len);
            if(val_sub != table[idx]){
                return false;
            }
            string val_left = value.substr(len);
            if(dfs(p_idx + 1, pattern, val_left, table))
                return true;
        }
        return false;
    }
    bool patternMatching(string pattern, string value) {
        vector<string> table(2,"#");
        return dfs(0, pattern, value, table);
    }
};
```
