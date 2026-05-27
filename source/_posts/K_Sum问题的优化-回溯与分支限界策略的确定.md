---
title: K_Sum问题的优化：回溯与分支限界策略的确定
top: false
cover: false
toc: true
mathjax: true
date: 2018-12-26 21:11:56
password:
summary:
tags: [算法基础]
categories: 算法笔记
---

> 问题描述：已知整型数组A[0...N-1]，给定某个数值sum，找出数组中的若干数字，使得这些数的和为sum

分析： 这个问题与之前的字符串组合问题是比较类似的，都属于子集和问题。对于每个元素都有取和不取两种可能，可以采用递归的思想来求解。我们使用has来表示a[i]被选中元素的累加和，则整个操作可分解为两种情况：

> *   若第i个数被选中，则下一步动作便是在剩余的n-i个数中选取和为sum-has-a[i]的数
> *   若第i个数不被选中，则下一步的动作，便是在剩余的n-i个数中选取和为sum-has的数

```C++
设f(X,idx,sum,has)为输出任意满足条件的组合的函数，则递归模型如下：
特殊参数声明：X是一个一维布尔数组，用于存放问题的解向量，X[i]=true代表a[i]被选中，
             X[i]=false代表a[i]不被选中
终止条件：
    f(X,idx,sum,has)≡{不做任何事情，直接return}        若idx >= size
递归体：
    f(X,idx,sum,has)≡{将X[i]置为true；输出X中对应的元素；}  若has + a[idx] == sum
    f(X,idx,sum,has)≡{将X[i]置为true；f(X, idx+1, sum, has+a[idx])} 对应情况1
    f(X,idx,sum,has)≡{将X[i]置为false；f(X, idx+1, sum,has)}        对应情况2
```

代码实现：

```C++
#include <iostream>
using namespace std;
int a[] = { -1,3,-2,5,8,-9,15 };
int size_a = sizeof(a) / sizeof(int);
void FindNumber(bool* X, int idx, int sum, int has) {
    if (idx >= size_a)
        return;
    if (has + a[idx] == sum) {
        X[idx] = true;
        for (int i = 0; i < size_a; ++i)
            if (X[i])
                cout << a[i] << ' ';
        cout << endl;
    }
    X[idx] = true;
    FindNumber(X, idx + 1, sum, has + a[idx]);
    X[idx] = false;
    FindNumber(X, idx + 1, sum, has);
}
int main()
{
    bool* X = new bool[size_a];
    memset(X, 0, size_a);
    FindNumber(X, 0, 10, 0);
    return 0;
}
```

对于每一个数组当中的元素而言，其可能的状态均有选中与不选，代码采用递归的方法对所有可能进行遍历，并从中获得满足约束条件的数的组合，因此其时间复杂度为O(2^n)。不过考虑到在进行求解的过程，有大量的解是没有继续算下去的必要，因此我们可以对这段代码的递归树进行分支限界(俗称剪枝)减少一些无用的计算，从而达到优化代码的目的。此时问题的关键就变成**如何确定一个合理的剪枝策略**。在这个问题当中，要构造一个充分条件Y，使得当Y为真时，有X[idx]=true或X[idx]=false成立是非常困难的，因为a[idx]的选择与否不仅取决于a[idx]前面的数的选择策略，还取决于a[idx]后面还剩下哪些数。**所以我们可以反过来想，从X[idx]=true或X[idx]=false出发，去构造一个必要条件来代替充分条件，进行剪枝操作。**

> 设has=∑(1...k-1)a[i]X[i]，residue=∑(k...n)a[i]，则有
> 
> 
> *   当X[i]=1时，意味着a[i]可以被选中，则必然要满足has+a[i]<=sum且has+residue>=sum 【如果某个分支满足has+residue<sum的话，那么这个分支也没有继续计算的必要。】
> *   当X[i]=0时，意味着a[i]可以不被选中，则必然要满足has+residue-a[i]>=sum 【意味着当前a[i]不选，则后续必有可选的备选方案】

代码实现：

```C++
#include <iostream>
using namespace std;
int a[] = { -1,-3,-2,5,-8,9,15 };
int size_a = sizeof(a) / sizeof(int);
void FindNumber_Optimize(bool* X, int idx, int sum, int has,int residue) {
    if (idx >= size_a)
        return;
    if (has + a[idx] == sum) {
        for (int i = 0; i < size_a; ++i)
            if (X[i])
                cout << a[i] << ' ';
        cout << a[idx] << endl;
    }
    if (has + a[idx] <= sum && has + residue >= sum) {
        X[idx] = true;
        FindNumber_Optimize(X, idx + 1, sum, has + a[idx], residue - a[idx]);
        X[idx] = false;
    }
    if (has + residue - a[idx] >= sum) {
        X[idx] = false;
        FindNumber_Optimize(X, idx + 1, sum, has, residue - a[idx]);
    }
}
int main()
{
    bool* X = new bool[size_a];
    memset(X, 0, size_a);
    int residue = 0;
    for (int i = 0; i < size_a; ++i)
        residue += a[i];
    FindNumber_Optimize(X, 0, 10, 0,residue);
    return 0;
}
```

虽然通过剪枝操作，不能提升算法的时间复杂度，但在实际运行当中，却可以大幅减少无用的运算，使得代码的效率得到提升，尤其是在数据量庞大的时候，提升的效率还是很可观的。但是需要注意的是，这种做法并不是动态规划，而是回溯+分支限界的做法。

总结：

> 1、在对递归代码进行剪枝操作时，对于剪枝策略难以确定时，需要及时转换一下思路，反过来思考，如果找不到充分条件，那就找必要条件。想明白了这点，即使无法得到有效的剪枝策略，对于理解别人写的代码也是很有帮助的。
> 
>  2、并非使用了“记忆化搜索”的方式就是动态规划，这个问题虽然也使用了一个一维的布尔数组去存储问题的解向量，也存在剪枝操作，但它的剪枝操作并不是通过查找X数组来实现，而是通过数理逻辑的方式推导出剪枝策略来实现，所以应当不属于动态规划

相关连接：字符串的排列与组合问题：[/2018/12/20/字符串的排列与组合问题/](/2018/12/20/字符串的排列与组合问题/)

 参考资料：《编程之法——面试和算法心得》
