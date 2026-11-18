import { useState } from 'react';
import { Card, Row, Switch, Button, Empty, SectionTitle } from './ui.jsx';
import Icon from './Icon.jsx';
import RouteChain, { SignalMeter } from './RouteChain.jsx';
import TestSheet from './TestSheet.jsx';

export default function Overview({ state, setState, onToast, addLogs, onNavigate, onOpenSettings }) {
  const [testOpen, setTestOpen] = useState(false);
  const enabledApps = state.apps.filter((a) => a.enabled !== false);
  const enabledChannels = state.channels.filter((c) => c.enabled !== false);
  const today = new Date().toDateString();
  const todayCount = state.logs.filter(
    (l) => new Date(l.time).toDateString() === today && l.status === 'ok'
  ).length;
  const recent = state.logs.slice(0, 8);
  const okCount = state.logs.filter((l) => l.status === 'ok').length;
  const failCount = state.logs.filter((l) => l.status === 'fail').length;

  function toggleMaster(v) {
    setState((s) => ({ ...s, rules: { ...s.rules, master: v } }));
    onToast(v ? '转发已开启' : '转发已暂停');
  }
  function clearLogs() {
    setState((s) => ({ ...s, logs: [] }));
    onToast('记录已清空');
  }

  return (
    <>
      {/* 仪表面板 */}
      <section className="panel">
        <div className="head">
          <div className="head-id">
            <span className={`live-dot ${state.rules.master ? '' : 'paused'}`} />
            <div>
              <div className="head-title">通知转发控制台</div>
              <div className="head-sub">
                {state.rules.master ? '自动转发运行中' : '自动转发已暂停'}
              </div>
            </div>
          </div>
          <Switch checked={!!state.rules.master} onChange={toggleMaster} label="自动转发总开关" />
        </div>

        <RouteChain apps={enabledApps} channels={enabledChannels} />

        <div className="readouts">
          <div className="readout">
            <b className="mono">{enabledApps.length}</b>
            <span>已启用应用</span>
          </div>
          <div className="readout">
            <b className="mono">{enabledChannels.length}</b>
            <span>已启用渠道</span>
          </div>
          <div className="readout">
            <b className="mono" style={{ color: todayCount ? 'var(--accent-text)' : 'var(--text-3)' }}>
              {todayCount}
            </b>
            <span>今日投递</span>
          </div>
        </div>
      </section>

      {/* 信号计量 */}
      {state.logs.length > 0 && (
        <Card>
          <div className="head" style={{ padding: '10px 0 4px' }}>
            <div className="eyebrow">投递信号</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ok)' }}>{okCount} 成功</span>
              {failCount > 0 && (
                <span className="mono" style={{ fontSize: 12, color: 'var(--err)' }}>{failCount} 失败</span>
              )}
            </div>
          </div>
          <div style={{ padding: '4px 0 12px' }}>
            <SignalMeter logs={state.logs} />
          </div>
        </Card>
      )}

      <Button block onClick={() => setTestOpen(true)}>
        <Icon name="send" size={17} /> 快速测试发送
      </Button>

      <SectionTitle>投递记录</SectionTitle>
      <Card>
        {recent.length ? (
          recent.map((l) => (
            <div className="log" key={l.id}>
              <div className="log-time mono">
                {new Date(l.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="log-main">
                <div className="log-title">
                  <span className={`log-dot ${l.status === 'ok' ? 'ok' : 'fail'}`} />
                  {l.app} → {l.channel}
                </div>
                <div className={`log-meta ${l.status === 'ok' ? '' : 'err'}`}>
                  {l.status === 'ok' ? (l.note || l.title || '发送成功') : (l.error || '发送失败')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty
            icon={<Icon name="wave" size={40} />}
            title="暂无投递记录"
            text="发送一次测试后，投递结果会显示在这里"
          />
        )}
      </Card>
      {recent.length > 0 && (
        <Row icon={<Icon name="trash" size={18} />} title="清空记录" onClick={clearLogs} danger chevron={false} />
      )}

      <SectionTitle>快速开始</SectionTitle>
      <Card>
        <Row icon={<Icon name="grid" size={18} />} title="选择要转发的应用" subtitle="指定哪些 App 的通知需要外发" onClick={() => onNavigate('apps')} />
        <Row icon={<Icon name="link" size={18} />} title="配置转发渠道" subtitle="Bark、Server酱、钉钉、邮件等" onClick={() => onNavigate('channels')} />
        <Row icon={<Icon name="compass" size={18} />} title="快捷指令设置向导" subtitle="一次性打通自动转发链路" onClick={() => onNavigate('setup')} />
        <Row icon={<Icon name="settings" size={18} />} title="设置与备份" subtitle="主题、配置导入导出" onClick={onOpenSettings} />
      </Card>

      <TestSheet
        open={testOpen}
        onClose={() => setTestOpen(false)}
        state={state}
        onToast={onToast}
        addLogs={addLogs}
      />
    </>
  );
}
