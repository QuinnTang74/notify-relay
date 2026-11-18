export const KEY = 'notifyrelay.v1';
export const VERSION = 1;

export const PRESET_APPS = [
  { name: '微信', icon: '💬' },
  { name: '短信', icon: '✉️' },
  { name: '电话', icon: '📞' },
  { name: 'QQ', icon: '🐧' },
  { name: '钉钉', icon: '📐' },
  { name: '企业微信', icon: '🏢' },
  { name: '支付宝', icon: '💰' },
  { name: '淘宝', icon: '🛒' },
  { name: '京东', icon: '📦' },
  { name: '邮件', icon: '📧' },
  { name: '日历', icon: '📅' },
  { name: '提醒事项', icon: '✅' },
  { name: '飞书', icon: '🪶' },
  { name: 'GitHub', icon: '🐙' },
];

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export function defaults() {
  return {
    version: VERSION,
    channels: [],
    apps: [],
    rules: {
      master: true,
      quietHours: { enabled: false, start: '23:00', end: '07:00' },
      dedupeSeconds: 30,
      ratePerMinute: 20,
      titleTemplate: '{{app}}',
      bodyTemplate: '{{title}} {{body}}',
    },
    logs: [],
    settings: { theme: 'system' },
  };
}

function normalize(p) {
  const d = defaults();
  if (!p || typeof p !== 'object') return d;
  const channels = Array.isArray(p.channels)
    ? p.channels.filter((c) => c && c.type && c.id).map((c) => ({ ...c, config: c.config || {} }))
    : [];
  const apps = Array.isArray(p.apps)
    ? p.apps
        .filter((a) => a && a.id && a.name)
        .map((a) => ({
          ...a,
          channelIds: Array.isArray(a.channelIds) ? a.channelIds : [],
          keywords: { include: [], exclude: [], ...(a.keywords || {}) },
        }))
    : [];
  const rules = p.rules || {};
  return {
    version: VERSION,
    channels,
    apps,
    rules: {
      ...d.rules,
      ...rules,
      quietHours: { ...d.rules.quietHours, ...(rules.quietHours || {}) },
    },
    logs: Array.isArray(p.logs) ? p.logs.slice(0, 500) : [],
    settings: { ...d.settings, ...(p.settings || {}) },
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return normalize(JSON.parse(raw));
  } catch {
    return defaults();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return null;
  } catch (e) {
    return e;
  }
}

export function exportConfig(state) {
  return JSON.stringify({ ...state, logs: [] }, null, 2);
}

export function importConfig(text) {
  const parsed = JSON.parse(text);
  const result = normalize(parsed);
  if (!Array.isArray(parsed.channels) && !Array.isArray(parsed.apps)) {
    throw new Error('文件里没有可识别的应用或渠道配置');
  }
  result.logs = [];
  return result;
}
