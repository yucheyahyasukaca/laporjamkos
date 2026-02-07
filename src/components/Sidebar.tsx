import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
    onLogout: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onNavigate?: (path: string) => void;
}


import { useUserRole } from '../hooks/useUserRole';

interface SidebarProps {
    onLogout: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen, onNavigate }) => {
    const [userEmail, setUserEmail] = useState('Loading...');
    const { role } = useUserRole();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || 'No Email');
            }
        };
        fetchUser();
    }, []);

    const displayRole = role === 'picket' ? 'Guru Piket' : 'Administrator';

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/60 backdrop-blur-2xl border-r border-white/60 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
                {/* Logo Area */}
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <img src="/sman1pati.png" alt="Logo SMAN 1 Pati" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-tight">Lapor<br /><span className="text-violet-600">JAMKOS</span></h1>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-2">Menu Utama</div>

                    <button
                        onClick={() => onNavigate ? onNavigate('/admin') : window.location.href = '/admin'}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold shadow-sm transition-all duration-200 ${window.location.pathname === '/admin' ? 'bg-violet-100/50 text-violet-700' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>

                    <button
                        onClick={() => onNavigate ? onNavigate('/admin/reports') : window.location.href = '/admin/reports'}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${window.location.pathname === '/admin/reports' ? 'bg-violet-100/50 text-violet-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                    >
                        <FileText size={20} />
                        Laporan
                    </button>

                    <button
                        onClick={() => onNavigate ? onNavigate('/admin/classes') : window.location.href = '/admin/classes'}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${window.location.pathname === '/admin/classes' ? 'bg-violet-100/50 text-violet-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                    >
                        <Users size={20} />
                        Data Kelas
                    </button>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/40 bg-white/10">
                    <div className="bg-white/40 rounded-2xl p-4 backdrop-blur-sm border border-white/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border border-white">
                                {role === 'picket' ? 'P' : 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{displayRole}</p>
                                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors"
                        >
                            <LogOut size={16} />
                            Keluar Aplikasi
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
