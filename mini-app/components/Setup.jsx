import { useEffect, useState } from 'react';
import { Card, Button, Code, Empty, SectionTitle, Chip } from './ui.jsx';
import Icon, { CHANNEL_ICONS } from './Icon.jsx';
import { STEPS, buildSetup, formatRequest } from '../lib/shortcuts.js';

export default function Setup({ state, onToast }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    buildSetup(state).then((data) => {
      if (alive) setItems(data);
    });
    return () => { alive = false; };
  }, [state]);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      onToast('已复制');
    } catch {
      onToast('复制失败，请长按文本选择');
    }
  }

  const hasApps = (state.apps || []).some((a) => a.enabled !== false);
  const hasChannels = (state.channels || []).some((c) => c.enabled !== false);

  if (!hasApps || !hasChannels) {
    return (
      <Card>
        <Empty
          icon={<Icon name="compass" size={42} />}
          title="先完成基础配置"
          text="至少需要 1 个启用的应用和 1 个启用的渠道，才能生成设置向导。"
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="setup-lead">
          在这个 App 里做的选择不会自动写进 iOS。<b>只需在「快捷指令」里设置一次</b>，之后收到对应 App 的通知就会自动转发到下面列出的渠道。
        </div>
      </Card>

      <SectionTitle>操作步骤</SectionTitle>
      <Card>
        {STEPS.map((s) => (
          <div className="step" key={s.n}>
            <div className="step-n">{s.n}</div>
            <div className="step-body">
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.text}</div>
            </div>
          </div>
        ))}
      </Card>

      <SectionTitle>为每个应用生成的内容</SectionTitle>
      {items.map(({ app, requests }) => (
        <Card key={app.id}>
          <div className="setup-app-head">
            <div className="setup-app-title">{app.icon || '📱'} {app.name}</div>
            <div className="setup-app-sub">
              触发条件：收到「{app.name}」的通知时 · {requests.length} 个渠道
            </div>
          </div>
          {requests.map((req, i) => (
            <div className="req-block" key={i}>
              <div className="req-head">
                <span><Icon name={CHANNEL_ICONS[req.channel.type] || 'link'} size={16} /> {req.channel.name}</span>
                <Chip onClick={() => copy(formatRequest(req))}><Icon name="copy" size={14} /> 复制</Chip>
              </div>
              <Code>{formatRequest(req)}</Code>
              {req.note && <div className="field-hint">{req.note}</div>}
              {req.error && <div className="field-hint" style={{ color: 'var(--red)' }}>{req.error}</div>}
              <div className="req-actions">
                <Button variant="secondary" onClick={() => copy(req.url)}><Icon name="link" size={15} /> 仅复制地址</Button>
              </div>
            </div>
          ))}
          {!requests.length && <div className="field-hint">该应用未选择任何渠道。</div>}
        </Card>
      ))}

      <Card>
        <div className="note-text">
          <b>关于规则：</b>「规则」页的关键词、免打扰、去重、限流<i>不会</i>被快捷指令自动读取。若需要这些效果，请在快捷指令里添加「如果」条件，或用 iOS「专注模式」在免打扰时段屏蔽通知。
          <br /><br />
          <b>关于正文：</b>iOS 不同版本对「通知到达」自动化能否读取通知正文的行为不一致。如果你的快捷指令拿不到正文，就只发送 App 名和时间，或使用「概览 → 快速测试发送」手动转发。
          <br /><br />
          <b>关于失败：</b>这里生成的请求与快捷指令原生发送一致；若渠道密钥错误或服务端拒绝，请回到「渠道」检查配置。
        </div>
      </Card>
    </>
  );
}
