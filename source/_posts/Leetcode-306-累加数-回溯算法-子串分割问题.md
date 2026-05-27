---
title: Leetcode 306. 累加数(回溯算法+子串分割问题)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-16 21:46:56
password:
summary:
tags: [Leetcode, 回溯算法, 子串分割问题]
categories: 算法笔记
---

## 问题描述

> 累加数是一个字符串，组成它的数字可以形成累加序列。
> 
>  一个有效的累加序列必须至少包含 3 个数。除了最开始的两个数以外，字符串中的其他数都等于它之前两个数相加的和。
> 
>  给定一个只包含数字 '0'-'9' 的字符串，编写一个算法来判断给定输入是否是累加数。
> 
>  说明: 累加序列里的数不会以 0 开头，所以不会出现 1, 2, 03 或者 1, 02, 3 的情况。
> 
> **说明:** 累加序列里的数不会以 0 开头，所以不会出现 1, 2, 03 或者 1, 02, 3 的情况。
> 
> **进阶:**你如何处理一个溢出的过大的整数输入?

## Example

> 输入: "199100199"
> 
>  输出: true
> 
>  解释: 累加序列为: 1, 99, 100, 199。1 + 99 = 100, 99 + 100 = 199

## 题目链接：[306. 累加数 (难度：中等)](https://leetcode-cn.com/problems/additive-number/)

## 思路

同问题 [Leetcode 842. 将数组拆分成斐波那契序列](/2020/06/11/Leetcode-842-将数组拆分成斐波那契序列/) 相同，这个问题同样可视为是对子串分割问题的一个扩展。在子串分割问题的框架下，我们需要明确约束条件以及优化条件。在这个问题下，约束条件主要有两个：

> *   分割出来的子串必须满足斐波那契序列的定义
> *   对于数字而言，不允许出现前导零。换言之，如果当前模式串 s 满足 s[0] = ‘0’，则 s[0] 开头的合法子串有且仅有 0 一个。

由于在子串分割问题当中，我们需要逐步递增地尝试枚举子串长度，而在这个问题当中，若满足 F[i] + F[i+1] == F[i+2]，则显然子串 F[i+2] 的长度必定大于或等于 F[i] 或 F[i+1] 中的最长者，可以利用这一事实来优化枚举的长度。这里为了兼容**进阶**的要求，我们采用unsigned long long 类型防止溢出，最高数位可达 20 位

## 代码

```
class Solution {
public:
    typedef unsigned long long ull;
    vector<ull> ans;
    string MAX = "18446744073709551615";
    bool dfs(string& s, int fib_size, vector<int>& bit_len){
        if(s.size() == 0){
            return true;
        }
        if(s[0] == '0'){
            // 若 s[0] = '0'，且 0 本身不满足斐波那契序列的定义，则返回 false
            if(fib_size > 1 && ans[fib_size-1] + ans[fib_size-2] != 0){
                return false;
            }
            string next = s.substr(1);
            ans.push_back(0);
            bit_len.push_back(1);
            if(dfs(next, fib_size + 1, bit_len)){
                return true;
            }
            ans.pop_back();
            bit_len.pop_back();
        }else{
            if(fib_size > 1){
                int len = max(bit_len[fib_size -1], bit_len[fib_size - 2]);
                //剩余子串长度不够拆分，则返回 false
                if(s.size() < len){
                    return false;
                }
                for(int i = len;i < min(21,len + 2);++i){
                    string cur = s.substr(0,i);
                    if(cur.size() == 20 && cur > MAX){
                        return false;
                    }
                    ull fib = stoul(cur);
                    // 这里采用减法的方式可以防止加法溢出报错
                    if(ans[fib_size - 1] <= ULLONG_MAX - ans[fib_size - 2] && ans[fib_size - 1] + ans[fib_size - 2] == fib){
                        string next_fib = s.substr(i);
                        ans.push_back(fib);
                        bit_len.push_back(i);
                        if(dfs(next_fib, fib_size + 1, bit_len)){
                            return true;
                        }
                        ans.pop_back();
                        bit_len.pop_back();
                    }
                }
            }else{
               //由于斐波那契序列中元素的个数不低于 3 个当分割出来的子串个数不足两个时，
                //对子串的枚举长度不能超过原串长度的一半，否则必定无法分割成 3 个子串
                int max_len = s.size() >> 1;
                for(int i = 1;i <= min(20,max_len);++i){
                    string cur = s.substr(0,i);
                    if(cur.size() == 20 && cur > MAX){
                        return false;
                    }
                    string next = s.substr(i);
                    ull fib_cur = stoul(cur);
                    ans.push_back(fib_cur);
                    bit_len.push_back(i);
                    if(dfs(next, fib_size + 1, bit_len)){
                       return true; 
                    }
                    ans.pop_back();
                    bit_len.pop_back();
                }
            }
        }
        return false;
    }
    bool isAdditiveNumber(string num) {
        int len = num.size();
        if(len < 3) return false;
        vector<int> bit_len;
        return dfs(num, 0, bit_len);
    }
};
```

**执行结果：** 0 ms，6.4 MB
