'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
  { name: 'Profesionales', href: '/admin/profesionales', icon: '👤' },
  { name: 'Clientes', href: '/admin/clientes', icon: '👥' },
  { name: 'Servicios', href: '/admin/servicios', icon: '⏰' },
  { name: 'Facturas', href: '/admin/facturas', icon: '📄' },
  { name: 'Notificaciones', href: '/admin/notificaciones', icon: '🔔' },
  { name: 'Logs', href: '/admin/logs', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-100 min-h-screen fixed left-0 top-0 pt-16">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Wanacare</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}



