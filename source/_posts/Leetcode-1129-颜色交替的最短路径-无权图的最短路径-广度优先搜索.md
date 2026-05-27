---
title: Leetcode 1129. 颜色交替的最短路径（无权图的最短路径 + 广度优先搜索）
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-27 18:07:36
password:
summary:
tags: [Leetcode, BFS, 图]
categories: 算法笔记
---

## 问题描述

> 在一个有向图中，节点分别标记为 0, 1, ..., n-1。这个图中的每条边不是红色就是蓝色，且存在自环或平行边。
> 
>  red_edges 中的每一个 [i, j] 对表示从节点 i 到节点 j 的红色有向边。类似地，blue_edges 中的每一个 [i, j] 对表示从节点 i 到节点 j 的蓝色有向边。
> 
>  返回长度为 n 的数组 answer，其中 answer[X] 是从节点 0 到节点 X 的最短路径的长度，且路径上红色边和蓝色边交替出现。如果不存在这样的路径，那么 answer[x] = -1。

## Example

> 示例 1
> 
>  输入：n = 3, red_edges = [[0,1],[1,2]], blue_edges = []
> 
>  输出：[0,1,-1]

> 示例 2
> 
>  输入：n = 3, red_edges = [[0,1],[0,2]], blue_edges = [[1,0]]
> 
>  输出：[0,1,1]

## Note

> *   1 <= n <= 100
> *   red_edges.length <= 400
> *   blue_edges.length <= 400
> *   red_edges[i].length == blue_edges[i].length == 2
> *   0 <= red_edges[i][j], blue_edges[i][j] < n

## 题目链接：[1129. 颜色交替的最短路径 (难度:中等)](https://leetcode-cn.com/problems/shortest-path-with-alternating-colors/)

## 思路

题目要求我们找出一个无权图中的最短红蓝交替路径。显然，对于无权图的最短路径，我们可以用广度优先搜索算法来实现(搜索层次就是最短距离)。**因此，问题就转变成了，如何保证最短路径是红蓝交替的。**显然一个直观且易行的方法就是把图拆分成红边图和蓝边图，每次都根据搜索的层次交替地在红图和蓝图中找边即可。另外将图分割成红图和蓝图，便可以使用 visited 数组进行标记，避免在相同颜色的边中去访问先前访问过的点。(**此处需要注意：题目当中没有指定一定是红蓝交替，也有可能出现蓝红交替，因此我们需要按第一条边是红色和第一条边是蓝色的情况对图进行两次广度优先搜索**)

## 代码

```
class Solution {
public:
    void BFS(vector<vector<int>>& red_graph, vector<vector<int>>& blue_graph, vector<int>& ans, bool flag){
        int n = ans.size();
        vector<bool> red_visited(n, false);
        vector<bool> blue_visited(n, false);
        red_visited[0] = true;
        blue_visited[0] = true;
        queue<int> my_queue;
        my_queue.push(0);
        int steps = 0;
        while(!my_queue.empty()){
            ++steps;
            int len = my_queue.size();
            for(int i = 0;i < len;++i){
                int u = my_queue.front();
                my_queue.pop();
                if((steps & 1) == flag){
                    for(int j = 0;j < red_graph[u].size();++j){
                        int v = red_graph[u][j];
                        if(red_visited[v])
                            continue;
                        red_visited[v] = true;
                        if(ans[v] == -1 || steps < ans[v])
                            ans[v] = steps;
                        my_queue.push(v);
                    }
                }else{
                    for(int j = 0;j < blue_graph[u].size();++j){
                        int v = blue_graph[u][j];
                        if(blue_visited[v])
                            continue;
                        blue_visited[v] = true;
                        if(ans[v] == -1 || steps < ans[v])
                            ans[v] = steps;
                        my_queue.push(v);
                    }
                }
            }
        }
    }
    vector<int> shortestAlternatingPaths(int n, vector<vector<int>>& red_edges, vector<vector<int>>& blue_edges) {
        vector<vector<int>> red_graph(n, vector<int>());
        vector<vector<int>> blue_graph(n, vector<int>());
        for(auto const &cur:red_edges){
            red_graph[cur[0]].push_back(cur[1]);
        }
        for(auto const &cur:blue_edges){
            blue_graph[cur[0]].push_back(cur[1]);
        }
        vector<int> ans(n, -1);
        ans[0] = 0;
        BFS(red_graph, blue_graph, ans, true);
        BFS(red_graph, blue_graph, ans, false);
        return ans;
    }
};
```

**执行结果：** 32 ms, 13.7 MB
