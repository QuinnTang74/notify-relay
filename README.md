<div align="center">

# 📲 通知转发控制台 · Notify Relay

**把 iPhone 上的应用通知，实时转发到你的其他设备。**

[![iOS](https://img.shields.io/badge/iOS-Shortcuts%20Automation-5E5CE6?style=flat-square&logo=apple)](https://support.apple.com/guide/shortcuts/welcome/ios)
[![Bark](https://img.shields.io/badge/channel-Bark-34C759?style=flat-square)](https://github.com/Finb/Bark)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-orange?style=flat-square)](#-多端移植)

一个**配置控制台**：管理「哪些应用 → 哪些渠道 → 遵守什么规则」，一键生成 iOS 快捷指令参数，测试发送、查看投递记录、导入导出配置。

</div>

---

## ⚠️ 先读这一段：一个绕不开的事实

> **iOS 不允许任何普通 App 读取其他 App 的通知。**

这不是权限没申请、也不是绕过就能解决的问题，而是系统沙盒的硬性限制，App Store 审核同样禁止此类行为。

因此本项目的架构是 **「控制台 + 系统级拦截层」**：

| 层 | 位置 | 职责 |
| :--- | :--- | :--- |
| ① 控制层 | 本项目（App / 小工具） | 配置应用、渠道、规则；生成参数；测试；日志；备份 |
| ② 拦截层 | **iOS 快捷指令**「收到通知时」个人自动化 | 真正读取通知并触发 HTTP 请求 |
| ③ 转发层 | Bark / Server酱 / 钉钉 / … | 把消息投递到其他设备或群 |
| ④ 接收层 | 你的另一台 iPhone / iPad / 电脑 / 微信群 | 收到通知 |

**好消息是：拦截层只需要配置一次。** 本项目会为你生成现成的请求参数，复制进快捷指令即可，之后全自动运行。

---

## ✨ 功能特性

### 📋 应用管理
- 内置 14 个常用应用预设（微信、短信、钉钉、支付宝、邮件、日历……），也可完全自定义
- 每个应用可独立启停、指定转发到哪些渠道
- **关键词过滤**：只转发包含特定词的通知；自动排除含特定词的通知
- 搜索、快捷添加

### 🔗 9 类转发渠道

| 渠道 | 说明 | 认证方式 |
| :--- | :--- | :--- |
| 🔔 **Bark** | 推送到装有 Bark 的 iPhone / iPad | 设备 Key（可自建服务器） |
| 💬 **Server酱** | Server酱 Turbo，微信服务号推送 | SendKey |
| 📣 **PushPlus** | pushplus.plus 多通道推送 | Token |
| 🏢 **企业微信** | 群机器人 Webhook | Webhook Key |
| 📐 **钉钉** | 群机器人，**支持加签**（HMAC-SHA256） | access_token + Secret |
| 🪶 **飞书** | 群自定义机器人 | Hook Token |
| 📲 **Pushover** | 跨平台推送 | User Key + API Token |
| 📧 **邮件** | Resend / SendGrid | API Key |
| 🔗 **自定义 Webhook** | 任意 HTTP 接口，支持变量模板 | 自定义 |

### ⚙️ 转发规则
- 总开关 · 免打扰时段（**支持跨午夜**）· 相同内容去重（秒）· 每分钟频率上限
- 标题 / 正文模板，支持 `{{app}}` `{{title}}` `{{body}}` `{{time}}` 变量
- 规则可一键套用到手动发送，用来验证配置是否符合预期

### 🧭 快捷指令设置向导
- 5 步图文指引，零基础也能照做
- **自动生成**每个应用对应的请求 URL / 方法 / 请求体，一键复制
- 明确标注 iOS 各版本在「通知正文」上的行为差异与应对方案

### 🧪 测试与记录
- 单渠道测试 / 全渠道测试 / 手动填写内容转发
- 投递记录带**信号计量条**，一眼看出成功与失败分布
- 失败时自动给出可复制的完整请求，便于粘进快捷指令绕过浏览器跨域限制

### 🎨 界面
- 深色优先的「信号路由台」视觉风格，琥珀色信号强调
- 真玻璃拟态底栏（`backdrop-filter`）+ 全套内联 SVG 矢量图标（零图标依赖）
- 路由链路图实时可视化「应用 → 快捷指令 → 渠道」
- 浅色 / 深色 / 跟随系统，支持 `prefers-reduced-motion` 与 `prefers-reduced-transparency`
- 配置仅存本地，可导出 JSON 备份

---

## 📦 仓库结构

```
.
├── README.md                 # 你正在读的文件
├── LICENSE                   # MIT
├── .gitignore
├── docs/
│   └── 完整方案.md            # 900 行完整技术方案（架构 / API 详解 / 移植指南）
├── mini-app/                 # ✅ 已实现：纯前端小工具（React + WebKit）
│   ├── app.json              # 应用元数据（名称 / 图标 / 颜色 / 描述）
│   ├── App.jsx               # 主组件：标签页、设置、主题、持久化
│   ├── style.css             # 设计系统（暗色优先 · 玻璃拟态 · 响应式）
│   ├── components/
│   │   ├── ui.jsx            # 基础组件：Card / Row / Switch / Sheet / Field…
│   │   ├── Icon.jsx          # 41 个内联 SVG 图标 + 渠道图标映射
│   │   ├── RouteChain.jsx    # 路由链路图 + 信号计量条
│   │   ├── Overview.jsx      # 概览：仪表盘、路由图、投递记录
│   │   ├── Apps.jsx          # 应用管理
│   │   ├── Channels.jsx      # 渠道管理
│   │   ├── Rules.jsx         # 规则设置
│   │   ├── Setup.jsx         # 快捷指令向导
│   │   └── TestSheet.jsx     # 测试发送抽屉
│   └── lib/
│       ├── store.js          # 状态、localStorage 读写、导入导出、版本迁移
│       ├── channels.js       # 9 类渠道请求构造 + 发送 + 模板引擎
│       ├── rules.js          # 免打扰 / 去重 / 限流 / 关键词判定
│       └── shortcuts.js      # 向导步骤与快捷指令参数生成
└── ios-app/                  # 🚧 待你在电脑上完成：原生 SwiftUI 版本
    └── README.md             # 原生工程搭建指引（见下）
```

---

## 🚀 三分钟跑起来

### 方式一：直接在手机上用（无需构建）

本项目已经是一个可直接运行的**小工具**。把 `mini-app/` 整个目录放进 iOS App 的 `~/apps/` 下，命名为 `notify-relay`：

```
~/apps/notify-relay/app.json
~/apps/notify-relay/App.jsx
~/apps/notify-relay/style.css
~/apps/notify-relay/components/*.jsx
~/apps/notify-relay/lib/*.js
```

然后在 App 的「小工具」标签页打开 **通知转发**。

### 方式二：在电脑上继续开发原生 App

见 [`ios-app/README.md`](ios-app/README.md)。

---

## 📱 使用步骤

**① 添加渠道** → 「渠道」标签 → 添加转发渠道 → 选类型 → 填凭证 → 点「测试此渠道」确认能收到。

**② 选择应用** → 「应用」标签 → 快捷添加或自定义 → 可设关键词 → 开启。

**③ 生成转发参数** → 「向导」标签 → 按 5 步在 iOS 快捷指令里建自动化。

> 快捷指令 App → 底部「自动化」→ 右上角「+」→「创建个人自动化」→「收到通知」→ 选取应用 → 「添加操作」→「获取 URL 内容」→ 展开「显示更多」填方法与 URL（POST 还要填请求体）→ 把 `{{app}}` `{{title}}` `{{body}}` 换成通知变量 → 关闭「运行前询问」。

**④ 验证** → 回到「概览」发一条测试，再让被监听 App 触发一条真实通知。

---

## 🌐 移植到其他设备

<details open>
<summary><b>📱 迁移到另一台 iPhone</b></summary>

1. 在旧机「设置 → 配置导入导出」导出 `notify-relay-config.json`
2. 传到新机，在本工具「设置与备份 → 导入配置」中选择该文件
3. **Bark 设备 Key 需要更换**：新机装 Bark 后拿到自己的 Key，在「渠道 → Bark」里改掉
4. 快捷指令不会随配置走 —— 两种方式：
   - iCloud 共享：在快捷指令长按 →「共享」→「iCloud」或直接发给自己
   - 重新生成：回到本工具「向导」页，参数已按新 Key 更新，照着 5 步重建一次
</details>

<details>
<summary><b>🤖 移植到 Android（更简单）</b></summary>

Android 可以直接读通知，不需要快捷指令这种绕路方案：

1. 装 **Tasker**（付费）或 **MacroDroid**（免费）
2. 装 **AutoNotification**（Tasker）/ 使用 MacroDroid 内置的通知事件
3. 建规则：触发器 = 「收到通知」→ 应用 = 微信
4. 动作 = **HTTP Request**
   - Method：`GET`（Bark）或 `POST`
   - URL / Body：直接用本工具「向导」页生成的参数，把 `{{app}}` `{{title}}` `{{body}}` 换成通知的标题与文本变量
   - Bark 示例：`https://api.day.app/<你的Key>/{{title}}/{{body}}`
5. 同一套渠道 API 全部通用，无需改动

> 这是 Android 方案比 iOS 简单的地方：**通知内容可以直接拿到**。
</details>

<details>
<summary><b>🏢 企业 / 团队场景</b></summary>

用「自定义 Webhook」渠道指向自己的服务端，由服务端统一扇出到 Bark、钉钉、飞书、邮件；配合 iOS 企业 MDM 下发预配置的快捷指令，可以做到全公司设备统一生效。
</details>

<details>
<summary><b>☁️ 可选增强：Cloudflare Workers 中继</b></summary>

若想**彻底绕开浏览器跨域限制**、并让规则在服务端生效，可以加一层免费中继：

- 一个固定 URL 接收推送，按配置扇出到所有渠道
- 中继侧开启 CORS，小工具与快捷指令都只需 POST 一次
- 规则（免打扰 / 去重 / 限流）挪到服务端执行，绕过 iOS 快捷指令读不到设置的问题

完整代码骨架与部署步骤见 [`docs/完整方案.md`](docs/完整方案.md) 第 6 章。
</details>

---

## ⚠️ 已知限制

| 限制 | 说明 |
| :--- | :--- |
| **规则不被快捷指令读取** | 「规则」页的关键词/免打扰/去重/限流**不会**自动作用于自动转发链路。请在快捷指令里加「如果」条件，或用 iOS「专注模式」实现免打扰。规则只在手动发送时可验证。 |
| **通知正文可用性** | iOS 各版本对「通知到达」自动化能否读取正文行为不一致。拿不到正文时，请只发送 App 名与时间。 |
| **浏览器跨域 (CORS)** | Bark / Server酱 / Pushover 等简单请求可从小工具直接发出（`no-cors`），但读不到服务端响应；JSON POST 类渠道需复制请求到快捷指令发送。 |
| **密钥存储** | 所有 Key 仅保存在设备本地 localStorage，不上传。导出的 JSON **包含明文密钥**，请妥善保管。 |
| **无法后台常驻** | 小工具不是系统 App，关掉即停止。它只负责配置与测试，自动转发由快捷指令独立完成。 |
| **规则页的频率限制** | 限流依赖本地投递记录，跨设备不共享。 |

---

## 🧪 测试与验收清单

- [ ] 小工具可正常打开，控制台无报错
- [ ] 新增 / 编辑 / 删除应用与渠道，刷新后配置仍在
- [ ] 9 类渠道各自生成正确的 URL / 方法 / 请求体
- [ ] Bark 完成至少一次真实送达（手动测试 + 快捷指令自动各一次）
- [ ] 关键词过滤、免打扰、去重、限流判定正确
- [ ] 向导生成的参数复制进快捷指令后能触发
- [ ] 导出 → 清空 → 导入，配置完全还原
- [ ] 浅色 / 深色 / 空状态 / 长文本 / 错误态显示正常
- [ ] 触摸目标 ≥ 44pt，开关均有 `aria-label`

---

## 📄 许可

MIT License © [青棠 (QuinnTang74)](https://github.com/QuinnTang74)

> 本项目与 Bark、Server酱、PushPlus、钉钉、飞书、Pushover、Resend、SendGrid 无隶属关系，
> 仅使用其公开 API 接口。

</div>
