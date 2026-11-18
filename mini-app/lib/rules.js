function parseHM(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

export function inQuiet(q, date = new Date()) {
  if (!q || !q.enabled) return false;
  const cur = date.getHours() * 60 + date.getMinutes();
  const s = parseHM(q.start);
  const e = parseHM(q.end);
  if (s === e) return false;
  if (s < e) return cur >= s && cur < e;
  return cur >= s || cur < e;
}

export function checkRules(state, payload, now = Date.now()) {
  const r = state.rules || {};
  if (!r.master) return { ok: false, reason: '转发总开关已关闭' };

  const app = (state.apps || []).find((a) => a.id === payload.appId) ||
    (state.apps || []).find((a) => a.name === payload.app);
  if (app && app.enabled === false) return { ok: false, reason: '该应用已禁用' };
  if (inQuiet(r.quietHours, new Date(now))) return { ok: false, reason: '处于免打扰时段' };

  const text = `${payload.title || ''} ${payload.body || ''}`.toLowerCase();
  const kw = app?.keywords || {};
  const exclude = (Array.isArray(kw.exclude) ? kw.exclude : []).filter(Boolean).map(String);
  const include = (Array.isArray(kw.include) ? kw.include : []).filter(Boolean).map(String);
  if (exclude.some((k) => text.includes(k.toLowerCase()))) {
    return { ok: false, reason: '命中排除关键词' };
  }
  if (include.length && !include.some((k) => text.includes(k.toLowerCase()))) {
    return { ok: false, reason: '未命中包含关键词' };
  }

  const logs = state.logs || [];
  const perMin = Number(r.ratePerMinute);
  if (perMin > 0 && logs.filter((l) => now - l.time < 60000).length >= perMin) {
    return { ok: false, reason: '触发每分钟频率上限' };
  }
  const dupSec = Number(r.dedupeSeconds) || 0;
  if (dupSec > 0) {
    const dup = logs.find(
      (l) =>
        l.app === payload.app &&
        l.title === payload.title &&
        l.body === payload.body &&
        now - l.time < dupSec * 1000
    );
    if (dup) return { ok: false, reason: '重复内容（去重窗口内）' };
  }
  return { ok: true, app };
}

export function renderPayload(state, payload) {
  const r = state.rules || {};
  const map = {
    app: payload.app || '',
    title: payload.title || '',
    body: payload.body || '',
    time: payload.time || new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  const t = (str, fallback) => {
    try {
      return String(str || fallback).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) =>
        Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m
      );
    } catch {
      return fallback;
    }
  };
  return {
    ...payload,
    title: t(r.titleTemplate, '{{app}}'),
    body: t(r.bodyTemplate, '{{title}} {{body}}'),
  };
}
