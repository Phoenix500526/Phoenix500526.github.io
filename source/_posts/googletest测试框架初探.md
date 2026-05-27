---
title: googletest测试框架初探
top: false
cover: false
toc: true
mathjax: true
date: 2020-10-03 10:24:20
password:
summary:
tags: [googletest, 测试框架, C++]
categories: 瑞士军刀
---

#### 在 CMake 中使用 Google-Test

示例目录的源码树：

```
$ tree
.
├── 3rd_party
│   └── google-test
│       ├── CMakeLists.txt  # 用于构建 Google Test 库的 CMake 命令
│       └── CMakeLists.txt.in # 用于下载 Google Test 的辅助脚本
├── CMakeLists.txt
├── Reverse.h
├── Reverse.cpp
├── Palindrome.h
├── Palindrome.cpp
├── unit_tests.cpp  # 基于 Google Test 测试框架的单元测试文件
# 执行命令
$ mkdir build
$ cd build
$ cmake ..
$ make
$ make test
```

测试通过：

```
$ make test
Running tests...
Test project /home/phoenix/Project/cmake-examples/05-unit-testing/google-test-download/build
    Start 1: test_all
1/1 Test #1: test_all .........................   Passed    0.01 sec

100% tests passed, 0 tests failed out of 1

Total Test time (real) =   0.01 sec
```

测试失败:

```
$ make test
Running tests...
Test project /home/phoenix/Project/cmake-examples/05-unit-testing/google-test-download/build
    Start 1: test_all
1/1 Test #1: test_all .........................***Failed    0.00 sec

0% tests passed, 1 tests failed out of 1

Total Test time (real) =   0.00 sec

The following tests FAILED:
      1 - test_all (Failed)
Errors while running CTest
Makefile:72: recipe for target 'test' failed
make: ** [test] Error 8
```

具体的测试信息会保存在 build/Testing/Temporary/LastTest.log 文件

注1：googletest 也可以使用 clang 或 g++ 进行单独编译，编译命令为：

```
$ clang++ UnitTest.cc -I ../google-test/googletest-src/googletest/include/ -L../google-test/googletest-build/googlemock/gtest -lgtest -lgtest_main -lpthread -std=c++11 -Wall
```

注2：若测试时需要有配置文件，例如一个 ConfigUnittest.cc 会读取一个测试专用的配置文件：Config_unittest.ini 时，可以在对应目录下的 CMakeLists.txt 文件中添加

```
# Config_unitest
add_executable(ConfigUnitTest Config_unittest.cc ${CMAKE_SOURCE_DIR}/Config.cc)
target_include_directories(ConfigUnitTest PUBLIC ${CMAKE_SOURCE_DIR})

target_link_libraries(ConfigUnitTest
    GTest::GTest 
    GTest::Main
)
# 将测试目录下的 Config_unittest.ini 文件拷贝至单元测试目录下
# TARGET ConfigUnitTest POST_BUILD 代表在目标 ConfigUnitTest 编译完成后，执行后续命令
# ${CMAKE_CURRENT_SOURCE_DIR}：代表当前源码目录
# $<TARGET_FILE_DIR:ConfigUnitTest>：代表被拷贝文件的目的地(TARGET_FILE_DIR)与 ConfigUnitTest 一致
add_custom_command(TARGET ConfigUnitTest POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E 
    copy ${CMAKE_CURRENT_SOURCE_DIR}/Config_unittest.ini $<TARGET_FILE_DIR:ConfigUnitTest>)
```

注3：若希望将拷贝形式变成执行 `make copy_ini_file` 的形式，则可以采用下面的 cmake 命令

```
add_custom_target(copy_ini_file)
add_custom_command(TARGET copy_ini_file 
    COMMAND ${CMAKE_COMMAND} -E 
    copy ${CMAKE_CURRENT_SOURCE_DIR}/Config_unittest.ini $<TARGET_FILE_DIR:ConfigUnitTest>)
```

**3rd_party/google-test/CmakeLists.txt.in 文件**

```
cmake_minimum_required(VERSION 3.0)

# NONE 代表该项目是非语言项目(通常语言默认为 C 或 CXX)
project(googletest-download NONE)

# ExternalProject 相当于是一个包，其中包含了许多的定义，例如下面所使用到的 ExternalProject_Add 函数
include(ExternalProject)

# Version bfc0ffc8a698072c794ae7299db9cb6866f4c0bc happens to be master when I set this up.
# To prevent an issue with accidentally installing GTest / GMock with your project you should use a
# commit after 9469fb687d040b60c8749b7617fee4e77c7f6409
# Note: This is after the release of v1.8
ExternalProject_Add(googletest
  URL               https://github.com/google/googletest/archive/bfc0ffc8a698072c794ae7299db9cb6866f4c0bc.tar.gz  # 下载 googletest 的网址
  SOURCE_DIR        "${CMAKE_CURRENT_BINARY_DIR}/googletest-src"  #下载后的源码目录
  BINARY_DIR        "${CMAKE_CURRENT_BINARY_DIR}/googletest-build"  # 编译好后的可执行文件目录
  CONFIGURE_COMMAND ""
  BUILD_COMMAND     ""
  INSTALL_COMMAND   ""
  TEST_COMMAND      ""
)
```

**3rd_party/google-test/CmakeLists.txt 文件**

```
# Download and unpack googletest at configure time
# See: http://crascit.com/2015/07/25/cmake-gtest/
configure_file(CMakeLists.txt.in googletest-download/CMakeLists.txt)
# Call CMake to download and Google Test (下载 Google Test 源码)
execute_process(COMMAND ${CMAKE_COMMAND} -G "${CMAKE_GENERATOR}" .
  RESULT_VARIABLE result
  WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/googletest-download )
if(result)
  message(FATAL_ERROR "CMake step for googletest failed: ${result}")
endif()
# Build the downloaded google test (编译 Google Test 源码)
execute_process(COMMAND ${CMAKE_COMMAND} --build .
  RESULT_VARIABLE result
  WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/googletest-download )
if(result)
  message(FATAL_ERROR "Build step for googletest failed: ${result}")
endif()

# Prevent overriding the parent project's compiler/linker
# settings on Windows  主要用于设置图形化界面，FORCE代表用用户指定的值覆盖原有的值
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
# Prevent installation of GTest with your project
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
set(INSTALL_GMOCK OFF CACHE BOOL "" FORCE)

# Add googletest directly to our build. This defines
# the gtest and gtest_main targets.
add_subdirectory(${CMAKE_CURRENT_BINARY_DIR}/googletest-src
                 ${CMAKE_CURRENT_BINARY_DIR}/googletest-build)

# Add aliases for GTest and GMock libraries 为 gtest 所用到的库添加别名
if(NOT TARGET GTest::GTest)
    add_library(GTest::GTest ALIAS gtest)
    add_library(GTest::Main ALIAS gtest_main)
endif()

if(NOT TARGET GTest::GMock)
    add_library(GMock::GMock ALIAS gmock)
    add_library(GMock::Main ALIAS gmock_main)
endif()
```

**CMakeLists.txt 文件**

```
cmake_minimum_required(VERSION 3.5)

# Set the project name
project (google_test_example)

# Add an library for the example classes
add_library(example_google_test 
    Reverse.cpp
    Palindrome.cpp
)

#############################################
# Unit tests
# 先执行 3rd_party/google-test 下的 CMakeLists.txt 文件
add_subdirectory(3rd_party/google-test)

# enable CTest testing
enable_testing()

# Add a testing executable
add_executable(unit_tests unit_tests.cpp)

target_link_libraries(unit_tests
    example_google_test
    GTest::GTest 
    GTest::Main
)

add_test(test_all unit_tests)
```

**CMakeLists.txt 编写总结：**

> 1.   最低版本要求 + 项目信息
> 
> 2.   将要测试的代码打包成待测库文件
> 
> 3.   执行 add_subdirectory 下载并构建 Google Test
> 
> 4.   打开测试开关
> 
> 5.   添加测试文件 unit_tests.cpp 为可执行目标 unit_tests
> 
> 6.   将 unit_tests 和待测库文件，以及 Google Test 的库文件链接到一起
> 
> 7.   执行 add_test 运行测试程序

**unit_tests.cpp**

```
#include <string>
#include "Reverse.h"
#include "Palindrome.h"
#include <gtest/gtest.h>

class ReverseTests : public ::testing::Test
{
};

TEST_F(ReverseTests, simple )
{
    std::string toRev = "Hello";
    Reverse rev;
    std::string res = rev.reverse(toRev);
    EXPECT_EQ(res, "olleH" );   
}

TEST_F(ReverseTests, empty )
{
    std::string toRev;
    Reverse rev;
    std::string res = rev.reverse(toRev);
    EXPECT_EQ(res, "" );
}

TEST_F(ReverseTests,  is_palindrome )
{
    std::string pal = "mom";
    Palindrome pally;
    EXPECT_TRUE(pally.isPalindrome(pal));
}
```

#### googletest 的基本知识

注意：由于历史原因，googletest 中所提到的部分术语和常规软件工程中的术语不同，以下有一张对应表格

| googletest 中的术语 | 常规软件工程中所使用的术语 | 备注信息 |
| --- | --- | --- |
| Test Case | Test Suited(测试套件) | 由一个或多个测试用例所构成的测试 |
| Test | Test Cas(测试用例) | 单个的测试代码 |

#### 断言

*   Fatal Assertion (ASSERT_*)：一旦测试不通过，立即终止测试，并返回测试信息
*   Nonfatal Assertion(EXCEPT_*)：一旦测试不通过，报告测试信息，并接着执行下一个测试

| Fatal assertion | Nonfatal assertion | Verifies |
| --- | --- | --- |
| `ASSERT_TRUE(condition);` | `EXPECT_TRUE(condition);` | `condition` is true |
| `ASSERT_FALSE(condition);` | `EXPECT_FALSE(condition);` | `condition` is false |
| `ASSERT_EQ(val1, val2);` | `EXPECT_EQ(val1, val2);` | `val1 == val2` |
| `ASSERT_NE(val1, val2);` | `EXPECT_NE(val1, val2);` | `val1 != val2` |
| `ASSERT_LT(val1, val2);` | `EXPECT_LT(val1, val2);` | `val1 < val2` |
| `ASSERT_LE(val1, val2);` | `EXPECT_LE(val1, val2);` | `val1 <= val2` |
| `ASSERT_GT(val1, val2);` | `EXPECT_GT(val1, val2);` | `val1 > val2` |
| `ASSERT_GE(val1, val2);` | `EXPECT_GE(val1, val2);` | `val1 >= val2` |
| `ASSERT_STREQ(str1,str2);` | `EXPECT_STREQ(str1,str2);` | the two C strings have the same content |
| `ASSERT_STRNE(str1,str2);` | `EXPECT_STRNE(str1,str2);` | the two C strings have different contents |
| `ASSERT_STRCASEEQ(str1,str2);` | `EXPECT_STRCASEEQ(str1,str2);` | the two C strings have the same content, ignoring case |
| `ASSERT_STRCASENE(str1,str2);` | `EXPECT_STRCASENE(str1,str2);` | the two C strings have different contents, ignoring case |

示例代码：

```
// 可在测试断言后用 << 运算符打印自己的信息
ASSERT_EQ(x.size(), y.size()) << "Vectors x and y are of unequal length";

for (int i = 0; i < x.size(); ++i) {
  EXPECT_EQ(x[i], y[i]) << "Vectors x and y differ at index " << i;
}
```

注意事项：

1.   **若 val1 和 val2 是用户自定义类型，则必须重载相应的二元运算符以支持对应的比较操作。**由于 Google C++ Style 规定禁止重载运算符，因此**只能使用如 ASSERT_TRUE( val1 < val2) 这样的形式**

2.   在一般情况下更倾向于使用 ASSERT_EQ(actual, expected) ，而不是 ASSERT_TRUE(actual == expected）。这主要是因为**当测试失败时，前者能够返回更多的信息(actual 和 expected 在实际测试中的值)**

3.   **ASSERT_EQ() 用于判断两个指针是否相等时，只会判断这两个指针变量在内存中的位置是否相同，而并不会比较两个指针所指向的内容是否相同。**要比较两个 C 风格的字符串字面值是否相等，应该采用 ASSERT_STREQ()。对于 string 对象则没有这个限制，依然可以使用 ASSERT_EQ

4.   在判断一个 C 风格的指针是否为空或不为空时，使用 *_EQ(c_str, nullptr) 或者 *_NE(c_str, nullptr)。这是因为 `nullptr` 是一种类型，而 `NULL` 不是。而且 `NULL` 指针和空的 string 对象是不同的。

#### Test 的创建

一个简单的示例：

```
// Tests factorial of 0.
TEST(FactorialTest, HandlesZeroInput) {
  EXPECT_EQ(Factorial(0), 1);
}

// Tests factorial of positive numbers.
TEST(FactorialTest, HandlesPositiveInput) {
  EXPECT_EQ(Factorial(1), 1);
  EXPECT_EQ(Factorial(2), 2);
  EXPECT_EQ(Factorial(3), 6);
  EXPECT_EQ(Factorial(8), 40320);
}
```

在上述的例子中，使用了宏 Test(TestSuitName, TestName) 来定义和命名一个测试函数(无返回值)。TestSuitName 代表测试套件的名称，而 TestName 则代表单个测试的名称。由于测试结果会按照测试套件名称进行分组，因此逻辑上相关的测试最好集中到同一个测试套件当中。另外，不同的测试套件中的同名测试互不影响。TestSuitName 和 TestName 中不能带有 '_' 字符

#### 测试夹具(Test Fixture)【测试夹具可以为多个测试提供相同的数据配置】

一个简单的示例：

```
//待测试的源文件
template <typename E>  // E is the element type.
class Queue {
 public:
  Queue();
  void Enqueue(const E& element);
  E* Dequeue();  // Returns NULL if the queue is empty.
  size_t size() const;
  ...
};
//测试夹具类
class QueueTest : public ::testing::Test {
 protected:
  void SetUp() override {
     q1_.Enqueue(1);
     q2_.Enqueue(2);
     q2_.Enqueue(3);
  }
  // 由于没有动态申请内存，因此不需要定义 TearDown 函数
  // void TearDown() override {}

  Queue<int> q0_;
  Queue<int> q1_;
  Queue<int> q2_;
};

//定义测试夹具对象
TEST_F(QueueTest, IsEmptyInitially) {
  EXPECT_EQ(q0_.size(), 0);
}

TEST_F(QueueTest, DequeueWorks) {
  int* n = q0_.Dequeue();
  EXPECT_EQ(n, nullptr);

  n = q1_.Dequeue();
  ASSERT_NE(n, nullptr);
  EXPECT_EQ(*n, 1);
  EXPECT_EQ(q1_.size(), 0);
  delete n;

  n = q2_.Dequeue();
  ASSERT_NE(n, nullptr);
  EXPECT_EQ(*n, 2);
  EXPECT_EQ(q2_.size(), 1);
  delete n;
}
```

通过例子可以看出，使用测试夹具的基本流程如下：

> 1.   从 ::testing::Test 派生一个测试夹具类(通常命名为 类名+Test)
> 2.   在夹具类中定义稍后测试所需要使用的对象。注意测试夹具类中的成员均采用 protected 作为访问限定符，以便夹具类的子类也可以访问这些成员。
> 3.   必要的情况下，编写构造函数或 SetUp 函数来进行夹具对象的初始化，并编写析构函数或 TearDown 函数来进行回收资源的工作
> 4.   若有必要，为测试定义子例程

在执行上述测试代码的过程中，会发生以下情况：

> 1.   googletest 会创建一个 QueueTest 对象 t1
> 2.   对 t1 执行 SetUp() 进行初始化
> 3.   在 t1 上运行第一个测试 IsEmptyInitially
> 4.   对 t1 执行 TearDown() 函数
> 5.   创建一个 QueueTest 对象 t2
> 6.   对 t2 对象执行 SetUp() 函数
> 7.   在 t2 上运行第二个测试 DequeueWorks
> 8.   对 t2 对象执行 TearDown() 函数

什么时候使用构造/析构函数，什么时候又应当使用 SetUp/TearDown 函数 ?

> 使用构造/析构函数的好处：
> 
> 
> 1.   在创建 test fixture 对象的时候，可以将其设置为 const，从而避免意外修改到对象当中的数据
> 2.   能够确保 test fixture 对象的派生对象在构造的时候优先构造基类子对象，析构的时候最后析构基类子对象
> 
> 
> 使用 SetUp / TearDwon 的优点：
> 
> 
> 1.   C++ 在构造函数中无法使用多态。因此在需要使用多态进行构造的场合，你只能使用 SetUp 和 TearDown 函数
> 
> 2.   C++ 构造 / 析构函数的函数体中无法使用 ASSERT_* 断言
> 
> 3.   如果 TearDown 的操作可能会抛出异常，那么只能使用 TearDown 的方式

#### 在 main 中调用测试

一个简单的示例：

```
#include "this/package/foo.h"
#include "gtest/gtest.h"

namespace my {
namespace project {
namespace {

// The fixture for testing class Foo.
class FooTest : public ::testing::Test {
 protected:
  // You can remove any or all of the following functions if their bodies would
  // be empty.

  FooTest() {
     // You can do set-up work for each test here.
  }

  ~FooTest() override {
     // You can do clean-up work that doesn't throw exceptions here.
  }

  // If the constructor and destructor are not enough for setting up
  // and cleaning up each test, you can define the following methods:

  void SetUp() override {
     // Code here will be called immediately after the constructor (right
     // before each test).
  }

  void TearDown() override {
     // Code here will be called immediately after each test (right
     // before the destructor).
  }

  // Class members declared here can be used by all tests in the test suite
  // for Foo.
};

// Tests that the Foo::Bar() method does Abc.
TEST_F(FooTest, MethodBarDoesAbc) {
  const std::string input_filepath = "this/package/testdata/myinputfile.dat";
  const std::string output_filepath = "this/package/testdata/myoutputfile.dat";
  Foo f;
  EXPECT_EQ(f.Bar(input_filepath, output_filepath), 0);
}

// Tests that Foo does Xyz.
TEST_F(FooTest, DoesXyz) {
  // Exercises the Xyz feature of Foo.
}

}  // namespace
}  // namespace project
}  // namespace my

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
```

在上述的例子当中，googletest 会自动将创建好的测试套件以及测试夹具中的测试注册起来，并通过 `RUN_ALL_TESTS()`来调用所有的测试。对于 `RUN_ALL_TESTS()` 有以下两点注意事项：

*   不要忽略 `RUN_ALL_TESTS()` 的返回值， 0 代表通过， 1 则代表失败。对于 main 函数而言，如果没有返回 `RUN_ALL_TESTS()` 的返回值会导致编译错误
*   `RUN_ALL_TESTS()` 只能调用一次。调用两次或以上的 `RUN_ALL_TESTS()` 和 googletest 的一些其他特性相冲突，因此并不被支持。
*   在调用`RUN_ALL_TESTS()`之前需要调用`::testing::InitGoogleTest(&argc, argv);`以正确解析命令行参数。这可以使得用户能够通过命令行来控制测试程序的行为

googletest 提供了一个默认的 main 函数，如果你不需要在 main 函数中完成什么定制化的操作，则可以直接将测试程序连接到 gtest_main 当中即可。
