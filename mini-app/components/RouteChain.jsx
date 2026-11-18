import Icon, { CHANNEL_ICONS } from './Icon.jsx';

/**
 * 路由链路图：本机 App → 快捷指令 → 转发渠道。
 * 这是整个产品最核心的心智模型，用一条连续的信号线表达。
 */
export default function RouteChain({ apps, channels, max = 3 }) {
  const appNodes = apps.slice(0, max);
  const chanNodes = channels.slice(0, max);
  const moreApps = apps.length - appNodes.length;
  const moreChans = channels.length - chanNodes.length;

  if (!apps.length || !channels.length) {
    return (
      <div className="route route-empty">
        <div className="route-col">
          <div className="route-node"><span className="rni"><Icon name="grid" size={14} /></span>待选择应用</div>
        </div>
        <div className="route-bridge">
          <svg width="42" height="40" viewBox="0 0 42 40" aria-hidden="true">
            <path d="M4 20h14" stroke="var(--line-2)" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
            <path d="M24 20h14" stroke="var(--line-2)" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
            <circle cx="21" cy="20" r="7" fill="var(--surface-2)" stroke="var(--line-2)" strokeWidth="1" />
            <path d="M18.5 20h5M21 17.5v5" stroke="var(--text-3)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="route-col right">
          <div className="route-node out"><span className="rni"><Icon name="link" size={14} /></span>待添加渠道</div>
        </div>
      </div>
    );
  }

  return (
    <div className="route">
      <div className="route-col">
        {appNodes.map((a) => (
          <div className="route-node" key={a.id}>
            <span className="rni"><Icon name="grid" size={14} /></span>
            {a.name}
          </div>
        ))}
        {moreApps > 0 && <div className="route-node more">+{moreApps}</div>}
      </div>

      <div className="route-bridge">
        <svg width="42" height="40" viewBox="0 0 42 40" aria-hidden="true">
          <path
            d="M3 20h11"
            stroke="var(--accent)" strokeWidth="1.6" fill="none" className="flow" strokeLinecap="round"
          />
          <path
            d="M28 20h11"
            stroke="var(--accent)" strokeWidth="1.6" fill="none" className="flow" strokeLinecap="round"
          />
          <circle cx="21" cy="20" r="8" fill="var(--card-solid)" stroke="var(--accent)" strokeWidth="1.6" />
          <path
            d="M17.6 20h6.8M21 16.6v6.8"
            stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="route-col right">
        {chanNodes.map((c) => (
          <div className="route-node out" key={c.id}>
            {c.name}
            <span className="rni"><Icon name={CHANNEL_ICONS[c.type] || 'link'} size={14} /></span>
          </div>
        ))}
        {moreChans > 0 && <div className="route-node more">+{moreChans}</div>}
      </div>
    </div>
  );
}

/** 信号计量条：把最近的投递结果可视化成一排格子（固定 14 格，从右往左填充） */
export function SignalMeter({ logs }) {
  const CELLS = 14;
  const recent = logs.slice(0, CELLS);
  const cells = [];
  for (let i = 0; i < CELLS; i += 1) {
    const l = recent[CELLS - 1 - i];
    cells.push(l ? (l.status === 'ok' ? 'ok' : 'err') : 'void');
  }
  return (
    <div className="meter" role="img" aria-label={`最近 ${recent.length} 次投递：成功 ${recent.filter((l) => l.status === 'ok').length}，失败 ${recent.filter((l) => l.status !== 'ok').length}`}>
      {cells.map((c, i) => (
        <i key={i} className={c} />
      ))}
    </div>
  );
}
