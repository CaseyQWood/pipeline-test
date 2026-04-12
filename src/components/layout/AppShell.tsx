import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-dark text-white">
      <Navigation />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
