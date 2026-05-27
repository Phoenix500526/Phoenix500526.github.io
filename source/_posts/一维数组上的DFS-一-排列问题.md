---
title: 一维数组上的DFS(一):排列问题
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-14 12:15:53
password:
summary:
tags: [Leetcode, DFS, 排列问题]
categories: 算法笔记
---

## 基本问题描述

> 给定一个可包含重复数字的序列，返回所有不重复的全排列。

## Example

> 输入: [1,1,2]
> 
>  输出:
> 
>  [
> 
>  [1,1,2],
> 
>  [1,2,1],
> 
>  [2,1,1]
> 
>  ]

## 题目链接:[47. 全排列 II (难度:中等)](https://leetcode-cn.com/problems/permutations-ii/)

## 模板(枚举全排列)

```
vector<int> res(len, 0);  // 存放临时结果
vector<vector<int>> ans;
bool visited[16];  //标记已访问过的元素
void dfs(vector<int>& nums, int idx, int len){
    if(idx == len){
        ans.push_back(res);
        return;
    }
    for(int i = 0;i < len;++i){
        if(visited[i])  continue;
        // 对于最基础的全排列问题,相当于构造性和剪枝性约束条件都为永真条件
        //对于不满足构造性条件的元素,不添加入 res 当中
        if(构造性约束条件1){
            res[idx] = nums[i];
            visited[i] = true;
            // 若满足剪枝性约束,则直接回溯,不再继续递归下去
            if( ! 剪枝性约束条件){
                dfs(nums, idx + 1, len);
            }
            visited[i] = false;
        }
    }
}
```

## 思路

对于在一维数组上的 DFS 问题, 我将其分为 4 类问题,分别是排列问题, 组合问题, 子串分割问题以及其他. 对于很多一维数组上的 DFS 问题, 往往可以转化为一个基础问题 + 约束条件 st.

 回到 全排列II 问题本身,我们已知基础问题是枚举全排列,而约束条件st 则是去除重复的排列. **为了达到去除重复排列的目的,我们可以先对原有序列进行排序,使相同的元素靠在一起. 当回溯时,如果某元素 x 在上次枚举排列时已经被使用过,则在此次的枚举过程当中应当跳过.**

## 代码

```
class Solution {
public:
    bool visited[16] = {false};
    void dfs(int idx,int n,vector<int>& nums, vector<int>& res, vector<vector<int>>& ans){
        if(idx == n){
            ans.push_back(res);
            return;
        }
        int sample = INT_MIN;
        for(int i = 0;i < n;++i){
            if(visited[i] || sample == nums[i])  continue;
            visited[i] = true;
            res[idx] = nums[i];
            sample = nums[i];
            dfs(idx+1,n,nums,res,ans);
            visited[i] = false;
        }
    }
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        if(nums.empty()) return {};
        int n = nums.size();
        vector<int> res(n, 0);
        vector<vector<int>> ans;
        sort(nums.begin(),nums.end());
        dfs(0,n,nums,res,ans);
        return ans;
    }
};
```

**执行结果:** 8 ms, 7.6 MB

## 相关的练习题:

> 使用基本问题模板 + 约束条件的方法,可以将相当一部分的问题整合成一类问题,把注意力集中到如何用代码表述约束条件以及将条件放入到模板的哪个位置即可,而无需每次都针对问题去思考新的做法.
> 
> 
> 1.   问题:[Leetcode 89. 格雷编码(中等)](https://leetcode-cn.com/problems/gray-code/)【st：相邻元素的二进制表示仅有1位不同 基础问题：枚举数组[0,1,2,...]全排列并找到一个符合条件的全排列 剪枝技巧：直接生成仅有1位不同的数字】
> 
>  题解:[Leetcode 89. 格雷编码(回溯算法)](/2020/06/13/Leetcode-89-格雷编码-回溯算法/)
> 2.   问题:[1079. 活字印刷(中等)](https://leetcode-cn.com/problems/letter-tile-possibilities/) 【st：生成长度分别为1，2, .. , n 的不重复的排列 基础问题：枚举给定数组的所有长度的排列】
> 
>  题解:[Leetcode 1079. 活字印刷(回溯算法 + 带重复元素的全排列)](/2020/06/14/Leetcode-1079-活字印刷-回溯算法-带重复元素的全排列/)
> 3.   问题:[526. 优美的排列 (中等)](https://leetcode-cn.com/problems/beautiful-arrangement/)【st：第 i 位的数字能被 i 整除 或 i 能被第 i 位上的数字整除； 基础问题：枚举全排列】
> 
>  题解: [Leetcode 526. 优美的排列(回溯算法)](/2020/06/14/Leetcode-526-优美的排列-回溯算法/)
> 4.   问题: [996. 正方形数组的数目 (困难)](https://leetcode-cn.com/problems/number-of-squareful-arrays/)【st：相邻元素和为完全平方数 基础问题：枚举数组的全排列】
> 
>  题解:[Leetcode 996. 正方形数组的数目(回溯算法+全排列问题)](/2020/06/13/Leetcode-996-正方形数组的数目-回溯算法-全排列问题/)
