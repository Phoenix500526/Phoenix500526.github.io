---
title: Leetcode 529. 扫雷游戏(二维矩阵上的DFS)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-16 22:55:14
password:
summary:
tags: [Leetcode, 二维矩阵上的DFS]
categories: 算法笔记
---

## 问题描述

> 让我们一起来玩扫雷游戏！
> 
>  给定一个代表游戏板的二维字符矩阵。 'M' 代表一个未挖出的地雷，'E' 代表一个未挖出的空方块，'B' 代表没有相邻（上，下，左，右，和所有4个对角线）地雷的已挖出的空白方块，数字（'1' 到 '8'）表示有多少地雷与这块已挖出的方块相邻，'X' 则表示一个已挖出的地雷。
> 
>  现在给出在所有未挖出的方块中（'M'或者'E'）的下一个点击位置（行和列索引），根据以下规则，返回相应位置被点击后对应的面板：
> 
> 
> *   如果一个地雷（'M'）被挖出，游戏就结束了- 把它改为 'X'。
> *   如果一个没有相邻地雷的空方块（'E'）被挖出，修改它为（'B'），并且所有和其相邻的方块都应该被递归地揭露。
> *   如果一个至少与一个地雷相邻的空方块（'E'）被挖出，修改它为数字（'1'到'8'），表示相邻地雷的数量。
> *   如果在此次点击中，若无更多方块可被揭露，则返回面板。

## Example

> 输入:
> 
>  [['E', 'E', 'E', 'E', 'E'],
> 
>  ['E', 'E', 'M', 'E', 'E'],
> 
>  ['E', 'E', 'E', 'E', 'E'],
> 
>  ['E', 'E', 'E', 'E', 'E']]
> 
> 
> Click : [3,0]
> 
> 
> 输出:
> 
>  [['B', '1', 'E', '1', 'B'],
> 
>  ['B', '1', 'M', '1', 'B'],
> 
>  ['B', '1', '1', '1', 'B'],
> 
>  ['B', 'B', 'B', 'B', 'B']]
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/d367026a9d2d/4114134-d910c27a4a590d2e.webp)
> 
> 
> 示例解释

## Note

> *   输入矩阵的宽和高的范围为 [1,50]。
> *   点击的位置只能是未被挖出的方块 ('M' 或者 'E')，这也意味着面板至少包含一个可点击的方块。
> *   输入面板不会是游戏结束的状态（即有地雷已被挖出）。
> *   简单起见，未提及的规则在这个问题中可被忽略。例如，当游戏结束时你不需要挖出所有地雷，考虑所有你可能赢得游戏或标记方块的情况。

## 题目链接：[529. 扫雷游戏 (难度:中等)](https://leetcode-cn.com/problems/minesweeper/)

## 思路

从题目的描述上来看，这应当属于是一个二维矩阵的上的深度优先搜索问题。我们需要从题目的描述以及示例当中发现游戏的规则，主要有以下两个：

> *   如果 board[x][y] 周围的 8 个格子当中有 M 颗地雷，我们需要将 board[x][y] 置为 M，同时停止递归直接返回。(这样做确保不越过数字边界，踩到地雷。数字边界就是示例解释中的 ‘1’)
> *   若 board[x][y] 的周围没有雷，直接将 board[x][y] 置为 ‘B', 同时递归处理 board[x][y] 周围的 8 个格子。

我们先试探性地将 board[x][y] 置为 ‘B’，然后进行两次循环，第一次统计周围雷数，第二次更新 board[x][y] 的地雷信息。具体过程见代码

## 代码

```
class Solution {
public:
    int direction[8][2] = {{0,1},{1,1},{1,0},{1,-1},{0,-1},{-1,-1},{-1,0},{-1,1}};
    int row = 0, col = 0;
    void dfs(vector<vector<char>>& board, int x, int y){
        board[x][y] = 'B';
        int mine = 0;
        for(int i = 0;i < 2;++i){
            for(int j = 0;j < 8;++j){
                int nx = x + direction[j][0];
                int ny = y + direction[j][1];
                if(nx < 0 || nx >= row || ny < 0 || ny >= col || board[nx][ny] == 'B' || isdigit(board[nx][ny]))
                    continue;
                if(i == 0 && board[nx][ny] == 'M')
                    ++mine;
                if(i == 1){
                    if(mine == 0){
                        dfs(board,nx,ny);
                    }else{
                        board[x][y] = '0' + mine;
                        return;
                    }
                }
            }
        }        
    }
    vector<vector<char>> updateBoard(vector<vector<char>>& board, vector<int>& click) {
        int x = click[0], y = click[1];
        row = board.size(), col = board[0].size();
        if(board[x][y] == 'M'){
            board[x][y] = 'X';
        }else if(board[x][y] == 'E'){
            dfs(board,x,y);
        }
        return board;
    }
};
```

**执行结果：** 64 ms, 16 MB
