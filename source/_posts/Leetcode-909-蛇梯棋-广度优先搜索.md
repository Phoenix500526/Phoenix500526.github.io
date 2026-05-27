---
title: Leetcode 909. 蛇梯棋(广度优先搜索)
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-25 16:09:10
password:
summary:
tags: [Leetcode, BFS]
categories: 算法笔记
---

## 问题描述

> N x N 的棋盘 board 上，按从 1 到 N * N 的数字给方格编号，编号 从左下角开始，每一行交替方向。
> 
>  例如，一块 6 x 6 大小的棋盘，编号如下：
> 
> 
> 
> 
> 
> ![](/img/jianshu-imports/a7b5f7051509/4114134-03eadfac6516bce9.webp)
> 
> 
> r行 c 列的棋盘，按前述方法编号，棋盘格中可能存在 “蛇” 或 “梯子”；如果 board[r][c] != -1，那个蛇或梯子的目的地将会是 board[r][c]。
> 
>  玩家从棋盘上的方格 1 （总是在最后一行、第一列）开始出发。
> 
>  每一回合，玩家需要从当前方格 x 开始出发，按下述要求前进：
> 
>  选定目标方格：选择从编号 x+1，x+2，x+3，x+4，x+5，或者 x+6 的方格中选出一个目标方格 s ，目标方格的编号 <= N * N。
> 
>  该选择模拟了掷骰子的情景，无论棋盘大小如何，你的目的地范围也只能处于区间 [x+1, x+6] 之间。
> 
>  传送玩家：如果目标方格 S 处存在蛇或梯子，那么玩家会传送到蛇或梯子的目的地。否则，玩家传送到目标方格 S。
> 
>  注意，玩家在每回合的前进过程中最多只能爬过蛇或梯子一次：就算目的地是另一条蛇或梯子的起点，你也不会继续移动。
> 
>  返回达到方格 N*N 所需的最少移动次数，如果不可能，则返回 -1。

## Example

> 示例图见 “问题描述” 中的图片
> 
>  输入：[
> 
>  [-1,-1,-1,-1,-1,-1],
> 
>  [-1,-1,-1,-1,-1,-1],
> 
>  [-1,-1,-1,-1,-1,-1],
> 
>  [-1,35,-1,-1,13,-1],
> 
>  [-1,-1,-1,-1,-1,-1],
> 
>  [-1,15,-1,-1,-1,-1]]
> 
>  输出：4
> 
>  解释：
> 
>  首先，从方格 1 [第 5 行，第 0 列] 开始。
> 
>  你决定移动到方格 2，并必须爬过梯子移动到到方格 15。
> 
>  然后你决定移动到方格 17 [第 3 行，第 5 列]，必须爬过蛇到方格 13。
> 
>  然后你决定移动到方格 14，且必须通过梯子移动到方格 35。
> 
>  然后你决定移动到方格 36, 游戏结束。
> 
>  可以证明你需要至少 4 次移动才能到达第 N*N 个方格，所以答案是 4。

## Note

> *   2 <= board.length = board[0].length <= 20
> *   board[i][j] 介于 1 和 N*N 之间或者等于 -1。
> *   编号为 1 的方格上没有蛇或梯子。
> *   编号为 N*N 的方格上没有蛇或梯子。

## 题目链接：[909. 蛇梯棋 (难度:中等)](https://leetcode-cn.com/problems/snakes-and-ladders/)

## 思路

这个问题有两个关键点，一个是要将给定的编号 num 转换为棋盘上对应的坐标(x , y)；另一个则是要注意，由于梯子和蛇都是必须要经过的，因此棋盘当中可能会存在环。

 对于第一个任务，我们只需要去模拟棋盘上数字的分布规律即可。

 对于第二个任务，我们可以用一个 visited 数组来标记所有经过的点(包含了用骰子掷出来的编号，也包含了利用蛇或是梯子经过的点的编号)。**虽然棋盘规则当中没有规定走过的点不能重复走，但是由于题目要求的是移动的最小次数，而重复走的点对于最小移动次数是没有贡献的，因此该策略是完备的**(即只要有解就必定能搜出来，如果搜不出来说明必定没有解)。

## 代码

```C++
class Solution {
public:
    inline void getCoordinate(int N,int num, int& row, int& col){
        row = N - 1 - (num - 1) / N;
        int tmp = (num - 1) % N;
        col = (N - row) & 1 ? tmp : N - 1 - tmp;
    }
    int snakesAndLadders(vector<vector<int>>& board) {
        int N = board.size();
        vector<vector<bool>> visited(N, vector<bool>(N, false));
        queue<int> my_queue;
        my_queue.push(1);
        int times = 0;
        bool flag = false;
        while(!my_queue.empty()){
            int len = my_queue.size();
            for(int i = 0;i < len;++i){
                auto cur = my_queue.front();
                my_queue.pop();
                if(cur == N * N){
                    flag = true;
                    break;
                }
                for(int j = 1;j <= 6;++j){
                    int num = cur + j;
                    if(num > N * N)
                        break;
                    int nx = 0, ny = 0;
                    getCoordinate(N,num, nx, ny);
                    if(visited[nx][ny])
                        continue;
                    visited[nx][ny] = true;
                    if(board[nx][ny] == -1){
                        my_queue.push(num);
                    }else{
                        my_queue.push(board[nx][ny]);
                        visited[nx][ny] = true;
                    }
                }
            }
            if(flag)
                break;
            ++times;
        }
        return flag ? times : -1;
    }
};
```

**执行结果：** 32 ms, 12 MB
