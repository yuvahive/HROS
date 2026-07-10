import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../auth/AuthContext';

export default function Layout({ children, title, subtitle, onRefresh, loading, activePage, onNavigate }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { impersonatedRole, effectiveRole, stopImpersonation, currentUser } = useAuth();

  return (
    <div className="flex h-screen bg-hd-bg overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        active={activePage}
        onNavigate={(p) => { onNavigate(p); setMobileOpen(false); }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {impersonatedRole && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">
                Viewing as <span className="font-bold capitalize">{impersonatedRole}</span>
                <span className="text-amber-400/60 ml-2">(Your actual role: {currentUser?.role})</span>
              </span>
            </div>
            <button onClick={stopImpersonation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
              <X className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        )}

        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          loading={loading}
          onToggleSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
