---
title: Leetcode 842. 将数组拆分成斐波那契序列
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-11 17:30:13
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述：

> 给定一个数字字符串 S，比如 S = "123456579"，我们可以将它分成斐波那契式的序列 [123, 456, 579]。
> 
>  形式上，斐波那契式序列是一个非负整数列表 F，且满足：
> 
>  0 <= F[i] <= 2^31 - 1，（也就是说，每个整数都符合 32 位有符号整数类型）；
> 
>  F.length >= 3；
> 
>  对于所有的0 <= i < F.length - 2，都有 F[i] + F[i+1] = F[i+2] 成立。
> 
>  另外，请注意，将字符串拆分成小块时，每个块的数字一定不要以零开头，除非这个块是数字 0 本身。
> 
>  返回从 S 拆分出来的任意一组斐波那契式的序列块，如果不能拆分则返回 []。

## 示例

> 示例1、
> 
>  输入: "1101111"
> 
>  输出: [110, 1, 111]
> 
>  解释: 输出 [11,0,11,11] 也同样被接受。

> 示例2
> 
>  输入："0123"
> 
>  输出：[]
> 
>  解释：每个块的数字不能以零开头，因此 "01"，"2"，"3" 不是有效答案。

## 题目链接：[842. 将数组拆分成斐波那契序列 难度:中等](https://leetcode-cn.com/problems/split-array-into-fibonacci-sequence/)

## 思路

我们可以将这个问题看成是一个带约束条件的字符串子串分割问题。对于问题的主体，也就是子串分割问题，我们可以使用深度优先搜索来解决，因此解决这个问题的关键在于如何找到约束条件。从题目表述可知约束条件有：

1.   F 数组的长度必定要大于 2 个，且第 i 个子串应当满足 F[i-1] + F[i-2] = F[i] (i >= 2)
2.   假设已知 F[i-1] 和 F[i-2] 的位数 i_1 与 i_2，则在枚举 F[i] 时，F[i] 的长度应当 max(i_1, i_2) 或 max(i_1, i_2) + 1。为了实现这个判断，我们可以用 bit_len[i] 来记录 F[i] 的长度
3.   对于任意的一个 F[i], 除了 0 以外都不应当有前导零的存在，且每个 F[i] 都在 int 表示的范围。

 确定好约束条件后，将对应的条件放入到子串分割问题的对应位置即可

## 代码

```C++
class Solution {
public:
    vector<int> ans;
    string MAX = "2147483647";
    // fib_size：已成功分割的子串数目，bit_len：存放对应位置子串的长度
    bool dfs(string& s, int fib_size, vector<int>& bit_len){
        if(s.size() == 0){
            return true;
        }
        if(s[0] == '0'){
            // 当前子串首位为 0，则判断是否满足条件3，不满足则返回
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
                // 若不满足条件 2，则返回
                if(s.size() < len){
                    return false;
                }
                for(int i = len;i < min(11,len + 2);++i){
                    string cur = s.substr(0,i);
                    if(cur.size() == 10 && cur > MAX){
                        return false;
                    }
                    int fib = stoi(cur);
                    //ans[fib_size-1] <= INT_MAX - ans[fib_size - 2] 是为了防止  ans[fib_size-1]  + ans[fib_size - 2]越界。
                    if(ans[fib_size - 1] <= INT_MAX - ans[fib_size - 2] && ans[fib_size - 1] + ans[fib_size - 2] == fib){
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
                for(int i = 1;i <= min(10,max_len);++i){
                    string cur = s.substr(0,i);
                    // 若当前子串长度和大小超过范围，则再增加子串的长度也必然会导致越界，而且连第一个符合条件的元素都找不到，直接返回false;
                    if(cur.size() == 10 && cur > MAX){
                        return false;
                    }
                    string next = s.substr(i);
                    int fib_cur = stoi(cur);
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
    vector<int> splitIntoFibonacci(string S) {
        int len = S.size();
        if(len < 3)  return ans;
        vector<int> bit_len;
        if(dfs(S, 0, bit_len))
            return ans;
        else
            return {};
    }
};
```
