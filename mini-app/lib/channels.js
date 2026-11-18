import { uid } from './store.js';

export const CHANNEL_DEFS = {
  bark: {
    label: 'Bark', icon: '🔔', color: '#34C759',
    hint: '推送到装有 Bark 的 iPhone / iPad',
    fields: [
      { key: 'server', label: '服务器地址', placeholder: 'https://api.day.app', def: 'https://api.day.app', hint: '自建服务器可改这里，末尾不要带斜杠' },
      { key: 'deviceKey', label: '设备 Key', placeholder: 'Bark App 里显示的设备 Key' },
      { key: 'group', label: '分组', placeholder: '可选，如「通知」' },
      { key: 'icon', label: '图标 URL', placeholder: '可选' },
      { key: 'sound', label: '铃声', placeholder: '可选，如 alarm' },
      { key: 'level', label: '推送级别', type: 'select', options: ['active', 'timeSensitive', 'passive'], def: 'active' },
    ],
  },
  serverchan: {
    label: 'Server酱', icon: '💬', color: '#07C160',
    hint: 'Server酱 Turbo，微信服务号推送',
    fields: [
      { key: 'sendkey', label: 'SendKey', placeholder: '形如 SCTxxxxx' },
    ],
  },
  pushplus: {
    label: 'PushPlus', icon: '📣', color: '#1677FF',
    hint: 'pushplus.plus 多通道推送',
    fields: [
      { key: 'token', label: 'Token', placeholder: 'PushPlus 的 token' },
    ],
  },
  wecom: {
    label: '企业微信', icon: '🏢', color: '#2EAB49',
    hint: '企业微信群机器人 Webhook',
    fields: [
      { key: 'key', label: 'Webhook Key', placeholder: 'URL 中 key= 后面的部分' },
    ],
  },
  dingtalk: {
    label: '钉钉', icon: '📐', color: '#1677FF',
    hint: '钉钉群机器人，支持加签',
    fields: [
      { key: 'token', label: 'access_token', placeholder: 'URL 中 access_token= 后面的部分' },
      { key: 'secret', label: '加签 Secret', placeholder: '可选，SEC 开头', hint: '若机器人开启了加签，必须填写' },
    ],
  },
  feishu: {
    label: '飞书', icon: '🪶', color: '#3370FF',
    hint: '飞书群自定义机器人',
    fields: [
      { key: 'token', label: 'Hook Token', placeholder: 'URL 最后一段 token' },
    ],
  },
  pushover: {
    label: 'Pushover', icon: '📲', color: '#6C5CE7',
    hint: 'Pushover 跨平台推送',
    fields: [
      { key: 'user', label: 'User Key', placeholder: '你的用户 Key' },
      { key: 'token', label: 'API Token', placeholder: '应用 API Token' },
    ],
  },
  email: {
    label: '邮件', icon: '📧', color: '#FF9500',
    hint: '通过 Resend / SendGrid API 发邮件',
    fields: [
      { key: 'provider', label: '服务商', type: 'select', options: ['resend', 'sendgrid'], def: 'resend' },
      { key: 'apiKey', label: 'API Key', placeholder: '服务商的 API Key' },
      { key: 'from', label: '发件邮箱', placeholder: '已验证的邮箱地址' },
      { key: 'to', label: '收件邮箱', placeholder: '目标邮箱地址' },
    ],
  },
  webhook: {
    label: '自定义 Webhook', icon: '🔗', color: '#8E8E93',
    hint: '任意 HTTP 接口，完全自定义',
    fields: [
      { key: 'url', label: '请求地址', placeholder: 'https://example.com/hook' },
      { key: 'method', label: '方法', type: 'select', options: ['POST', 'PUT', 'GET'], def: 'POST' },
      { key: 'headers', label: '请求头 (JSON)', placeholder: '{"Authorization":"Bearer xxx"}', hint: '选填，必须是合法 JSON' },
      { key: 'body', label: '请求体模板', placeholder: '{"app":"{{app}}","title":"{{title}}","body":"{{body}}"}', hint: '支持 {{app}} {{title}} {{body}} {{time}} {{channel}}' },
    ],
  },
};

export const CHANNEL_KEYS = Object.keys(CHANNEL_DEFS);

export function makeChannel(type, name) {
  const def = CHANNEL_DEFS[type] || {};
  const config = {};
  (def.fields || []).forEach((f) => {
    if (f.def !== undefined) config[f.key] = f.def;
  });
  return { id: uid(), type, name: name || def.label || type, enabled: true, config };
}

export function applyTemplate(str, payload, channel) {
  const map = {
    app: payload?.app || '',
    title: payload?.title || '',
    body: payload?.body || '',
    time: payload?.time || new Date().toLocaleString('zh-CN', { hour12: false }),
    channel: channel?.name || '',
  };
  return String(str ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m
  );
}

export function samplePayload(appName = '微信') {
  return {
    app: appName,
    title: '示例标题',
    body: '这是一条来自「' + appName + '」的示例通知内容。',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
}

const enc = encodeURIComponent;
const base = (s) => String(s || '').replace(/\/+$/, '');
const escHtml = (s) =>
  String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function buildRequest(channel, payload) {
  const c = channel.config || {};
  const title = applyTemplate(payload.title, payload, channel) || '通知';
  const body = applyTemplate(payload.body, payload, channel) || '';

  switch (channel.type) {
    case 'bark': {
      const server = base(c.server || 'https://api.day.app');
      let url = `${server}/${enc(c.deviceKey || '')}/${enc(title)}/${enc(body)}`;
      const q = new URLSearchParams();
      if (c.group) q.set('group', c.group);
      if (c.icon) q.set('icon', c.icon);
      if (c.sound) q.set('sound', c.sound);
      if (c.level && c.level !== 'active') q.set('level', c.level);
      if (q.toString()) url += '?' + q.toString();
      return { url, options: { method: 'GET' }, summary: `Bark · ${server}` };
    }
    case 'serverchan': {
      const form = new URLSearchParams({ title, desp: body });
      return {
        url: `https://sctapi.ftqq.com/${enc(c.sendkey || '')}.send`,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: form.toString(),
        },
        summary: 'Server酱 Turbo',
      };
    }
    case 'pushplus':
      return {
        url: 'https://www.pushplus.plus/send',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: c.token || '', title, content: body, template: 'markdown' }),
        },
        summary: 'PushPlus',
      };
    case 'wecom': {
      const content = `**${title}**\n${body}`.replace(/</g, '‹');
      return {
        url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${enc(c.key || '')}`,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msgtype: 'markdown', markdown: { content } }),
        },
        summary: '企业微信群机器人',
      };
    }
    case 'dingtalk': {
      const ts = Date.now();
      let url = `https://oapi.dingtalk.com/robot/send?access_token=${enc(c.token || '')}`;
      if (c.secret) {
        try {
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            'raw', encoder.encode(c.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
          );
          const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}\n${c.secret}`));
          const sign = btoa(String.fromCharCode(...new Uint8Array(sig)));
          url += `&timestamp=${ts}&sign=${enc(sign)}`;
        } catch (e) {
          return { url: '', options: {}, summary: '钉钉群机器人', error: '加签计算失败：' + (e.message || e) };
        }
      }
      return {
        url,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msgtype: 'markdown',
            markdown: { title, text: `### ${title}\n\n${body}` },
          }),
        },
        summary: '钉钉群机器人',
      };
    }
    case 'feishu': {
      const card = {
        config: { wide_screen_mode: true },
        elements: [{ tag: 'div', text: { tag: 'lark_md', content: `**${title}**\n${body}` } }],
      };
      return {
        url: `https://open.feishu.cn/open-apis/bot/v2/hook/${enc(c.token || '')}`,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msg_type: 'interactive', card }),
        },
        summary: '飞书群机器人',
      };
    }
    case 'pushover': {
      const form = new URLSearchParams({ token: c.token || '', user: c.user || '', title, message: body });
      return {
        url: 'https://api.pushover.net/1/messages.json',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        },
        summary: 'Pushover',
      };
    }
    case 'email': {
      const headers = {
        Authorization: `Bearer ${c.apiKey || ''}`,
        'Content-Type': 'application/json',
      };
      if (c.provider === 'sendgrid') {
        return {
          url: 'https://api.sendgrid.com/v3/mail/send',
          options: {
            method: 'POST',
            headers,
            body: JSON.stringify({
              personalizations: [{ to: [{ email: c.to || '' }] }],
              from: { email: c.from || '' },
              subject: title,
              content: [{ type: 'text/plain', value: body }],
            }),
          },
          summary: 'SendGrid 邮件',
        };
      }
      return {
        url: 'https://api.resend.com/emails',
        options: {
          method: 'POST',
          headers,
          body: JSON.stringify({
            from: c.from || '',
            to: [c.to || ''],
            subject: title,
            html: `<div style="font-family:-apple-system,sans-serif"><h2>${escHtml(title)}</h2><p>${escHtml(body).replace(/\n/g, '<br>')}</p></div>`,
          }),
        },
        summary: 'Resend 邮件',
      };
    }
    case 'webhook': {
      let headers = {};
      try {
        headers = JSON.parse(c.headers || '{}') || {};
      } catch {
        headers = {};
      }
      const raw = applyTemplate(
        c.body || '{"app":"{{app}}","title":"{{title}}","body":"{{body}}","time":"{{time}}"}',
        payload,
        channel
      );
      const method = c.method || 'POST';
      if (method !== 'GET' && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
        headers['Content-Type'] = 'application/json';
      }
      return {
        url: c.url || '',
        options: { method, headers, body: method === 'GET' ? undefined : raw },
        summary: '自定义 Webhook',
      };
    }
    default:
      return { url: '', options: {}, summary: '未知渠道', error: '未知的渠道类型' };
  }
}

export async function sendChannel(channel, payload) {
  const req = await buildRequest(channel, payload);
  if (req.error || !req.url) {
    return { ok: false, error: req.error || '请求地址为空', request: req };
  }

  const method = String(req.options?.method || 'GET').toUpperCase();
  const ct = String(req.options?.headers?.['Content-Type'] || '').toLowerCase();
  const isSimple =
    method === 'GET' ||
    (method === 'POST' &&
      (!ct ||
        ct.startsWith('application/x-www-form-urlencoded') ||
        ct.startsWith('text/plain') ||
        ct.startsWith('multipart/form-data')));

  // Cross-origin requests are still delivered by the browser with mode:'no-cors'.
  // The response is opaque, so we can only confirm submission, not the server result.
  // This makes Bark / Server酱 / Pushover / simple webhooks work from the mini app.
  if (isSimple) {
    try {
      const opts = { method, mode: 'no-cors' };
      if (method === 'POST') {
        if (ct) opts.headers = { 'Content-Type': ct };
        if (req.options?.body) opts.body = req.options.body;
      }
      await fetch(req.url, opts);
      return {
        ok: true,
        opaque: true,
        status: 0,
        response: '',
        error: '',
        note: '请求已发出，但跨域限制下无法读取服务端响应，请到目标设备确认。',
        request: req,
      };
    } catch (e) {
      return {
        ok: false,
        error: (e?.message || '发送失败') + '（请检查地址是否与网络连通）',
        request: req,
      };
    }
  }

  try {
    const res = await fetch(req.url, req.options);
    const text = await res.text().catch(() => '');
    let parsed = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* plain text response */
    }
    const bizError =
      parsed && typeof parsed === 'object' &&
      ((parsed.errcode !== undefined && Number(parsed.errcode) !== 0) ||
        (parsed.code !== undefined && Number(parsed.code) >= 400));
    const ok = res.ok && !bizError;
    return {
      ok,
      status: res.status,
      response: String(text).slice(0, 300),
      error: ok ? '' : String(text).slice(0, 200) || `HTTP ${res.status}`,
      request: req,
    };
  } catch (e) {
    const msg = e?.message || '';
    const cors = /failed to fetch|networkerror|load failed|network request failed/i.test(msg);
    return {
      ok: false,
      error: cors ? '网络或跨域(CORS)失败，可用下方请求在快捷指令中发送' : msg || '发送失败',
      request: req,
    };
  }
}

export function requestToText(req) {
  if (!req) return '';
  const lines = [`${req.options?.method || 'GET'} ${req.url || ''}`];
  Object.entries(req.options?.headers || {}).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  if (req.options?.body) lines.push('', String(req.options.body));
  return lines.join('\n');
}

export async function buildTemplate(channel) {
  if (channel.type === 'bark') {
    const c = channel.config || {};
    const server = base(c.server || 'https://api.day.app');
    let url = `${server}/${c.deviceKey || '<设备Key>'}/{{app}}/{{title}} {{body}}`;
    const q = new URLSearchParams();
    if (c.group) q.set('group', c.group);
    if (c.icon) q.set('icon', c.icon);
    if (c.sound) q.set('sound', c.sound);
    if (c.level && c.level !== 'active') q.set('level', c.level);
    if (q.toString()) url += '?' + q.toString();
    return {
      url,
      method: 'GET',
      body: '',
      headers: {},
      note: '把 {{app}} / {{title}} / {{body}} 替换为快捷指令里的通知变量。若系统不提供正文，可只保留 {{app}}。',
    };
  }
  const req = await buildRequest(channel, {
    app: '{{app}}',
    title: '{{title}}',
    body: '{{body}}',
    time: '{{time}}',
  });
  return {
    url: req.url,
    method: req.options?.method || 'POST',
    body: req.options?.body || '',
    headers: req.options?.headers || {},
    note: '把 {{app}} / {{title}} / {{body}} / {{time}} 替换为快捷指令中的变量；POST 请求需在「获取 URL 内容」里展开「显示更多」设置方法与请求体。',
    error: req.error,
  };
}
