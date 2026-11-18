# 原生 iOS App 搭建指引（SwiftUI）

> 本目录用于**在电脑上继续开发原生版本**。仓库里已实现的 `mini-app/` 是一个功能完整的小工具；
> 原生版会把它变成一个可以上架 App Store、可以申请后台能力的正规 App。

---

## 为什么还要做原生版？

小工具版本已经能干所有事，但原生版能多拿到三样东西：

| 能力 | 小工具 | 原生 App |
| :--- | :--- | :--- |
| 拦截其他 App 通知 | ❌ 做不到 | ❌ **同样做不到**（系统限制） |
| 后台执行 | ❌ 关掉即停 | ✅ 可申请后台刷新 / 后台任务 |
| 本地通知（无需第二台设备） | ❌ | ✅ `UNUserNotificationCenter` |
| 快捷指令扩展 | ❌ | ✅ `Intents` / App Intents |
| 家庭共享 / 多设备同步 | ❌ | ✅ CloudKit |
| 上架 App Store | — | ✅ |

> ⚠️ **务必认清**：原生 App **同样无法**读取微信等第三方 App 的通知。
> 拦截层依然必须是快捷指令自动化（或其他设备的自动化工具）。
> 原生版的价值在于：更好的界面与体验、本地通知兜底、快捷指令扩展、配置同步。

---

## 一、工程创建

在 Xcode（16+）中：

1. **File → New → Project → iOS → App**
   - Product Name：`NotifyRelay`
   - Interface：**SwiftUI**
   - Language：**Swift**
   - Storage：**SwiftData**（或 Core Data）
2. **Signing & Capabilities** 添加：
   - `Push Notifications`（本地 + 远程推送）
   - `Background Modes` → `Background fetch` + `Remote notifications`（可选，用于同步配置）
3. **Info.plist** 添加 `LSApplicationQueriesSchemes`（可选，用于跳转渠道 App）

**建议的最低部署版本**：iOS 17.0（SwiftData + `@Observable`）。

---

## 二、目录结构建议

```
NotifyRelay/
├── App/
│   ├── NotifyRelayApp.swift
│   └── RootView.swift
├── Models/
│   ├── Channel.swift          # 对应 lib/channels.js 的 CHANNEL_DEFS
│   ├── RelayApp.swift         # 对应 apps[]
│   ├── RelayRules.swift       # 对应 rules
│   └── DeliveryLog.swift      # 对应 logs
├── Services/
│   ├── ChannelService.swift   # 请求构造 + 发送（对应 channels.js）
│   ├── RuleEngine.swift       # 规则判定（对应 rules.js）
│   ├── ShortcutGenerator.swift# 快捷指令参数生成（对应 shortcuts.js）
│   ├── NotificationService.swift  # 本地通知兜底
│   └── ConfigStore.swift      # 持久化 / 导出 / 导入
├── Views/
│   ├── DashboardView.swift
│   ├── AppsView.swift
│   ├── ChannelsView.swift
│   ├── RulesView.swift
│   ├── SetupGuideView.swift
│   └── Components/
│       ├── GlassTabBar.swift
│       ├── RouteChainView.swift  # 路由链路图
│       └── SignalMeterView.swift
└── Resources/
    └── Assets.xcassets
```

---

## 三、核心代码参考（从 JS 翻译）

### 3.1 渠道定义

`mini-app/lib/channels.js` 里的 `CHANNEL_DEFS` 直接翻译成 Swift：

```swift
enum ChannelType: String, Codable, CaseIterable, Identifiable {
    case bark, serverchan, pushplus, wecom, dingtalk, feishu, pushover, email, webhook

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .bark: "Bark"
        case .serverchan: "Server酱"
        case .pushplus: "PushPlus"
        case .wecom: "企业微信"
        case .dingtalk: "钉钉"
        case .feishu: "飞书"
        case .pushover: "Pushover"
        case .email: "邮件"
        case .webhook: "自定义 Webhook"
        }
    }

    var symbolName: String {
        switch self {
        case .bark: "bell.badge.fill"
        case .serverchan: "message.fill"
        case .pushplus: "megaphone.fill"
        case .wecom: "building.2.fill"
        case .dingtalk: "paperplane.fill"
        case .feishu: "leaf.fill"
        case .pushover: "iphone.gen3"
        case .email: "envelope.fill"
        case .webhook: "link"
        }
    }
}
```

### 3.2 Bark 请求构造

对应 `lib/channels.js` 的 `bark` 分支：

```swift
func buildBarkRequest(channel: Channel, payload: Payload) -> URLRequest? {
    let server = (channel.config["server"] as? String ?? "https://api.day.app")
        .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    let key = channel.config["deviceKey"] as? String ?? ""

    var components = URLComponents()
    components.scheme = "https"
    components.host = URL(string: server)?.host
    components.path = "/\(key)/\(payload.title.urlPathEncoded)/\(payload.body.urlPathEncoded)"

    var items = [URLQueryItem]()
    if let g = channel.config["group"] as? String, !g.isEmpty { items.append(.init(name: "group", value: g)) }
    if let i = channel.config["icon"] as? String, !i.isEmpty { items.append(.init(name: "icon", value: i)) }
    if let s = channel.config["sound"] as? String, !s.isEmpty { items.append(.init(name: "sound", value: s)) }
    components.queryItems = items.isEmpty ? nil : items

    guard let url = components.url else { return nil }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    return request
}
```

### 3.3 钉钉加签

对应 `channels.js` 里用 Web Crypto 做的 HMAC-SHA256，原生端用 `CryptoKit` 更简单：

```swift
import CryptoKit

func dingTalkSignedURL(token: String, secret: String) -> URL? {
    let timestamp = Int(Date().timeIntervalSince1970 * 1000)
    let stringToSign = "\(timestamp)\n\(secret)"

    let key = SymmetricKey(data: Data(secret.utf8))
    let signature = HMAC<SHA256>.authenticationCode(
        for: Data(stringToSign.utf8), using: key
    )
    let sign = Data(signature).base64EncodedString()

    var components = URLComponents()
    components.scheme = "https"
    components.host = "oapi.dingtalk.com"
    components.path = "/robot/send"
    components.queryItems = [
        .init(name: "access_token", value: token),
        .init(name: "timestamp", value: String(timestamp)),
        .init(name: "sign", value: sign),
    ]
    return components.url
}
```

### 3.4 规则引擎

对应 `lib/rules.js`：

```swift
struct RuleEngine {
    struct Verdict { let allowed: Bool; let reason: String? }

    func evaluate(_ payload: Payload,
                  app: RelayApp?,
                  rules: RelayRules,
                  recentLogs: [DeliveryLog],
                  now: Date = Date()) -> Verdict {
        guard rules.master else { return .init(allowed: false, reason: "转发总开关已关闭") }
        if let app, !app.enabled { return .init(allowed: false, reason: "该应用已禁用") }
        if rules.quietHours.enabled, isInQuietHours(rules.quietHours, at: now) {
            return .init(allowed: false, reason: "处于免打扰时段")
        }

        let text = (payload.title + " " + payload.body).lowercased()
        let keywords = app?.keywords ?? Keywords()
        if keywords.exclude.contains(where: { text.contains($0.lowercased()) }) {
            return .init(allowed: false, reason: "命中排除关键词")
        }
        if !keywords.include.isEmpty,
           !keywords.include.contains(where: { text.contains($0.lowercased()) }) {
            return .init(allowed: false, reason: "未命中包含关键词")
        }

        let perMinute = recentLogs.filter { now.timeIntervalSince($0.time) < 60 }.count
        if rules.ratePerMinute > 0, perMinute >= rules.ratePerMinute {
            return .init(allowed: false, reason: "触发每分钟频率上限")
        }

        let window = TimeInterval(rules.dedupeSeconds)
        if window > 0,
           recentLogs.contains(where: {
               $0.app == payload.app && $0.title == payload.title
               && $0.body == payload.body
               && now.timeIntervalSince($0.time) < window
           }) {
            return .init(allowed: false, reason: "重复内容（去重窗口内）")
        }
        return .init(allowed: true, reason: nil)
    }
}
```

### 3.5 跨午夜免打扰

```swift
func isInQuietHours(_ hours: QuietHours, at date: Date) -> Bool {
    guard hours.enabled else { return false }
    let calendar = Calendar.current
    let comps = calendar.dateComponents([.hour, .minute], from: date)
    let current = comps.hour! * 60 + comps.minute!
    let start = parse(hours.start), end = parse(hours.end)
    if start == end { return false }
    return start < end ? (current >= start && current < end)
                        : (current >= start || current < end)
}
```

---

## 四、玻璃拟态底栏（SwiftUI）

对应 `mini-app/style.css` 的 `.tabbar`：

```swift
import SwiftUI

struct GlassTabBar: View {
    @Binding var selection: Tab

    var body: some View {
        HStack(spacing: 2) {
            ForEach(Tab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.32, dampingFraction: 0.75)) {
                        selection = tab
                    }
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: tab.symbolName)
                            .font(.system(size: 19, weight: selection == tab ? .semibold : .regular))
                        Text(tab.title).font(.system(size: 10, weight: selection == tab ? .semibold : .regular))
                    }
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .foregroundStyle(selection == tab ? Color.accentColor : Color.secondary)
                    .background(
                        Capsule().fill(Color.accentColor.opacity(selection == tab ? 0.14 : 0))
                    )
                }
                .accessibilityLabel(tab.title)
            }
        }
        .padding(6)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().strokeBorder(.white.opacity(0.12), lineWidth: 0.5))
        .shadow(color: .black.opacity(0.35), radius: 22, y: 10)
        .padding(.horizontal, 12)
    }
}
```

> iOS 26+ 可直接用 `.glassEffect()` 获得系统级 Liquid Glass；
> 上面这份是 iOS 17+ 的兼容写法。

---

## 五、路由链路图

对应 `mini-app/components/RouteChain.jsx`，用 `Canvas` 或 `Path` 绘制：

```swift
struct RouteChainView: View {
    let apps: [RelayApp]
    let channels: [Channel]

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            VStack(alignment: .leading, spacing: 6) {
                ForEach(apps.prefix(3)) { app in
                    node(app.icon, text: app.name, alignment: .leading)
                }
            }
            connector
            VStack(alignment: .trailing, spacing: 6) {
                ForEach(channels.prefix(3)) { ch in
                    node(ch.type.symbolName, text: ch.name, alignment: .trailing)
                }
            }
        }
    }

    private var connector: some View {
        ZStack {
            Circle()
                .fill(.background)
                .overlay(Circle().strokeBorder(Color.accentColor, lineWidth: 1.6))
                .frame(width: 30, height: 30)
            Image(systemName: "plus")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(Color.accentColor)
        }
        .frame(width: 42)
    }
}
```

---

## 六、本地通知兜底（可选但推荐）

当用户**没有第二台设备**时，可以直接在本机弹通知：

```swift
import UserNotifications

final class NotificationService {
    static let shared = NotificationService()

    func requestAuthorization() async -> Bool {
        (try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    func deliver(payload: Payload, body: String) async {
        let content = UNMutableNotificationContent()
        content.title = payload.title
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        try? await UNUserNotificationCenter.current().add(request)
    }
}
```

---

## 七、App Intents 扩展（可选）

让用户能在快捷指令里直接调「发送一条转发」：

```swift
import AppIntents

struct SendToBarkIntent: AppIntent {
    static var title: LocalizedStringResource = "转发到 Bark"
    static var openAppWhenRun = false

    @Parameter(title: "标题")
    var title: String

    @Parameter(title: "正文")
    var body: String

    func perform() async throws -> some IntentResult {
        // 复用 ChannelService 发送
        .result()
    }
}
```

---

## 八、迁移小工具的配置

小工具用 `localStorage` 存的键是 `notifyrelay.v1`，结构如下：

```json
{
  "version": 1,
  "channels": [{ "id": "...", "type": "bark", "name": "Bark", "enabled": true, "config": { "deviceKey": "..." } }],
  "apps":     [{ "id": "...", "name": "微信", "icon": "💬", "enabled": true, "channelIds": [], "keywords": { "include": [], "exclude": [] } }],
  "rules":    { "master": true, "quietHours": { "enabled": false, "start": "23:00", "end": "07:00" },
                "dedupeSeconds": 30, "ratePerMinute": 20,
                "titleTemplate": "{{app}}", "bodyTemplate": "{{title}} {{body}}" },
  "logs":     [{ "id": "...", "time": 1794936959000, "app": "微信", "channel": "Bark", "title": "...", "body": "...", "status": "ok" }],
  "settings": { "theme": "system" }
}
```

原生端可以加一个「导入小工具配置」功能：让用户在 WebView 里触发下载 JSON，或直接粘贴 JSON 文本，用 `JSONDecoder` 解析（注意 `time` 是**毫秒**时间戳）。

---

## 九、开发建议顺序

1. 先把 `models/` + `services/ChannelService.swift` 写完，用 `URLSession` 打通 Bark 真实推送
2. 再做 `Views/`，直接照搬小工具的布局与配色（`style.css` 是设计系统的唯一真源）
3. `RuleEngine` 写单元测试，覆盖跨午夜、关键词、去重、限流
4. 最后做 ShortcutGenerator / App Intents / 本地通知兜底
5. 用 `docs/完整方案.md` 的验收清单逐条对照

---

## 十、别忘了核心限制

> **原生 App 依然无法读取其他 App 的通知。**
> 拦截层永远是快捷指令（或 Android 上的 Tasker）。
> 原生 App 的价值在体验、本地通知、扩展与同步，不在「绕过系统限制」。

</div>
