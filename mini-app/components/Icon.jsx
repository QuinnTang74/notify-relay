const P = {
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 8.5h-17C3.5 16 6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  home: <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 21v-7h6v7" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2A5 5 0 0 0 12.5 4l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2A5 5 0 0 0 11.5 20l1-1" /></>,
  sliders: <><path d="M4 21v-6" /><path d="M4 11V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1.5 15h5" /><path d="M9.5 8h5" /><path d="M17.5 16h5" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.2 14.5a1.6 1.6 0 0 0 .32 1.77l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97H3a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.06a1.6 1.6 0 0 0 1.77.32h.08A1.6 1.6 0 0 0 9.1 3.1V3a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.47.97H21a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.47.97Z" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" /></>,
  send: <><path d="m21 3-9 18-2.5-7.5L2 11l19-8Z" /><path d="M21 3 9.5 13.5" /></>,
  check: <><path d="m5 12 4.5 4.5L19 7" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  moon: <><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
  message: <><path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-5A8 8 0 1 1 21 12Z" /><path d="M8 12h8M8 9h5" /></>,
  megaphone: <><path d="M3 11v2a2 2 0 0 0 2 2h2l7 4V5L7 9H5a2 2 0 0 0-2 2Z" /><path d="M18 9a4 4 0 0 1 0 6" /><path d="M6 15v5h3v-4" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4" /><path d="M8 8h2M14 8h2M8 12h2M14 12h2" /></>,
  feather: <><path d="M20 4c-6 0-11 2-13 7-1.5 3.5-1 7-3 9" /><path d="M20 4c0 8-4 12-10 13" /><path d="M5 19h6" /><path d="M12 11h.01" /></>,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>,
  webhook: <><circle cx="12" cy="7" r="3" /><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m10.5 9.5-3 5M13.5 9.5l3 5M9 17h6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9Z" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 5 3 8.5 7.5 10 4.5-1.5 7.5-5 7.5-10V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 8-8M17 5l2 2M14 8l2 2" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 20h16" /></>,
  sparkles: <><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15Z" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4 1.8 1.8 0 0 1 1.3-3.1H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="15" cy="8" r="1" /></>,
  filter: <><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  wave: <><path d="M3 12h2l2-6 3 12 3-9 2 3h6" /></>,
  circle: <><circle cx="12" cy="12" r="8" /></>,
};

export default function Icon({ name, size = 20, color, stroke = 1.8, className = '', style }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {P[name] || P.circle}
    </svg>
  );
}

export const CHANNEL_ICONS = {
  bark: 'bell',
  serverchan: 'message',
  pushplus: 'megaphone',
  wecom: 'building',
  dingtalk: 'send',
  feishu: 'feather',
  pushover: 'smartphone',
  email: 'mail',
  webhook: 'webhook',
};
