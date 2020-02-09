# memento

## 安装

### macOS/Linux

#### 准备工作

1. 安装 nodejs：[https://nodejs.org/zh-cn/](https://nodejs.org/zh-cn/)（选择长期支持版即可）

#### 安装

打开命令行工具（terminal）输入：

```bash
git clone https://github.com/lalambdada/rememberit.git # 下载代码
cd rememberit # 打开下载的代码所在的文件夹
npm install # 安装软件
```

以上每一行为一个命令，输入完按回车，等执行完成后再输入下一个命令。

### Windows

[TODO]

## 运行

- 如果要抓取媒体报道集合 [webpage-list.yaml](./webpage-list.yaml) 里的页面，输入：

```bash
npm run start:webpage
```

程序运行完会自动退出。抓取的页面保存在 `webpages` 这个文件夹里。

- 如果要抓取豆列集合 [doulists.yaml](./doulists.yaml) 里的页面，输入：

```bash
npm run start:doulist
```

程序运行完后自动退出。抓取的页面保存在 `doulist` 这个文件夹里。

- 如果要实时监控豆列集合 [doulists.yaml](./doulists.yaml) 里内容的添加情况，并在发现增加后抓取，输入：

```bash
npm run start:doulist:polling
```

程序会一直运行下去，直到被用户手动关闭。抓取的页面保存在 `doulist` 这个文件夹里。

