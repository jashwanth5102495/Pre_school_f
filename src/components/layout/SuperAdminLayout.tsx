import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSocket } from '../../hooks/useSocket';
import { CheckCircle2 } from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hook into live Socket.IO events
  useSocket((event, payload) => {
    if (event === 'school:created') {
      setToastMessage(`New School Onboarded: ${payload.name} (${payload.schoolDisplayId})`);
    } else if (event === 'school:status_updated') {
      setToastMessage(`School status changed for ID: ${payload.schoolId} -> ${payload.status}`);
    } else if (event === 'payment:completed') {
      setToastMessage(`Payment of ₹${payload.amount} received (Txn: ${payload.transactionId})`);
    } else if (event === 'platform:announcement') {
      setToastMessage(`Platform Announcement: ${payload.title}`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e1e] dark:bg-[#1e1e1e] transition-colors duration-200">
      {/* Sidebar: collapsed (icon-only) or expanded */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((v) => !v)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-[#f8fafc] dark:bg-[#212121]">
          <Outlet />
        </main>
      </div>

      {/* Real-time Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-medium">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLayout;
