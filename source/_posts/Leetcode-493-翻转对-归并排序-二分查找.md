---
title: Leetcode 493. 翻转对(归并排序+二分查找)
top: false
cover: false
toc: true
mathjax: true
date: 2020-09-16 20:52:39
password:
summary:
tags: [Leetcode, 归并排序, 二分查找]
categories: 算法笔记
---

#### 问题描述

> 给定一个数组 nums ，如果 i < j 且 nums[i] > 2*nums[j] 我们就将 (i, j) 称作一个重要翻转对。
> 
>  你需要返回给定数组中的重要翻转对的数量。

#### Example

> 示例 1:
> 
>  输入: [1,3,2,3,1]
> 
>  输出: 2

> 示例 2:
> 
>  输入: [2,4,3,5,1]
> 
>  输出: 3

#### 题目链接: [493. 翻转对(难度：困难)](https://leetcode-cn.com/problems/reverse-pairs/)

#### 思路

这道题可以采用归并排序 + 二分查找来解决。我们可以先考虑一个最简单的情况，如 [-10, -6]，我们可以先将 [-10, -10] 分割为 L 和 R 两个子数组，其中 L = [-10], R = [-6]。显然，L 和 R 中都只有一个元素，本身就是有序数组，同时翻转对数为0。将 L 和 R 合并排序，由于 L[0] > 2 * R[0], 得到排序后的数组为 [-10, -6], 且翻转对数为 1。

 上述过程大体上描绘了代码主体的框架，要求出一个数组的翻转对数，我们需要将其划分为 L 和 R，并求出 L 和 R 中的翻转对数 v1 和 v2，然后对排好序的 L 和 R 进行合并排序，得到翻转对数 v3，则数组本身的翻转对数就是 v1 + v2 + v3。

 这道题有两个值得注意的细节：

> *   在对 L 和 R 进行合并排序的过程中，由于 L 和 R 都是有序数组，因此可以使用二分查找来优化
> *   由于可能存在负数，因此可能会出现 L[i] < R[j], 但 L[i] > 2 * R[j] 的情况，对于这种情况，需要从头扫描整个数组，因为 L[i] 前面的元素也可能大于 2 * R[j]。若为正数，则直接扫描 L[i, end) 即可，因为L[i] 前面的元素小于 L[i]，而 L[i] < 2 * R[j]， 所以 L[i] 前面的元素也都不需要考虑了

#### 代码

```
class Solution {
public:
    using ull = unsigned long long;
    static const int MAX = 50000;
    long long L[MAX / 2 + 2] = {0}, R[MAX / 2 + 2] = {0};
    ull Merge(vector<int>& nums, int left, int mid, int right){
        int L_end = mid - left;
        int R_end = right - mid;
        for(int i = 0;i < L_end;++i)
            L[i] = nums[left + i];
        for(int i = 0;i < R_end;++i)
            R[i] = nums[mid + i];
        L[L_end] = static_cast<long long>(numeric_limits<int>::max()) + 2;
        R[R_end] = static_cast<long long>(numeric_limits<int>::max()) + 2;
        ull cnt = 0;
        int i = 0, j = 0;
        for(int k = left;k < right;++k){
            if(L[i] < R[j]){
                nums[k] = L[i++];
            }else{
                if(R[j] < 0)
                    cnt += L_end - (upper_bound(L, L + L_end, R[j] * 2) - L);
                else
                    cnt += L_end - (upper_bound(L + i, L + L_end, R[j] * 2) - L);
                nums[k] = R[j++];
            }
        }
        return cnt;
    }
    int MergeSort(vector<int>& nums, int left, int right){
        ull v1 = 0, v2 = 0, v3 = 0;
        if(left + 1 < right){
            int mid = (left + right) >> 1;
            v1 = MergeSort(nums, left, mid);
            v2 = MergeSort(nums, mid, right);
            v3 = Merge(nums, left, mid, right);
        }
        return v1 + v2 + v3;
    }
    int reversePairs(vector<int>& nums) {
        return MergeSort(nums, 0, nums.size());
    }
};
```

**运行结果：**456ms, 42 MB

#### 相关练习：

#### [剑指 Offer 51. 数组中的逆序对(难度：困难)](https://leetcode-cn.com/problems/shu-zu-zhong-de-ni-xu-dui-lcof/)

#### [315. 计算右侧小于当前元素的个数(难度：困难)](https://leetcode-cn.com/problems/count-of-smaller-numbers-after-self/)
