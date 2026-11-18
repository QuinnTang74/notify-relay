import { useEffect, useRef, useState } from 'react';
import './style.css';
import { load, defaults, save, exportConfig, importConfig, uid } from './lib/store.js';
import { Card, Row, Switch, Segmented, Button, Sheet, Toast, SectionTitle } from './components/ui.jsx';
import Icon from './components/Icon.jsx';
import Overview from './components/Overview.jsx';
import Apps from './components/Apps.jsx';
import Channels from './components/Channels.jsx';
import Rules from './components/Rules.jsx';
import Setup from './components/Setup.jsx';

const TABS = [
  { key: 'overview', label: '概览', icon: 'home' },
  { key: 'apps', label: '应用', icon: 'grid' },
  { key: 'channels', label: '渠道', icon: 'link' },
  { key: 'rules', label: '规则', icon: 'sliders' },
  { key: 'setup', label: '向导', icon: 'compass' },
];

export default function App() {
  const [state, setState] = useState(load);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sysDark, setSysDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );
  const toastTimer = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const handler = (e) => setSysDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else if (mq.removeListener) mq.removeListener(handler);
    };
  }, []);

  const theme = state.settings.theme === 'system'
    ? (sysDark ? 'dark' : 'light')
    : state.settings.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }

  useEffect(() => {
    const err = save(state);
    if (err) showToast('本地存储写入失败，请导出备份');
  }, [state]);

  function addLogs(entries) {
    const withIds = entries.map((e) => ({ id: uid(), time: Date.now(), ...e }));
    setState((s) => ({ ...s, logs: [...withIds, ...s.logs].slice(0, 500) }));
  }

  function doExport() {
    try {
      const blob = new Blob([exportConfig(state)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notify-relay-config.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('已导出配置文件');
    } catch (e) {
      showToast('导出失败：' + (e?.message || '未知错误'));
    }
  }

  async function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const next = importConfig(text);
      setState(next);
      setSettingsOpen(false);
      showToast('配置已导入');
    } catch (err) {
      showToast('导入失败：' + (err?.message || '格式错误'));
    }
    e.target.value = '';
  }

  function clearLogs() {
    setState((s) => ({ ...s, logs: [] }));
    showToast('记录已清空');
  }

  function resetAll() {
    if (!window.confirm('确定清空全部配置？此操作不可撤销，建议先导出备份。')) return;
    setState(defaults());
    setSettingsOpen(false);
    showToast('已清空全部配置');
  }

  return (
    <div className="app" data-theme={theme}>
      <div className="ambient" aria-hidden="true"><i /><i /><i /></div>
      <main className="page">
        {tab === 'overview' && (
          <Overview
            state={state}
            setState={setState}
            onToast={showToast}
            addLogs={addLogs}
            onNavigate={setTab}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {tab === 'apps' && <Apps state={state} setState={setState} onToast={showToast} />}
        {tab === 'channels' && <Channels state={state} setState={setState} onToast={showToast} />}
        {tab === 'rules' && <Rules state={state} setState={setState} onToast={showToast} />}
        {tab === 'setup' && <Setup state={state} onToast={showToast} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={22} stroke={tab === t.key ? 2.1 : 1.8} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <Sheet open={settingsOpen} title="设置" onClose={() => setSettingsOpen(false)}>
        <SectionTitle>外观</SectionTitle>
        <Segmented
          value={state.settings.theme}
          onChange={(v) => setState((s) => ({ ...s, settings: { ...s.settings, theme: v } }))}
          options={[
            { value: 'system', label: '跟随系统' },
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
          ]}
        />

        <SectionTitle>数据</SectionTitle>
        <div className="sheet-actions">
          <Button variant="secondary" onClick={doExport}><Icon name="download" size={16} /> 导出配置</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}><Icon name="upload" size={16} /> 导入配置</Button>
        </div>
        <Card>
          <Row icon={<Icon name="trash" size={18} />} title="清空转发记录" subtitle={`当前 ${state.logs.length} 条`} onClick={clearLogs} chevron={false} />
          <Row icon={<Icon name="info" size={18} />} title="清空全部配置" subtitle="应用、渠道和规则都会被移除" onClick={resetAll} danger chevron={false} />
        </Card>

        <SectionTitle>关于</SectionTitle>
        <div className="note-text">
          iOS 不允许普通 App 读取其他 App 的通知。本工具负责配置与测试，自动转发需按「向导」在快捷指令中设置一次。
          <br /><br />数据仅保存在本机浏览器存储中，不会上传。密钥请自行保管。
        </div>
      </Sheet>

      <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={doImport} />
      <Toast message={toast} />
    </div>
  );
}
