---
title: Leetcode 863. 二叉树中所有距离为 K 的结点
top: false
cover: false
toc: true
mathjax: true
date: 2020-06-24 22:54:23
password:
summary:
tags: [Leetcode, 二叉树, BFS]
categories: 算法笔记
---

## 问题描述

> 给定一个二叉树（具有根结点 root）， 一个目标结点 target ，和一个整数值 K 。
> 
>  返回到目标结点 target 距离为 K 的所有结点的值的列表。 答案可以以任何顺序返回。

## Example

> 输入：root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, K = 2
> 
>  输出：[7,4,1]
> 
>  解释：
> 
>  所求结点为与目标结点（值为 5）距离为 2 的结点，
> 
>  值分别为 7，4，以及 1
> 
> 
> 
> 
> 
> ![Image 2](/img/jianshu-imports/52ab38665b27/4114134-3b892f77b76fa2aa.webp)

## Note

> *   给定的树是非空的。
> *   树上的每个结点都具有唯一的值 0 <= node.val <= 500 。
> *   目标结点 target 是树上的结点。
> *   0 <= K <= 1000.

## 题目链接：[863. 二叉树中所有距离为 K 的结点 (难度:中等)](https://leetcode-cn.com/problems/all-nodes-distance-k-in-binary-tree/)

## 思路

从题目的表述可以看出，这个题目需要我们做两件事情：

> 1.   从 root 向下找到所有距离为 k 的节点
> 2.   从 root 的祖先节点 father 中，找到所有位于 father 另一子树的与 root 距离为 k - x 的节点(其中 root 与 father 的距离为 x)。

对于第一个任务，直接采用先序遍历即可。对于第二个任务，同样采用先序遍历，但在回溯时会返回 root 与 father 之间的距离 x，然后再在 father 的另一棵子树中搜索距离为 k - x 的所有节点

## 代码

```
class Solution {
public:
    typedef pair<bool, int> pair;
    vector<int> ans;
    void search_in_child(TreeNode* root, int K){
        if(root == NULL)  return;
        if(K == 0){
            ans.push_back(root->val);
            return;
        }
        search_in_child(root->left, K - 1);
        search_in_child(root->right, K - 1);
    }
    int search_in_parent(TreeNode* root, TreeNode* target, int K){
        if(root == NULL){
            return 0;
        }
        if(root == target){
            return 1;
        }
        int l_dis = search_in_parent(root->left, target, K);
        if(l_dis){
            if(l_dis == K){
                ans.push_back(root->val);
            }else{
                search_in_child(root->right, K - 1 - l_dis);
            }
            return l_dis + 1;
        }
        int r_dis = search_in_parent(root->right, target, K);
        if(r_dis){
            if(r_dis == K){
                ans.push_back(root->val);
            }else{
                search_in_child(root->left,K - 1 - r_dis);
            }
            return r_dis + 1;
        }
        return 0;
    }
    vector<int> distanceK(TreeNode* root, TreeNode* target, int K) {
        search_in_child(target,K);
        search_in_parent(root, target, K);
        return ans;
    }
};
```

**执行结果：** 4 ms, 12.6 MB
