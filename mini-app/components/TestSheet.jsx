import { useEffect, useState } from 'react';
import { Sheet, Field, Button, Code, Switch } from './ui.jsx';
import Icon from './Icon.jsx';
import { sendChannel, requestToText } from '../lib/channels.js';
import { renderPayload, checkRules } from '../lib/rules.js';

export default function TestSheet({
  open, onClose, state, onToast, addLogs, defaultChannelId, defaultApp,
}) {
  const [app, setApp] = useState(defaultApp || state.apps[0]?.name || '微信');
  const [title, setTitle] = useState('测试通知');
  const [body, setBody] = useState('这是一条来自「通知转发」的测试消息。');
  const [target, setTarget] = useState(defaultChannelId || 'all');
  const [applyRules, setApplyRules] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      if (defaultApp) setApp(defaultApp);
      if (defaultChannelId) setTarget(defaultChannelId);
    }
  }, [open, defaultApp, defaultChannelId]);

  const available = state.channels.filter((c) => c.enabled !== false);

  async function send() {
    if (!state.channels.length) {
      onToast('请先添加一个转发渠道');
      return;
    }
    const targets = target === 'all' ? available : state.channels.filter((c) => c.id === target);
    if (!targets.length) {
      onToast('没有可用的渠道');
      return;
    }
    setBusy(true);
    setResult(null);
    const rawPayload = {
      app,
      title,
      body,
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    if (applyRules) {
      const verdict = checkRules(state, rawPayload);
      if (!verdict.ok) {
        setBusy(false);
        setResult({ okCount: 0, failures: [], total: 0, blocked: verdict.reason });
        onToast('已被规则拦截：' + verdict.reason);
        return;
      }
    }
    const rendered = renderPayload(state, rawPayload);
    const entries = [];
    const failures = [];
    let okCount = 0;
    for (const c of targets) {
      const res = await sendChannel(c, rendered);
      entries.push({
        app,
        channel: c.name,
        title: rendered.title,
        body: rendered.body,
        status: res.ok ? 'ok' : 'fail',
        error: res.error,
        note: res.note,
      });
      if (res.ok) okCount += 1;
      else failures.push({ name: c.name, error: res.error, request: res.request });
    }
    addLogs(entries);
    setResult({ okCount, failures, total: targets.length, opaque: entries.some((e) => e.note) });
    setBusy(false);
    onToast(okCount ? `成功 ${okCount}/${targets.length}` : '全部失败');
  }

  async function copyRequest(req) {
    const text = requestToText(req);
    try {
      await navigator.clipboard.writeText(text);
      onToast('已复制请求');
    } catch {
      onToast('复制失败，请长按文本选择');
    }
  }

  return (
    <Sheet open={open} title="测试发送" onClose={onClose}>
      <Field label="应用名称" value={app} onChange={setApp} placeholder="例如：微信" />
      <Field label="标题" value={title} onChange={setTitle} placeholder="通知标题" />
      <Field label="正文" value={body} onChange={setBody} placeholder="通知内容" multiline />
      <label className="field">
        <span className="field-label">发送到</span>
        <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="all">全部启用渠道（{available.length}）</option>
          {state.channels.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.enabled === false ? '（已停用）' : ''}</option>
          ))}
        </select>
      </label>
      <div className="rule-toggle">
        <span><Icon name="filter" size={15} /> 应用「规则」页的转发条件</span>
        <Switch checked={applyRules} onChange={setApplyRules} label="应用规则页的转发条件" />
      </div>
      <Button block onClick={send} disabled={busy}>
        <Icon name="send" size={17} /> {busy ? '发送中…' : '发送测试'}
      </Button>

      {result && (
        <div className="test-result">
          {result.blocked ? (
            <div className="result-banner fail">🚫 已被规则拦截：{result.blocked}</div>
          ) : (
            <>
              <div className={`result-banner ${result.okCount ? 'ok' : 'fail'}`}>
                {result.okCount ? `✅ 已发出 ${result.okCount}/${result.total}` : `❌ 全部失败（${result.total}）`}
              </div>
              {result.okCount > 0 && (
                <div className="field-hint">
                  已发出的请求请在目标设备确认是否收到；若没收到，检查渠道配置里的 Key / Webhook 是否正确。
                </div>
              )}
              {result.failures.map((f, i) => (
                <div className="fail-block" key={i}>
                  <div className="fail-name">{f.name}</div>
                  <div className="fail-err">{f.error}</div>
                  <Code>{requestToText(f.request)}</Code>
                  <div className="fail-actions">
                    <Button variant="secondary" onClick={() => copyRequest(f.request)}><Icon name="copy" size={15} /> 复制请求</Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}
