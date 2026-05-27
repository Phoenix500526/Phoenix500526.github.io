---
title: Leetcode 802. 找到最终的安全状态
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-12 11:01:24
password:
summary:
tags: [Leetcode]
categories: 算法笔记
---

## 问题描述：

> In a directed graph, we start at some node and every turn, walk along a directed edge of the graph. If we reach a node that is terminal (that is, it has no outgoing directed edges), we stop.
> 
>  Now, say our starting node is eventually safe if and only if we must eventually walk to a terminal node. More specifically, there exists a natural number K so that for any choice of where to walk, we must have stopped at a terminal node in less than K steps.
> 
>  Which nodes are eventually safe? Return them as an array in sorted order.
> 
>  The directed graph has N nodes with labels 0, 1, ..., N-1, where N is the length of graph. The graph is given in the following form: graph[i] is a list of labels j such that (i, j) is a directed edge of the graph.

## Example

> Input: graph = [[1,2],[2,3],[5],[0],[5],[],[]]
> 
>  Output: [2,4,5,6]
> 
> Here is a diagram of the above graph.
> 
> ![](/img/jianshu-imports/8cf25a2cf8eb/4114134-99bc08c3b4f37a44.webp)

## Note

*   graph will have length at most 10000.
*   The number of edges in the graph will not exceed 32000.
*   Each graph[i] will be a sorted list of different integers, chosen within the range [0, graph.length - 1].

## 题目链接：[802. Find Eventual Safe States](https://leetcode-cn.com/problems/find-eventual-safe-states/)

## 初始思路：

对于这个问题，其实就是想要让你删除整个有向图当中的所有成环节点，剩下的节点就是安全节点。我们可以使用深度优先搜索，遍历全图，并利用 visited 数组记录某个节点的访问情况。如果这个节点在之前被访问过，说明这个节点是成环节点，直接跳过。若之前没被访问过，且可以访问到终端节点，则说明是安全节点

**代码实现**

```
class Solution {
public:
    bool visited[10001] = {false};
    bool dfs(vector<vector<int>>& graph, int from){
        if(graph[from].size() == 0)
            return true;
        bool flag = true;
        visited[from] = true;
        for(int i = 0;i < graph[from].size();++i){
            if(visited[graph[from][i]] || !flag)
                return false;
            flag &= dfs(graph, graph[from][i]);
        }
        visited[from] = false;
        return flag;
    }
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        vector<int> ans;
        for(int i = 0;i < graph.size();++i){
            if(dfs(graph, i) || !visited[i]){
                ans.push_back(i);
            }
        }
        return ans;
    }
};
```

**执行结果：**在第 102 个用例处超时。

## 优化思路

在这个问题当中，整个有向图当中的节点其实有 4 种状态：

*   0：未访问
*   1：已访问
*   2：成环节点
*   3：安全节点

而在朴素 DFS 方法当中，我们使用 bool 类型来表示了状态 0 和状态 1 的两种状态，而将状态 3 作为递归边界条件。这样会使得在状态 1 和状态 2 之间进行多次重复计算。若一个节点是成环节点，则和它相连的所有结点都是成环节点，可以直接返回。若一个结点是已访问过的结点，那需要遍历它的后继结点才能判断是否为成环结点。只有一种状态的话，无法区分，即使当前节点是成环节点，依然需要访问其所有的后继节点

**改进代码**：

```
class Solution {
public:
    //0:未访问，1：已访问；2：成环节点；3：安全节点
    int visited[10001] = {0};
    int dfs(vector<vector<int>>& graph, int from){
        if(visited[from] == 1)
            return 2;
        if(visited[from])
            return visited[from];
        visited[from] = 1;
        for(int i = 0;i < graph[from].size();++i){
            if(dfs(graph, graph[from][i]) == 2){
                visited[graph[from][i]] = 2;
                return 2;
            }
        }
        visited[from] = 3;
        return 3;
    }
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        vector<int> ans;
        for(int i = 0;i < graph.size();++i){
            if(dfs(graph, i) == 3){
                ans.push_back(i);
            }
        }
        return ans;
    }
};
```
