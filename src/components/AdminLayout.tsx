import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Layout } from './Layout';
import { supabase } from '../lib/supabase';
import { Menu } from 'lucide-react';

import { APP_VERSION } from '../constants';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <Layout>
            <div className="min-h-screen flex print:hidden">
                <Sidebar
                    isOpen={sidebarOpen}
                    setIsOpen={setSidebarOpen}
                    onLogout={handleLogout}
                    onNavigate={(path) => navigate(path)}
                />

                <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Decorative Background Elements - Moved from AdminDashboard for consistency */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    {/* Mobile Header */}
                    <div className="lg:hidden p-4 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-white z-30 sticky top-0">
                        <div className="flex items-center gap-2">
                            <img src="/sman1pati.png" alt="Logo" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-slate-800">LaporJAMKOS</span>
                        </div>
                        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
                            <Menu size={24} />
                        </button>
                    </div>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-violet-100 relative z-10 text-pretty">
                        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-4">
                            {children}
                        </div>
                    </main>

                    {/* Footer - Always Visible */}
                    <footer className="py-3 text-center text-slate-400 text-xs bg-white/40 backdrop-blur-sm border-t border-white/40 relative z-20">
                        <p>&copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. All rights reserved. <span className="opacity-50 mx-1">|</span> v{APP_VERSION}</p>
                    </footer>
                </div>
            </div>
        </Layout>
    );
};
