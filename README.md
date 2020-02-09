# Memento

## 1. 安装

### 1.1 准备工作

1. 安装 nodejs：[https://nodejs.org/zh-cn/](https://nodejs.org/zh-cn/)（选择长期支持版即可）
2. 下载 [memento](https://github.com/lalambdada/memento/archive/master.zip)，并解压。如果你会使用 git，则直接 `git clone https://github.com/lalambdada/memento.git`

### 1.2 macOS/Linux 安装 memento

打开命令行工具（mac 下是 terminal）输入：

```bash
git clone https://github.com/lalambdada/rememberit.git # 下载代码
cd rememberit # 打开下载的代码所在的文件夹
npm install # 安装软件
```

以上每一行为一个命令，输入完按回车，等执行完成后再输入下一个命令。

### 1.3 Windows 安装 memento

1. 打开命令行工具（windows 下是 cmd 或者 powershell，二者皆可）后输入 `cd `（注意 cd 后面的空格），然后再用鼠标把解压出来的文件夹拖入命令行工具，并按回车。
2. 输入 `npm install` 等待软件安装完成

## 2. 运行

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

### 2.1 添加新的媒体网页

请在按照以下格式添加在 [webpage-list.yaml](./webpage-list.yaml) 中。

```
    - time: '2020-01-22'
      title: 新型肺炎疫情防控下的武汉生活
      link: 'https://mp.weixin.qq.com/s/cg4qHhta8nLx93PDaW1dHQ'
      downloaded: true
```

### 2.2 添加新的豆列

请在按照以下格式添加在 [doulists.yaml](./doulists.yaml) 中。

```
- https://www.douban.com/doulist/122759092/
```

## 3. 说明

本人 JavaScript 新手，这个程序也是我是边学 js 边写的，所以里面肯定有很多问题。欢迎大佬们提 issues。
