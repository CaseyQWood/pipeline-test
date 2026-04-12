import { NavLink } from 'react-router-dom';

const navItems = [
  {
    label: 'Simulate',
    path: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93zM12 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Profiles',
    path: '/profiles',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0-8a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm6 17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5zm-2-1v-1a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.03.69 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
      isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200',
    ].join(' ');

  const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary/20 text-primary border border-primary/40'
        : 'text-gray-400 hover:bg-surface-light hover:text-gray-200',
    ].join(' ');

  return (
    <>
      {/* Mobile: fixed bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-gray-700 flex items-stretch h-16">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass} style={{ flex: 1 }}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface border-r border-gray-700 pt-6 px-3 gap-2 shrink-0">
        <div className="px-4 mb-6">
          <span className="text-lg font-bold tracking-widest text-gold uppercase">MathHammer</span>
        </div>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={sidebarLinkClass}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>
    </>
  );
}
