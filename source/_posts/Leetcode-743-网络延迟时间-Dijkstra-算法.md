---
title: Leetcode 743. 网络延迟时间(Dijkstra 算法)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-25 18:31:34
password:
summary:
tags: [Leetcode, Dijkstra, 图]
categories: 算法笔记
---

## 问题描述

> 有 N 个网络节点，标记为 1 到 N。
> 
>  给定一个列表 times，表示信号经过有向边的传递时间。 times[i] = (u, v, w)，其中 u 是源节点，v 是目标节点， w 是一个信号从源节点传递到目标节点的时间。
> 
>  现在，我们从某个节点 K 发出一个信号。需要多久才能使所有节点都收到信号？如果不能使所有节点收到信号，返回 -1。

## Example

> ![](/img/jianshu-imports/e1e4b04e7b39/4114134-bd3cfa94f6172fb9.webp)
> 
> 
> 输入：times = [[2,1,1],[2,3,1],[3,4,1]], N = 4, K = 2
> 
>  输出：2

## Note

> *   N 的范围在 [1, 100] 之间。
> *   K 的范围在 [1, N] 之间。
> *   times 的长度在 [1, 6000] 之间。
> *   所有的边 times[i] = (u, v, w) 都有 1 <= u, v <= N 且 0 <= w <= 100。

## 题目链接：[743. 网络延迟时间](https://leetcode-cn.com/problems/network-delay-time/)

## 思路

从题目的描述中可知，要求网络的延迟时间，等价于求解从 K 点到网络的全部节点的最小时间的最大值。因此我们只需要用 Dijkstra 算法求出 K 到网络中剩余顶点的最短距离，然后从中选出最大值即可。

## 代码

```C++
class Solution {
private:
    typedef pair<int, int> pair;
    struct Point{
        int number;
        int distance;
        Point(int n, int d):number(n), distance(d){}
        bool operator< (Point const& p) const{
            return distance > p.distance;
        }
    };
public:
    void Dijkstra(int K, vector<vector<pair>>& graph, vector<int>& dis){
        priority_queue<Point> my_queue;
        dis[K] = 0;
        my_queue.push(Point(K,0));
        while(!my_queue.empty()){
            int u = my_queue.top().number;
            my_queue.pop();
            for(int i = 0;i < graph[u].size();++i){
                int v = graph[u][i].first;
                int d = graph[u][i].second;
                if(dis[v] > dis[u] + d){
                    dis[v] = dis[u] + d;
                    my_queue.push(Point(v, dis[v]));
                }
            }
        }
    }
    int networkDelayTime(vector<vector<int>>& times, int N, int K) {
        vector<int> dis(N + 1, INT_MAX);
        vector<vector<pair>> graph(N + 1, vector<pair>());
        for(auto const& cur:times){
            graph[cur[0]].push_back({cur[1], cur[2]});
        }
        Dijkstra(K, graph, dis);
        int ans = 0;
        for(int i = 1;i < dis.size();++i){
            if(dis[i] == INT_MAX){
                return -1;
            }
            ans = max(ans, dis[i]);
        }
        return ans;
    }
};
```

**执行结果：** 216 ms, 29.2 MB
