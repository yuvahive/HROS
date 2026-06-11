import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title, subtitle, onRefresh, loading, activePage, onNavigate }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
