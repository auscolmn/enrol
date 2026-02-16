'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, LogOut, Menu, X } from 'lucide-react';

interface DashboardSidebarProps {
  userEmail: string;
}

export default function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { href: '/dashboard/pipeline', icon: LayoutDashboard, label: 'Pipeline' },
    { href: '/dashboard/forms', icon: FileText, label: 'Forms' },
    { href: '/dashboard/applicants', icon: Users, label: 'Applicants' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-indigo-100 flex items-center px-4 z-40 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 -ml-2 text-[#1E1B4B]/70 hover:text-[#6366F1] hover:bg-[#6366F1]/5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/dashboard/pipeline" className="ml-3 text-lg font-bold text-[#1E1B4B]">
          Enrol<span className="text-[#6366F1]">Studio</span>
        </Link>
        <div className="ml-auto">
          <div className="w-8 h-8 bg-[#6366F1]/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-[#6366F1]">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-white border-r border-indigo-100 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-100">
            <Link href="/dashboard/pipeline" className="text-xl font-bold text-[#1E1B4B]">
              Enrol<span className="text-[#6366F1]">Studio</span>
            </Link>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 text-[#1E1B4B]/70 hover:text-[#6366F1] hover:bg-[#6366F1]/5 rounded-lg transition-all duration-200 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    min-h-[44px]
                    ${active 
                      ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                      : 'text-[#1E1B4B]/70 hover:bg-[#6366F1]/5 hover:text-[#6366F1]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-indigo-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-[#6366F1]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-[#6366F1]">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1E1B4B] truncate">
                  {userEmail}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="p-2.5 text-[#1E1B4B]/40 hover:text-[#6366F1] rounded-lg hover:bg-[#6366F1]/5 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
