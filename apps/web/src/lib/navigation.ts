export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/** Main tabs (sidebar on desktop, bottom bar on mobile). */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Hoje', icon: 'today' },
  { href: '/semana', label: 'Semana', icon: 'calendar_view_week' },
  { href: '/comodos', label: 'Cômodos', icon: 'meeting_room' },
  { href: '/progresso', label: 'Progresso', icon: 'insights' },
  { href: '/casa', label: 'Casa', icon: 'home' },
];

export const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.replace(/\/$/, '') === href;
