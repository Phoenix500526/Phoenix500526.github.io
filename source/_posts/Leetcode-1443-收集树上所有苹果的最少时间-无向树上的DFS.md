---
title: Leetcode 1443. 收集树上所有苹果的最少时间(无向树上的DFS)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 21:11:42
password:
summary:
tags: [Leetcode, 无向树上的DFS]
categories: 算法笔记
---

## 问题描述

> 给你一棵有 n 个节点的无向树，节点编号为 0 到 n-1 ，它们中有一些节点有苹果。通过树上的一条边，需要花费 1 秒钟。你从 节点 0 出发，请你返回最少需要多少秒，可以收集到所有苹果，并回到节点 0 。
> 
>  无向树的边由 edges 给出，其中 edges[i] = [fromi, toi] ，表示有一条边连接 from 和 toi 。除此以外，还有一个布尔数组 hasApple ，其中 hasApple[i] = true 代表节点 i 有一个苹果，否则，节点 i 没有苹果。

## Example

> 示例 1：
> 
> 
> 
> 
> 
> ![Image 2](/img/jianshu-imports/44f98b4152c9/4114134-495743514919ded2.webp)
> 
> 
> 输入：n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], hasApple = [false,false,true,false,false,true,false]
> 
>  输出：6
> 
>  解释：上图展示了给定的树，其中红色节点表示有苹果。一个能收集到所有苹果的最优方案由绿色箭头表示。

> 示例 2：
> 
>  输入：n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], hasApple = [false,false,false,false,false,false,false]
> 
>  输出：0

## 题目链接：[1443. 收集树上所有苹果的最少时间 (难度:中等)](https://leetcode-cn.com/problems/minimum-time-to-collect-all-apples-in-a-tree/)

## 思路

从题目的描述中可以看出，这其实是一个无向图上的搜索问题。显然从示范用例当中可以看出两个特例：

*   如果苹果的个数为 0，则收集次数为 0 次
*   如果苹果个数为 n，则显然收集次数应当为 2 * (n - 1)

 因此，我们需要先对无向树建立邻接表，并统计苹果的个数。当苹果个数 x 满足 0 < x < n 时，我们采用深度优先搜索的方式，搜索策略如下：

> 设 dfs(root, graph, hasApple, visited) 为收集根为 root 的树上的苹果所需要的最少次数
> 
> 
> *   若 root 为叶节点，则判断 root 上是否有苹果。若有，则返回 2，若没有，则返回 0；【从父节点出发去子节点摘苹果并返回，同一条边需要走两次】
> *   若 root 非叶节点，则访问所有与 root 相邻的节点，并统计它们的最少收集次数 ans。若 ans = 0，则看 root 节点上是否有苹果，有的话返回 2， 没有返回 0；

## 代码

```
class Solution {
public:
    int dfs(int root, vector<vector<int>>& graph, vector<bool>& hasApple,vector<bool>& visited){
        int ans = 0;
        visited[root] = true;
        for(int i = 0;i < graph[root].size();++i){
            if(visited[graph[root][i]])  continue;
            ans += dfs(graph[root][i], graph, hasApple,visited);
        }
        if(ans == 0){
            return hasApple[root] ? 2 : 0;
        }
        return ans + 2;
    }
    int minTime(int n, vector<vector<int>>& edges, vector<bool>& hasApple) {
        vector<vector<int>> graph(n,vector<int>{});
        vector<bool> visited(n, false);
        int cnt = 0;
        for(int i = 0;i < n - 1;++i){
            cnt += hasApple[i];
            graph[edges[i][0]].push_back(edges[i][1]);
            graph[edges[i][1]].push_back(edges[i][0]);
        }
        cnt += hasApple.back();
        if(cnt == 0){
            return 0;
        }else if(cnt == n){
            return (n - 1) * 2;
        }
        return dfs(0, graph, hasApple,visited) - 2;
    }
};
```

**执行结果：** 404 ms, 60.5 MB
