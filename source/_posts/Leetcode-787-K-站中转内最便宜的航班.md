---
title: Leetcode 787. K 站中转内最便宜的航班
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-26 18:32:27
password:
summary:
tags: [Leetcode, 图, 最短路径]
categories: 算法笔记
---

## 问题描述

> 有 n 个城市通过 m 个航班连接。每个航班都从城市 u 开始，以价格 w 抵达 v。
> 
>  现在给定所有的城市和航班，以及出发城市 src 和目的地 dst，你的任务是找到从 src 到 dst 最多经过 k 站中转的最便宜的价格。 如果没有这样的路线，则输出 -1。

## Example

> 示例 1
> 
>  输入:
> 
>  n = 3, edges = [[0,1,100],[1,2,100],[0,2,500]]
> 
>  src = 0, dst = 2, k = 1
> 
>  输出: 200
> 
>  解释:
> 
>  城市航班图如下
> 
> 
> 
> 
> 
> ![Image 2](/img/jianshu-imports/2222bbf6fae4/4114134-28d595323d23528a.webp)
> 
> 
> 从城市 0 到城市 2 在 1 站中转以内的最便宜价格是 200，如图中红色所示。

> 示例 2
> 
>  输入:
> 
>  n = 3, edges = [[0,1,100],[1,2,100],[0,2,500]]
> 
>  src = 0, dst = 2, k = 0
> 
>  输出: 500
> 
>  解释:
> 
>  城市航班图如下
> 
> 
> 
> 
> 
> ![Image 3](/img/jianshu-imports/2222bbf6fae4/4114134-a416c86c1f538b88.webp)
> 
> 
> 从城市 0 到城市 2 在 0 站中转以内的最便宜价格是 500，如图中蓝色所示。

## Note

> *   n 范围是 [1, 100]，城市标签从 0 到 n - 1.
> *   航班数量范围是 [0, n * (n - 1) / 2].
> *   每个航班的格式 (src, dst, price).
> *   每个航班的价格范围是 [1, 10000].
> *   k 范围是 [0, n - 1].
> *   航班没有重复，且不存在环路

## 题目链接：[787. K 站中转内最便宜的航班 (难度:中等)](https://leetcode-cn.com/problems/cheapest-flights-within-k-stops/)

## 思路

从题目的要求来看，需要我们求出从 src 到 dst 的长度不超过 K + 1 的最短路径。由于增加了路径的长度的约束，我们不能够直接地利用 Dijkstra 算法来求解，但是可以通过对其进行一点点改造来解决这个问题。我们需要做的有以下两步：

> *   将 Dijkstra 中的优先队列换为普通队列，并将搜索的最大层次定为 K + 1，这样我们便解决了路径长度不超过 K + 1 的这个约束条件。
> *   制定好对应边的松弛操作。我们用 dist[i] 来表示从 src 到节点 i 的长度不超过 K + 1 的最小花费。从 src 到 i 的最小花费要高于从 src 借助中转站 j 到 i 的最小花费，则更新 dist[i] = dist[j] + price(j, i)【price(j, i) 代表从 j 到 i 的花费】。这样当 i == dst 时，更新 ans。待搜索结束时，ans 便是最终答案

## 代码

```
class Solution {
public:
    //使用广度优先搜索，从起点向终点最多跨越 k + 1 层次
    typedef pair<int, int> pair;
    void BFS(vector<vector<pair>>& graph, int& ans, int src, int dst, int K){
        queue<pair> my_queue;
        vector<int> dist(graph.size(), INT_MAX);
        my_queue.push({src, 0});
        int level = 0;
        while(!my_queue.empty()){
            if(level > K)
                break;
            int len = my_queue.size();
            for(int i = 0;i < len;++i){
                int from = my_queue.front().first;
                int price = my_queue.front().second;
                my_queue.pop();
                for(int j = 0;j < graph[from].size();++j){
                    int to = graph[from][j].first;
                    int fee = graph[from][j].second + price;
                    // 剪枝条件
                    if(dist[to] < fee)
                        continue;
                    dist[to] = fee;
                    if(to == dst){
                        ans = min(ans, fee);
                    }else{
                        my_queue.push({to, fee});
                    }
                    
                }
            }
            ++level;
        }
    }
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int K) {
        vector<int> record;
        int ans = INT_MAX;
        vector<vector<pair>> graph(n, vector<pair>());
        for(int i = 0;i < flights.size();++i){
            graph[flights[i][0]].push_back({flights[i][1], flights[i][2]});
        }
        BFS(graph, ans, src, dst, K);
        return ans == INT_MAX ? -1 : ans;
    }
};
```

**执行结果：** 32 ms, 11.3 MB
