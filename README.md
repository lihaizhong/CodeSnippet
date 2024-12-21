# 小程序演示

## 工具指令

### Git Submodules

[git submodule 命令](https://www.runoob.com/git/git-submodule.html)

```bash
# 添加一个submodule
git submodule add <git-repo>

# 将新的配置从.gitmodules拷贝到.git/config
git submodule sync
# 当使用git clone下来的工程中带有submodule时，初始的时候，submodule的内容并不会自动下载下来的，此时，只需执行如下命令
git submodule update --init --recursive
```

### changeset

[changeset文档](https://github.com/changesets/changesets/tree/main)

## 问题汇总

- [#127 Generate js file from proto file with protoc](https://github.com/protocolbuffers/protobuf-javascript/issues/127#issuecomment-1204202870)

## 学习参考

### 性能优化

- [手把手教你排查Javascript内存泄漏](https://zhuanlan.zhihu.com/p/322356761)
- [如何排查网页在哪里发生了内存泄漏？](https://cloud.tencent.com/developer/article/2197388)
- [一文带你了解如何排查内存泄漏导致的页面卡顿现象](https://xie.infoq.cn/article/aa6b0d97f38a1f8b98a61b024)
- [Canvas 最佳实践（性能篇](https://fed.taobao.org/blog/taofed/do71ct/canvas-performance)
- [Chrome DevTools - Performance Tab Summary](https://stackoverflow.com/questions/61922993/chrome-devtools-performance-tab-summary)
- [Performance使用指南前端性能排查](https://pengzhenglong.github.io/2023/03/31/Performance%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97%E5%89%8D%E7%AB%AF%E6%80%A7%E8%83%BD%E6%8E%92%E6%9F%A5/)
- [Chrome Devtool](https://developer.chrome.com/docs/devtools/overview?hl=zh-cn)

### 数据结构

- [N叉树](https://www.cnblogs.com/vincent1997/p/11194100.html)

### 二进制

- [掌握JavaScript中的二进制运算，提升你的编程技能](https://developer.aliyun.com/article/1511057)
- [JS 二进制详解](https://juejin.cn/post/6933152793721208845)
- [运算符](https://wangdoc.com/javascript/operators/)

### SVGA

- [protobuf优缺点及编码原理](https://www.cnblogs.com/niuben/p/14212711.html)
