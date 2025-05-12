# worker\_wallos 🎉

**worker\_wallos** 让你无需登录就能轻松预览 Wallos 订阅页面！只需要配置两个参数：`url` 和 `key`，就能快速查看订阅内容啦！😎

## 功能亮点✨

* **无需登录**：直接访问 Wallos 订阅页面

## 快速开始 🚀

### 1. 创建 Cloudflare Worker 🌐

1. **登录 Cloudflare**：

   如果你还没有 Cloudflare 账户，可以去 [Cloudflare 官网](https://www.cloudflare.com/) 注册一个。

2. **创建一个 Worker**：

   登录后进入 **Workers**，点击 **Create a Worker**。

3. **复制代码**：

   访问 [GitHub 上的代码](https://github.com/xinycai/worker_wallos/blob/main/worker.js)，复制代码并粘贴到 Cloudflare Worker 编辑器里。

4. **部署 Worker**：

   点击 **Save and Deploy**，把 Worker 发布到 Cloudflare。

5. **配置环境变量**：

   在 Worker 配置页面，设置两个环境变量：

   * `url`：填写你自己的 Wallos 订阅页面地址（例如 `https://wollos.wuxie.de`）。
   * `key`：你从 Wallos 获取的 API 密钥。

### 2. 访问

你会获得一个 URL，点击它就可以访问 Wallos 订阅页面啦！🎉

提醒：在 Wallos 后台，把主币种设置为人民币（CNY），价格才正确。

## 预览效果 👀

![img](https://r2.wuxie.de/blog/20250512_9efcfc26.png)

[点击查看预览](https://wallos.wuxie.de)

[查看 GitHub 代码](https://github.com/xinycai/worker_wallos/blob/main/worker.js)

