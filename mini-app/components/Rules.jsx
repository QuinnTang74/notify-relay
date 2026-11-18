import { Card, Row, Switch, Field, SectionTitle } from './ui.jsx';
import Icon from './Icon.jsx';
import { inQuiet } from '../lib/rules.js';

export default function Rules({ state, setState, onToast }) {
  const r = state.rules || {};
  const setR = (patch) => setState((s) => ({ ...s, rules: { ...s.rules, ...patch } }));
  const setQ = (patch) =>
    setState((s) => ({
      ...s,
      rules: { ...s.rules, quietHours: { ...s.rules.quietHours, ...patch } },
    }));

  const quiet = inQuiet(r.quietHours);
  const dup = Number(r.dedupeSeconds) || 0;
  const rate = Number(r.ratePerMinute) || 0;

  return (
    <>
      <Card>
        <Row
          icon={<Icon name="bolt" size={18} />}
          title="转发总开关"
          subtitle={r.master ? '规则检查开启时才会转发' : '已暂停全部自动转发'}
          right={<Switch checked={!!r.master} onChange={(v) => setR({ master: v })} label="转发总开关" />}
          chevron={false}
        />
      </Card>

      <SectionTitle>免打扰</SectionTitle>
      <Card>
        <Row
          icon={<Icon name="moon" size={18} />}
          title="免打扰时段"
          subtitle={quiet ? '当前处于免打扰中' : '时段内不转发任何通知'}
          right={<Switch checked={!!r.quietHours?.enabled} onChange={(v) => setQ({ enabled: v })} label="免打扰时段" />}
          chevron={false}
        />
        {r.quietHours?.enabled && (
          <div className="inline-fields">
            <Field label="开始" type="time" value={r.quietHours.start} onChange={(v) => setQ({ start: v })} />
            <Field label="结束" type="time" value={r.quietHours.end} onChange={(v) => setQ({ end: v })} />
          </div>
        )}
      </Card>

      <SectionTitle>频率与去重</SectionTitle>
      <Card>
        <Field
          label="相同内容去重（秒）"
          type="number"
          value={r.dedupeSeconds}
          onChange={(v) => setR({ dedupeSeconds: Math.max(0, Number(v) || 0) })}
          hint="0 表示不去重；相同应用、标题、正文在该时间内只发一次"
        />
        <Field
          label="每分钟最多转发（条）"
          type="number"
          value={r.ratePerMinute}
          onChange={(v) => setR({ ratePerMinute: Math.max(0, Number(v) || 0) })}
          hint="0 表示不限；防止通知风暴刷屏"
        />
      </Card>

      <SectionTitle>消息模板</SectionTitle>
      <Card>
        <Field
          label="标题模板"
          value={r.titleTemplate}
          onChange={(v) => setR({ titleTemplate: v })}
          placeholder="{{app}}"
          hint="可用变量：{{app}} {{title}} {{body}} {{time}}"
        />
        <Field
          label="正文模板"
          value={r.bodyTemplate}
          onChange={(v) => setR({ bodyTemplate: v })}
          placeholder="{{title}} {{body}}"
          hint="默认把原通知的标题和正文合并"
        />
        <div className="field-hint">
          当前效果预览：<b>{(r.titleTemplate || '{{app}}').replace('{{app}}', '微信')}</b> —{' '}
          {(r.bodyTemplate || '{{title}} {{body}}').replace('{{title}}', '示例标题').replace('{{body}}', '示例内容')}
        </div>
      </Card>

      <Card>
        <div className="note-text">
          这些规则会在手动发送时生效：打开「概览 → 快速测试发送」里的「应用规则」开关即可验证。
          <br /><b>注意：</b>iOS 快捷指令无法读取这里的设置，自动转发不会自动套用规则；如需免打扰等效果，请在快捷指令里加条件，或使用 iOS「专注模式」。
          <br />当前配置：去重 <b>{dup}</b> 秒 · 限流 <b>{rate || '不限'}</b> 条/分钟。
        </div>
      </Card>
    </>
  );
}
