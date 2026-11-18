import { useState } from 'react';
import { Card, Row, Switch, Field, Sheet, Button, Code, Empty, SectionTitle } from './ui.jsx';
import Icon, { CHANNEL_ICONS } from './Icon.jsx';
import {
  CHANNEL_DEFS, CHANNEL_KEYS, makeChannel, sendChannel, samplePayload, requestToText,
} from '../lib/channels.js';

export default function Channels({ state, setState, onToast }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [lastReq, setLastReq] = useState(null);

  function add(type) {
    setDraft(makeChannel(type));
    setPickerOpen(false);
    setTestResult('');
    setLastReq(null);
  }
  function openEdit(c) {
    setDraft(JSON.parse(JSON.stringify(c)));
    setTestResult('');
    setLastReq(null);
  }
  function save() {
    if (!draft.name.trim()) {
      onToast('请输入渠道名称');
      return;
    }
    const clean = { ...draft, name: draft.name.trim() };
    setState((s) => ({
      ...s,
      channels: s.channels.some((c) => c.id === clean.id)
        ? s.channels.map((c) => (c.id === clean.id ? clean : c))
        : [...s.channels, clean],
    }));
    setDraft(null);
    onToast('已保存');
  }
  function remove() {
    if (!window.confirm(`确定删除「${draft.name}」吗？`)) return;
    setState((s) => ({ ...s, channels: s.channels.filter((c) => c.id !== draft.id) }));
    setDraft(null);
    onToast('已删除');
  }
  function toggle(id, v) {
    setState((s) => ({ ...s, channels: s.channels.map((c) => (c.id === id ? { ...c, enabled: v } : c)) }));
  }
  async function test() {
    setTesting(true);
    setTestResult('');
    try {
      const res = await sendChannel(draft, samplePayload());
      setLastReq(res.request);
      setTestResult(
        res.ok
          ? res.opaque
            ? '✅ 请求已发出（请在目标设备确认）'
            : '✅ 发送成功'
          : `❌ ${res.error}`
      );
    } catch (e) {
      setTestResult('❌ ' + (e?.message || '发送失败'));
    }
    setTesting(false);
  }
  async function copy() {
    if (!lastReq) {
      onToast('请先测试一次');
      return;
    }
    try {
      await navigator.clipboard.writeText(requestToText(lastReq));
      onToast('已复制请求');
    } catch {
      onToast('复制失败，请长按文本选择');
    }
  }

  const setCfg = (k, v) => setDraft((d) => ({ ...d, config: { ...d.config, [k]: v } }));
  const fields = draft ? CHANNEL_DEFS[draft.type]?.fields || [] : [];

  return (
    <>
      <Card>
        <Row icon={<Icon name="plus" size={18} />} title="添加转发渠道" subtitle="Bark、Server酱、钉钉、Webhook 等" onClick={() => setPickerOpen(true)} />
      </Card>

      <SectionTitle>渠道列表（{state.channels.length}）</SectionTitle>
      {state.channels.length ? (
        <Card>
          {state.channels.map((c) => {
            const def = CHANNEL_DEFS[c.type] || {};
            return (
              <Row
                key={c.id}
                icon={<Icon name={CHANNEL_ICONS[c.type] || 'link'} size={18} />}
                title={c.name}
                subtitle={def.hint || def.label}                right={<Switch checked={c.enabled !== false} onChange={(v) => toggle(c.id, v)} label={`启用 ${c.name}`} />}
                onClick={() => openEdit(c)}
              />
            );
          })}
        </Card>
      ) : (
        <Card>
          <Empty icon={<Icon name="link" size={42} />} title="还没有渠道" text="至少添加一个渠道才能转发。Bark 最简单：填设备 Key 即可。" />
        </Card>
      )}

      <Sheet open={pickerOpen} title="选择渠道类型" onClose={() => setPickerOpen(false)}>
        <div className="type-grid">
          {CHANNEL_KEYS.map((k) => {
            const def = CHANNEL_DEFS[k];
            return (
              <div className="type-item" key={k} onClick={() => add(k)}>
                <div className="ti" style={{ color: def.color }}><Icon name={CHANNEL_ICONS[k] || 'link'} size={26} /></div>
                <div className="tl">{def.label}</div>
              </div>
            );
          })}
        </div>
      </Sheet>

      <Sheet open={!!draft} title={draft ? `编辑 · ${CHANNEL_DEFS[draft.type]?.label || ''}` : ''} onClose={() => setDraft(null)}>
        {draft && (
          <>
            <Field label="显示名称" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} placeholder="例如：我的 iPhone" />
            {fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                value={draft.config[f.key]}
                onChange={(v) => setCfg(f.key, v)}
                placeholder={f.placeholder}
                type={f.type === 'select' ? 'select' : 'text'}
                options={f.options}
                hint={f.hint}
                multiline={f.key === 'body' || f.key === 'headers'}
              />
            ))}
            <div className="sheet-actions">
              <Button variant="secondary" onClick={test} disabled={testing}>
                <Icon name="send" size={16} /> {testing ? '发送中…' : '测试此渠道'}
              </Button>
              <Button onClick={save}><Icon name="check" size={16} /> 保存</Button>
            </div>
            {testResult && (
              <div className={`result-banner ${testResult.startsWith('✅') ? 'ok' : 'fail'}`}>{testResult}</div>
            )}
            {lastReq && (
              <>
                <div className="field-hint" style={{ marginTop: 10 }}>本次请求（可复制到快捷指令使用）：</div>
                <Code>{requestToText(lastReq)}</Code>
                <div className="fail-actions"><Button variant="secondary" onClick={copy}><Icon name="copy" size={15} /> 复制请求</Button></div>
              </>
            )}
            <div className="sheet-actions">
              <Button variant="danger" onClick={remove}><Icon name="trash" size={16} /> 删除渠道</Button>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
