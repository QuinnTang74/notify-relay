import { useState } from 'react';
import { Card, Row, Switch, Field, Sheet, Button, Chip, Empty, SectionTitle } from './ui.jsx';
import Icon, { CHANNEL_ICONS } from './Icon.jsx';
import { PRESET_APPS, uid } from '../lib/store.js';

function comma(v) {
  return String(v || '').split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
}

export default function Apps({ state, setState, onToast }) {
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');

  function openNew(preset) {
    setDraft({
      id: uid(),
      name: preset?.name || '',
      icon: preset?.icon || '🔔',
      enabled: true,
      channelIds: [],
      keywords: { include: [], exclude: [] },
    });
    setEditor('new');
  }
  function openEdit(app) {
    setDraft(JSON.parse(JSON.stringify(app)));
    setEditor('edit');
  }
  function save() {
    if (!draft.name.trim()) {
      onToast('请输入应用名称');
      return;
    }
    const clean = { ...draft, name: draft.name.trim() };
    setState((s) => ({
      ...s,
      apps: editor === 'new' ? [...s.apps, clean] : s.apps.map((a) => (a.id === clean.id ? clean : a)),
    }));
    setEditor(null);
    onToast('已保存');
  }
  function remove() {
    if (!window.confirm(`确定删除「${draft.name}」吗？`)) return;
    setState((s) => ({ ...s, apps: s.apps.filter((a) => a.id !== draft.id) }));
    setEditor(null);
    onToast('已删除');
  }
  function toggle(id, v) {
    setState((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, enabled: v } : a)) }));
  }

  const list = state.apps.filter((a) => !query || a.name.toLowerCase().includes(query.toLowerCase()));
  const presets = PRESET_APPS.filter((p) => !state.apps.some((a) => a.name === p.name));
  const setD = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setK = (key, v) => setDraft((d) => ({ ...d, keywords: { ...d.keywords, [key]: comma(v) } }));

  return (
    <>
      <Card>
        <div className="search-row">
          <Icon name="search" size={18} className="search-icon" />
          <input
            className="search-input"
            value={query}
            placeholder="搜索已添加的应用"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="secondary" onClick={() => openNew()}><Icon name="plus" size={16} /> 添加</Button>
        </div>
      </Card>

      <SectionTitle>已添加的应用（{state.apps.length}）</SectionTitle>      {list.length ? (
        <Card>
          {list.map((a) => {
            const n = a.channelIds && a.channelIds.length
              ? a.channelIds.length
              : state.channels.filter((c) => c.enabled !== false).length;
            const parts = [];
            if (a.enabled !== false) parts.push(`转发到 ${n} 个渠道`);
            else parts.push('已停用');
            if (a.keywords?.include?.length) parts.push(`包含词 ${a.keywords.include.length}`);
            if (a.keywords?.exclude?.length) parts.push(`排除词 ${a.keywords.exclude.length}`);
            return (
              <Row
                key={a.id}
                icon={<span style={{ fontSize: 18 }}>{a.icon || '📱'}</span>}
                title={a.name}
                subtitle={parts.join(' · ')}
                right={<Switch checked={a.enabled !== false} onChange={(v) => toggle(a.id, v)} label={`启用 ${a.name}`} />}
                onClick={() => openEdit(a)}
              />
            );
          })}
        </Card>
      ) : (
        <Card>
          <Empty icon={<Icon name="grid" size={42} />} title={query ? '没有匹配的应用' : '还没有添加应用'} text={query ? '换个关键词试试' : '从下方快捷添加，或点右上角自定义'} />
        </Card>
      )}

      {!query && presets.length > 0 && (
        <>
          <SectionTitle>快捷添加</SectionTitle>
          <div className="chip-grid">
            {presets.map((p) => (
              <Chip key={p.name} onClick={() => openNew(p)}>{p.icon} {p.name}</Chip>
            ))}
          </div>
        </>
      )}

      <Sheet open={!!editor} title={editor === 'new' ? '添加应用' : '编辑应用'} onClose={() => setEditor(null)}>
        {draft && (
          <>
            <div className="editor-icon-row">
              <div className="editor-icon-preview">{draft.icon || '🔔'}</div>
              <Field label="图标 Emoji" value={draft.icon} onChange={(v) => setD({ icon: v })} placeholder="🔔" />
            </div>
            <Field label="应用名称" value={draft.name} onChange={(v) => setD({ name: v })} placeholder="例如：微信" />
            <Field
              label="仅当通知包含以下词时转发"
              value={(draft.keywords.include || []).join('，')}
              onChange={(v) => setK('include', v)}
              placeholder="多个词用逗号分隔，留空表示不限"
            />
            <Field
              label="命中以下词时不转发"
              value={(draft.keywords.exclude || []).join('，')}
              onChange={(v) => setK('exclude', v)}
              placeholder="多个词用逗号分隔"
            />
            <div className="field">
              <span className="field-label">转发到哪些渠道</span>
              {state.channels.length ? (
                <div className="chip-grid">
                  {state.channels.map((c) => {
                    const on = (draft.channelIds || []).includes(c.id);
                    return (
                      <Chip
                        key={c.id}
                        tone={on ? 'on' : ''}
                        onClick={() =>
                          setD({
                            channelIds: on
                              ? draft.channelIds.filter((x) => x !== c.id)
                              : [...(draft.channelIds || []), c.id],
                          })
                        }
                      >
                        <Icon name={CHANNEL_ICONS[c.type] || 'link'} size={14} /> {c.name}
                      </Chip>
                    );
                  })}
                </div>
              ) : (
                <span className="field-hint">还没有渠道，先去「渠道」添加。不选择表示发往全部渠道。</span>
              )}
              {!(draft.channelIds || []).length && (
                <span className="field-hint">未勾选任何渠道时，默认发往全部启用渠道。</span>
              )}
            </div>
            <div className="sheet-actions">
              <Button variant="secondary" onClick={save}>保存</Button>
              {editor === 'edit' && <Button variant="danger" onClick={remove}>删除</Button>}
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
