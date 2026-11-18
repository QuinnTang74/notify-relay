import { buildTemplate } from './channels.js';

export const STEPS = [
  {
    n: 1,
    title: '创建个人自动化',
    text: '打开「快捷指令」App → 底部「自动化」→ 右上角「+」→「创建个人自动化」。',
  },
  {
    n: 2,
    title: '选择触发器',
    text: '下滑找到「收到通知」→ 点「选取」选择要转发的 App → 点「下一步」。',
  },
  {
    n: 3,
    title: '添加发送动作',
    text: '点「添加操作」→ 搜索「获取 URL 内容」→ 展开「显示更多」设置方法与 URL；POST 还要填请求体。每个渠道重复添加一次。',
  },
  {
    n: 4,
    title: '替换变量',
    text: '把请求里的 {{app}} / {{title}} / {{body}} 替换为自动化提供的通知变量；若你的 iOS 版本不提供正文，就只保留 App 名与时间。',
  },
  {
    n: 5,
    title: '立即运行',
    text: '关闭「运行前询问」（部分系统需确认一次），之后收到该 App 的通知就会自动转发。',
  },
];

export async function buildSetup(state) {
  const apps = (state.apps || []).filter((a) => a.enabled !== false);
  const channels = (state.channels || []).filter((c) => c.enabled !== false);
  const items = [];
  for (const app of apps) {
    const targets = channels.filter(
      (c) => !app.channelIds || app.channelIds.length === 0 || app.channelIds.includes(c.id)
    );
    const requests = [];
    for (const c of targets) {
      const tpl = await buildTemplate(c);
      requests.push({ channel: c, ...tpl });
    }
    items.push({ app, requests });
  }
  return items;
}

export function formatRequest(req) {
  const lines = [];
  lines.push(`${req.method || 'GET'} ${req.url || ''}`);
  Object.entries(req.headers || {}).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  if (req.body) lines.push('', String(req.body));
  return lines.join('\n');
}
