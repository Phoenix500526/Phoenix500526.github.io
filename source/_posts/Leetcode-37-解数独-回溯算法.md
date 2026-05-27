---
title: Leetcode 37. 解数独（回溯算法）
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-13 16:15:29
password:
summary:
tags: [Leetcode, 回溯算法]
categories: 算法笔记
---

## 题目描述：

> 编写一个程序，通过已填充的空格来解决数独问题。
> 
>  一个数独的解法需遵循如下规则：
> 
>  1、数字 1-9 在每一行只能出现一次。
> 
>  2、 数字 1-9 在每一列只能出现一次。
> 
>  3、数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。
> 
>  空白格用 '.' 表示。

## Example

![](/img/jianshu-imports/8ae8bc6916f0/4114134-62c9c7051609a02e.webp)

Input

![](/img/jianshu-imports/8ae8bc6916f0/4114134-48d93e336a3ad9a3.webp)

Output

## Note

> *   给定的数独序列只包含数字 1-9 和字符 '.' 。
> *   你可以假设给定的数独只有唯一解。
> *   给定数独永远是 9x9 形式的。

## 题目链接：[37. 解数独 (困难)](https://leetcode-cn.com/problems/sudoku-solver/)

## 思路：

对于数独问题，和 N 皇后问题有一点类似，都可以采用回溯算法来求解，不过二者的不同主要体现在：

*   每个位置的状态数不同： N 皇后问题当中，对于位置 (i, j) 仅有两个状态，放或者不放皇后；而对于数独，对于位置 (i,j) 则有 9 个状态，对应 1 ~ 9 的 9 个数字
*   约束条件不同：N 皇后问题只需要考虑所在的行，列和对角线，而数独问题则需要考虑所在的行，列和对应的。

我们想尝试对每个列进行填充，如果发现冲突，则退回来尝试下一个填充值，直到填充至位置 (8,8)，则返回 true

## 代码

```
class Solution {
public:
    bool row_tab[9][9] = {false};
    bool col_tab[9][9] = {false};
    bool blk_tab[9][9] = {false};
    bool dfs(vector<vector<char>>& board,int row, int col){
        while(board[row][col] != '.'){
            if(++col >= 9){
                ++row;
                col = 0;
            }
            if(row >= 9)
                return true;
        }
        for(int val = 1;val < 10;++val){
            int blk_idx = row / 3 * 3 + col / 3;
            if(row_tab[row][val - 1] || col_tab[col][val-1] || blk_tab[blk_idx][val - 1])
                continue;
            row_tab[row][val - 1] = true;
            col_tab[col][val-1] = true;
            blk_tab[blk_idx][val - 1] = true;
            board[row][col] = val + '0';
            if(dfs(board, row,col)){
                return true;
            }else{
                row_tab[row][val - 1] = false;
                col_tab[col][val-1] = false;
                blk_tab[blk_idx][val - 1] = false;
                board[row][col] = '.';
            }
        }
        return false;
    }
    void solveSudoku(vector<vector<char>>& board) {
        //预处理
        for(int i = 0;i < 9;++i){
            for(int j = 0;j < 9;++j){
                if(board[i][j] != '.'){
                    int idx = board[i][j] - '1';
                    row_tab[i][idx] = true;
                    col_tab[j][idx] = true;
                    blk_tab[i / 3 * 3 + j / 3][idx] = true;
                }
            }
        }
        dfs(board, 0, 0);
    }
};
```

**执行结果：** 8ms, 6.5MB
