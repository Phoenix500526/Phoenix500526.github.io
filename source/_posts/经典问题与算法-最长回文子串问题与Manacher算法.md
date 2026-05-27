---
title: 经典问题与算法：最长回文子串问题与Manacher算法
top: false
cover: false
toc: true
mathjax: true
date: 2018-12-29 13:01:10
password:
summary:
tags: [算法基础]
categories: 算法笔记
---

> 问题描述：给定一个字符串，求出其最长回文子串的长度
> 
>  例如：对于字符串s="acaacdbab"而言，其回文子串分别为"caac"和"bab"，其中最长回文子串长度为4

##### 解法一：中心扩展法

对于这样的一个问题，一般暴力算法主要是枚举所有子串的中心位置，并在该位置上进行扩展，记录并更新最长回文子串的距离。代码实现如下：

```C++
#include "pch.h"
#include <iostream>
using namespace std;
int LongestPalindrome(const char* s, int n) {
    int i, j, c, length=0;
    if (s == 0 || n < 1)
        return 0;
    for (i = 0; i < n; i++) {
        for (j = 0; (j <= i) && (i + j <= n); j++) {
            if (s[i + j] != s[i - j])
                break;
            c = 2 * j + 1;
        }
        if (length <= c)
            length = c;
        for (j = 0; (j <= i) && (i + j <= n); ++j) {
            if (s[i - j] != s[i + j + 1])
                break;
            c = 2 * j + 2;
        }
        if (length <= c)
            length = c;
    }
    return length;
}
int main()
{
    char str[] = "acaacdbab";
    cout << LongestPalindrome(str, sizeof(str) / sizeof(char) - 1) << endl;
}
```

从代码实现上可以看出暴力算法主要存在两个缺陷：

 1、由于回文子串可以分为偶回文和奇回文两种，例如abba是偶回文，其对称中心是bb，而aba则奇回文，其对称中心是b，二者判断逻辑是不同的，所以需要分开进行处理；

 2、枚举中心采用了逐个枚举的方式，并没有有效利用到回文子串的对称性，使得代码无法高效地运行

##### 解法二：Manacher算法

Manacher算法是对暴力算法的一个优化。面对暴力算法的第一个缺点，Manacher算法采用了一种方法将所有的偶回文和奇回文都转化成为了奇回文，从而简化了代码的判断逻辑。具体的做法是这样的：**在字符串的首尾，以及每两个字符中间插入一个源字符串没有的特殊符号，使得任意长度的回文子串都可以转化为奇回文。**举个例子，在源字符串中，有"cabbac"和"bab"两个回文子串，经过处理后会转变为"#c#a#b#b#a#c#"和"#b#a#b#"，全部都转化为了奇回文。同时为了更好地处理数组的越界问题，在数组的首部添加一个哨兵位$。

 而对于第二个缺点，则是通过定义了一个回文半径数组int P[]，其中P[i]表示以字符S[i](https://www.jianshu.com/p/%E5%8C%85%E6%8B%ACS%5Bi%5D%E5%9C%A8%E5%86%85)为中心的最长回文子串向左或向右扩张的长度，例如

![P数组求解实例](/img/jianshu-imports/9859cc1b5a31/4114134-6c98ac9bf530da2f.webp)

若假设原回文串的长度为n，不管是偶回文还是奇回文，扩展后的回文串长度都为2n+1，而P[i]保存回文半径(包括S[i]在内)，则显然满足关系:(P[i]-1)*2+1=2n+1，解得P[i]-1=n。因此，要求最长回文子串长度，只需求P[i]-1的最大值即可。 
在明白了如何利用P[i]求出原始回文子串的长度后，算法接下来的重点便是**如何求解P数组**？

 Manacher算法增加了两个变量id和mx，其中id代表最长回文子串的中心字符位置，mx代表最长回文子串的右边界位置，即mx=P[id]+id。因此，根据回文子串的对称性，我们可以得出一个重要的结论：_\_若mx>i，则有P[i]≥min(P[2\_ id-i],mx-i）_*

 证明如下：

 当mx>i时，不妨记mx的对称点为my，再令j=2*id-i，则回文串可分为两种情况：

*    1、当mx-i>P[j]，以S[j]为中心字符的回文子串被包含在以S[id]为中心字符的回文子串当中，根据回文子串的对称性，必有有P[j]=P[i]，如下图：

![情况1](/img/jianshu-imports/9859cc1b5a31/4114134-21346da74160ab2e.webp)
*    2、当mx-i≤P[j]时，以S[j]为中心的回文子串只有部分包含在最长回文子串内部(即图中红框位置)，因此可以推断P[i]≥mx-i，至于超出mx后面的部分则需要另行匹配，如下图：

![情况2](/img/jianshu-imports/9859cc1b5a31/4114134-03aa2cd268fb2ac4.webp)

综合以上两种情况，便可以得出P[i]=min(P[2*id-i],mx-i)这一重要结论

 当mx≤i时，我们无法利用最长回文子串的对称性对P[i]的值做出更多假设，因此P[i]=1,然后继续进行中心扩展匹配。

 代码实现：

```C++
#include "pch.h"
#include <iostream>
#include <algorithm> 
using namespace std;
char str[] = "$#a#c#a#a#c#d#b#a#b#";
int Manacher(const char* str,int* P,int len) {
    int mx = 0;
    int id;
    int max_len = 0;
    for (int i = 1; i < len; i++){
        if (mx > i)
            P[i] = min(P[2 * id - i], mx - i);
        else
            P[i] = 1;
        while (str[i - P[i]] == str[i + P[i]])
            P[i]++;
        if (P[i] + i > mx) {
            mx = P[i] + i;
            id = i;
        }
        max_len = max(max_len, P[i] - 1);
    }
    return max_len;
}
int main()
{
    int length = sizeof(str) / sizeof(char) - 1;
    int* P = new int[length];
    memset(P, 0, length*sizeof(int));
    cout << "最长回文子串长度为：" << Manacher(str, P, length) << endl;
    delete[] P;
    return 0;
}
```

##### 算法复杂度分析

显然，对于Manacher算法，其空间复杂度为O(n)，而对于时间复杂度而言，我们考虑以下两种极端情况：

 1、字符串中不含任何回文子串，例如abcdefg，在这种情况中，由于while中的条件始终不满足，因此，循环执行的次数应当为2(n-1)，故此时时间复杂度为O(n)；

 2、设1个仅由一个字符组成的字符串str，长度为n，则经过扩展之后，长度为2n+2。由于这个字符串仅包含一个字符，故整个字符串的任意子串均为回文串，在这种情况下，while的执行次数达到最多的情况。在计算P[i]，由于对称性，仅需计算P[1....n+1]的值即可，其计算规律如下表所示：

![复杂度分析](/img/jianshu-imports/9859cc1b5a31/4114134-d7dc8f110374f836.webp)

从表中可以看出: 
> 任取i∈{1,...,n+1}，都满足P[i]=i，id=i,mx=2i>i
> 
>  因此当i>2时，有P[i]=min(P[2 _id-i],mx-i)=min(P[2_(i-1)-i,2 _(i-1)-i)成立，
> 
>  令j=2_ id-i，则有P[j]=j，进而有
> 
> 
> *   P1[i]=min(P[2 _(i-1)-i,2_(i-1)-i)=min(2 _(i-1)-i,2_(i-1)-i)=i-2

注：这是经过if判断语句后得到的P[i]初始值，为了避免和最终P[i]值相混淆，此处记为P1[i]，后续均以P1[i]代表初始值，P[i]代表最终值

随后程序进入了while循环，由于P1[i]=i-2，P[i]=i，因此可以很容易看出while循环体最多仅执行2次，故虽然代码有2层循环，但是在最坏的情况下，内存while循环最多对n-1个字符进行了2次循环(当i=1时，循环不执行；当i=2时，循环执行1次)，其余字符均不进行循环，因此整体代码的时间复杂度是O(n)。由于最坏与最好的情况下，代码的时间复杂度均为O(n)，因此代码的平均时间复杂度为O(n)。

 最后我测试了几组极端数据，所测试结果与最差情况下的证明结果相吻合，测试结果如下：

![测试结果](/img/jianshu-imports/9859cc1b5a31/4114134-cac799c94c7fbfa8.webp)

注：其中count变量为计数器，用于计算对于每个字符，while的执行次数。原始字符串长度为n=7，扩展后的字符串长度为16(包括$符)，当i=1时，内层循环执行0次；当i=2时，内层循环执行1次，当i>8(n+1)时，内存循环体均不执行，当i=(3...n+1)，内层循环执行次数均为2次。 
这也正是Manacher算法的精彩之处，巧妙地利用了之前所有计算出来的P[1...i-1]的值，在每次循环中对P[i]进行快速赋值，避免P[i]的值每次都从1开始计算，大幅削减了比较次数，最终使得求解最长回文子串长度达到了线性级复杂度O(n)，同样思想也被运用在KMP算法中。

##### 总结：

> 1、对于数组，字符串的一些问题，在需要分为奇数、偶数的情况下进行讨论时，往往可以采用填充的方式，将其转化为奇数的情况，从而简化判断逻辑。同样的做法也可以放入到一些树的判断当中，通过填充特殊结点，使一棵普通二叉树转变为完全二叉树，甚至是满二叉树，来使得问题简化；
> 
>  2、对于出现循环嵌套，且内层循环的判断条件与输入数据相关，在判断时间复杂度时，可以考虑判断最差与最优情况，若最优与最差时间复杂度相同，则一般情况下的时间复杂度应当与最优或最差的时间复杂度相同。(有点类似于数学上的夹逼定理，可以将求时间复杂度的过程近似地看成是求极限的过程)

参考资料：

 1、《Manacher 算法》：[https://subetter.com/articles/manacher-algorithm.html](https://subetter.com/articles/manacher-algorithm.html)

 2、《leetCode_5_Longest_Palindromic_Substring》：[http://windliang.cc/2018/08/05/leetCode-5-Longest-Palindromic-Substring/](http://windliang.cc/2018/08/05/leetCode-5-Longest-Palindromic-Substring/)

 3、《编程之法——面试和算法心得》
