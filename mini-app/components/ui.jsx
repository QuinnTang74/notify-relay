export function Card({ children, className = '', onClick, style }) {
  return (
    <div className={`card ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

export function Row({ icon, title, subtitle, right, onClick, danger, chevron = true }) {
  return (
    <div className={`row ${onClick ? 'clickable' : ''} ${danger ? 'danger' : ''}`} onClick={onClick}>
      {icon != null && <div className="row-icon">{icon}</div>}
      <div className="row-text">
        <div className="row-title" style={danger ? { color: 'var(--red)' } : undefined}>{title}</div>
        {subtitle && <div className="row-sub">{subtitle}</div>}
      </div>
      {right && <div className="row-right">{right}</div>}
      {onClick && chevron && <span className="chevron">›</span>}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label || '开关'}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <span className="knob" />
    </button>
  );
}

export function Field({ label, value, onChange, placeholder, type = 'text', options, hint, multiline }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {type === 'select' ? (
        <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {(options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          className="input area"
          rows={3}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

import { useEffect } from 'react';

let openSheets = 0;

function syncSheetFlag() {
  const el = document.documentElement;
  if (openSheets > 0) el.setAttribute('data-sheet', 'open');
  else el.removeAttribute('data-sheet');
}

export function Sheet({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    openSheets += 1;
    syncSheetFlag();
    return () => {
      openSheets = Math.max(0, openSheets - 1);
      syncSheetFlag();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button className="sheet-close" onClick={onClose}>完成</button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

export function Empty({ icon = '📭', title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {text && <div className="empty-text">{text}</div>}
      {action}
    </div>
  );
}

export function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ children, tone = '', onClick }) {
  return (
    <button type="button" className={`chip ${tone}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', disabled, block }) {
  return (
    <button className={`btn ${variant} ${block ? 'block' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function Code({ children }) {
  return <pre className="code">{children}</pre>;
}
