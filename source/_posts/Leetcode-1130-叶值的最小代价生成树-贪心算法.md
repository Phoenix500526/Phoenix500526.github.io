---
title: Leetcode 1130. 叶值的最小代价生成树(贪心算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-22 18:37:39
password:
summary:
tags: [Leetcode, 贪心算法]
categories: 算法笔记
---

## 问题描述

> 给你一个正整数数组 arr，考虑所有满足以下条件的二叉树：
> 
>  每个节点都有 0 个或是 2 个子节点。
> 
>  数组 arr 中的值与树的中序遍历中每个叶节点的值一一对应。（知识回顾：如果一个节点有 0 个子节点，那么该节点为叶节点。）
> 
>  每个非叶节点的值等于其左子树和右子树中叶节点的最大值的乘积。
> 
>  在所有这样的二叉树中，返回每个非叶节点的值的最小可能总和。这个和的值是一个 32 位整数。

## Example

> 输入：arr = [6,2,4]
> 
>  输出：32
> 
>  解释：
> 
>  有两种可能的树，第一种的非叶节点的总和为 36，第二种非叶节点的总和为 32。
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/179bdbbb27cd/4114134-9d1e8a0b13b1ef26.webp)

## Note:

> *   2 <= arr.length <= 40
> *   1 <= arr[i] <= 15
> *   答案保证是一个 32 位带符号整数，即小于 2^31。

## 题目链接：[1130. 叶值的最小代价生成树 (难度：中等)](https://leetcode-cn.com/problems/minimum-cost-tree-from-leaf-values/)

## 思路

题目要求分支节点和的最小值，由于分支节点的值 = 左右子树值的乘积， 因此要是分支和最小，应当尽量选相邻，且乘积最小的两个节点进行合并。我们可以借鉴哈夫曼树的构造方式，从 arr 中选择相邻且乘积最小的两个叶子节点 arr[i] 和 arr[j] 并合并成子树，然后将 max(arr[i], arr[j]) 作为新的叶子节点，并在逻辑上删除 min(arr[i], arr[j]) ，即在 visited 数组中将其标记为 true。重复这一过程，知道最后 arr 中只剩下最后一个元素即可。

## 代码

```
class Solution {
public:
    bool visited[41] = {false};
    int mctFromLeafValues(vector<int>& arr) {
        int len = arr.size();
        int ans = 0, num = len;
        while(num > 1){
            int idx = 0, tmp = INT_MAX;
            for(int i = 0;i < len - 1;++i){
                if(visited[i])
                    continue;
                int j = i + 1;
                //找到 i 后面尚未被使用到节点 j
                while(j < len && visited[j]){
                    ++j;
                }
                // 若 i 后面的所有元素都被使用过，则退出当前循环
                if(j == len)
                    break;
                if(arr[i] * arr[j] < tmp){
                    tmp = arr[i] * arr[j];
                    idx = arr[i] < arr[j] ? i : j;
                }
            }
            ans += tmp;
            visited[idx] = true;
            --num;
        }
        return ans;
    }
};
```

**执行结果：** 0 ms, 8.3 MB
