# Node BFF Practices

面向技术分享的 Node.js 接入层实践 Demo，串联三个主题：

1. **中间件顺序设计** — 顺序即架构契约
2. **AsyncLocalStorage 请求上下文** — 请求态透明传递
3. **三层限流 + 观察模式** — 生产环境安全调参

本项目代码独立、可本地运行。

## 快速开始

```bash
cd node-bff-practices
npm install
npm run dev
```

服务默认监听 `http://127.0.0.1:3100`。

## 目录结构

```
src/
├── server.ts                 # 中间件装配（分享重点）
├── middlewares/
│   ├── extract-client-id.ts  # 提取 cip/quid，必须在限流前
│   ├── rate-limit/           # IP / QUID / Global 三层限流
│   ├── server-time.ts        # 必须在 clientCtxInit 前
│   ├── client-ctx-init.ts    # AsyncLocalStorage 入口
│   └── request-context.ts    # 请求生命周期日志
├── lib/
│   ├── async-context.ts      # AsyncLocalStorage 封装
│   └── config-store.ts       # 模拟配置热更新
└── routes/index.ts           # Demo API + 管理接口
```

## 分享演示脚本

先启动服务：

```bash
npm run dev
```

### 1. AsyncLocalStorage 与 Server-Timing

```bash
curl -H 'x-lid: demo-page-01' -H 'x-life: 1200' \
  'http://127.0.0.1:3100/api/profile?t=1710000000000' \
  -H 'x-gateway-time: 1710000001'
```

观察：
- 响应头 `x-req-id` / `x-seq-id`
- 响应头 `server-timing`
- 日志中 `deep-call-log` 自动带上 `reqId`

### 2. 观察模式（Shadow Mode）

```bash
npm run demo:observation
```

观察：
- HTTP 始终 200
- 服务端日志出现 `rate-limit-exceeded-observation`

### 3. 真正限流

```bash
npm run demo:rate-limit
```

观察：
- 第 4 次请求开始返回 429
- 日志补全 `client-init` + `client-response`

### 4. 热更新限流配置

```bash
# 查看当前配置
curl http://127.0.0.1:3100/admin/rate-limit

# 切换 QUID 限流到强制模式
curl -X PATCH http://127.0.0.1:3100/admin/rate-limit/Uid \
  -H 'Content-Type: application/json' \
  -d '{"disable":false,"rateLimitMax":2}'
```

## 中间件执行顺序

```
hidePoweredBy
  → health()
  → extractClientId        # 提供 cip/quid
  → clientIPLimit          # 三层限流
  → clientIdLimit
  → globalLimit
  → errorHandler
  → serverTime             # 挂载 ctx.serverTime
  → clientCtxInit          # AsyncLocalStorage.run(...)
  → bodyParser
  → requestContext         # 生命周期日志
  → routes
```
