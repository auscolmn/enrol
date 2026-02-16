import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, FileText, Users, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-indigo-100">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-indigo-100">
            <Link href="/dashboard/pipeline" className="text-xl font-bold text-[#1E1B4B]">
              Enrol<span className="text-[#6366F1]">Studio</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link
              href="/dashboard/pipeline"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#1E1B4B]/70 rounded-lg hover:bg-[#6366F1]/5 hover:text-[#6366F1] transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5" />
              Pipeline
            </Link>
            <Link
              href="/dashboard/forms"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#1E1B4B]/70 rounded-lg hover:bg-[#6366F1]/5 hover:text-[#6366F1] transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              Forms
            </Link>
            <Link
              href="/dashboard/applicants"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#1E1B4B]/70 rounded-lg hover:bg-[#6366F1]/5 hover:text-[#6366F1] transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              Applicants
            </Link>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-indigo-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-[#6366F1]/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-[#6366F1]">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1E1B4B] truncate">
                  {user.email}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="p-2 text-[#1E1B4B]/40 hover:text-[#6366F1] rounded-lg hover:bg-[#6366F1]/5 transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
