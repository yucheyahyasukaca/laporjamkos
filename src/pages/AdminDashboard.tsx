import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout'; // Import AdminLayout
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { Bell, Clock, Users, FileText, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { Modal } from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import type { Class } from '../types/database';
import { Button } from '../components/Button';



export const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [viewingQrClass, setViewingQrClass] = useState<Class | null>(null);
    const [stats, setStats] = useState({
        reportsToday: 0,
        totalClasses: 0,
        totalReports: 0
    });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchDashboardData();
        subscribeToReports();
        updateTime();

        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, []);

    const updateTime = () => {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 5 && hour < 12) setGreeting('Selamat Pagi');
        else if (hour >= 12 && hour < 15) setGreeting('Selamat Siang');
        else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        setCurrentDate(now.toLocaleDateString('id-ID', options));
    };

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { count: reportsTodayCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString());

            const { count: totalReportsCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true });

            const { count: totalClassesCount } = await supabase
                .from('classes')
                .select('*', { count: 'exact', head: true });

            const { data: recent } = await supabase
                .from('reports')
                .select(`
                    *,
                    class:classes(name)
                `)
                .order('created_at', { ascending: false })
                .limit(4);

            setStats({
                reportsToday: reportsTodayCount || 0,
                totalClasses: totalClassesCount || 0,
                totalReports: totalReportsCount || 0
            });

            if (recent) setRecentReports(recent);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToReports = () => {
        const channel = supabase
            .channel('public:reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => {
                fetchDashboardData();
                playNotificationSound();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => { });
    };

    const qrUrl = (token: string) => {
        return `${window.location.origin}/?token=${token}`;
    };

    return (
        <>
            <AdminLayout>
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 text-violet-600 font-medium mb-1 bg-violet-50 w-fit px-3 py-1 rounded-full text-xs md:text-sm">
                            <Calendar size={14} />
                            {currentDate}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Admin!</span>
                        </h1>
                        <p className="text-slate-500 mt-1 text-lg">Siap memantau aktivitas sekolah hari ini?</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-violet-600 border border-violet-100">
                            <Bell size={20} />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Reports Today */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Laporan Hari Ini</p>
                            <h2 className="text-4xl font-bold text-slate-800 mb-2">{stats.reportsToday}</h2>
                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                <TrendingUp size={12} />
                                <span>Update Realtime</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                    </GlassCard>

                    {/* Registered Classes */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Kelas Terdaftar</p>
                            <h2 className="text-4xl font-bold text-slate-800 mb-2">{stats.totalClasses}</h2>
                            <div className="text-slate-400 text-xs">Total ruang kelas aktif</div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    </GlassCard>

                    {/* Total Reports */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Total Jempolan</p>
                            <h2 className="text-4xl font-bold text-slate-800 mb-2">{stats.totalReports}</h2>
                            <div className="text-slate-400 text-xs">Akumulasi semua laporan</div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Activity Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="text-violet-600 text-sm font-semibold hover:text-violet-700 flex items-center gap-1"
                            >
                                Lihat Semua <ArrowRight size={16} />
                            </button>
                        </div>

                        {loading ? (
                            <GlassCard className="p-8 text-center text-slate-400">Memuat data...</GlassCard>
                        ) : recentReports.length === 0 ? (
                            <GlassCard className="p-8 text-center text-slate-400 flex flex-col items-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <Bell size={24} className="text-slate-300" />
                                </div>
                                Belum ada laporan terbaru.
                            </GlassCard>
                        ) : (
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <GlassCard key={report.id} className="!p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/reports')}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${report.status === 'pending'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                {report.status === 'pending' ? <Clock size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800 truncate">
                                                        Kelas {report.class?.name || 'Unknown'}
                                                    </h4>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                                        {new Date(report.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 truncate mt-0.5">
                                                    {report.status === 'pending' ? 'Melaporkan jam kosong baru' : 'Laporan telah diselesaikan'}
                                                </p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Aksi Cepat</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => navigate('/admin/classes')}
                                className="group p-4 bg-white/60 backdrop-blur-md border border-white rounded-2xl shadow-sm hover:shadow-lg hover:bg-white transition-all text-left flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Kelola Data Kelas</h4>
                                    <p className="text-xs text-slate-500">Tambah atau edit kelas</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="group p-4 bg-white/60 backdrop-blur-md border border-white rounded-2xl shadow-sm hover:shadow-lg hover:bg-white transition-all text-left flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">Semua Laporan</h4>
                                    <p className="text-xs text-slate-500">Lihat riwayat lengkap</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                <Modal isOpen={!!viewingQrClass} onClose={() => setViewingQrClass(null)}>
                    {viewingQrClass && (
                        <div className="text-center p-6">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Kode QR Kelas</h3>
                            <p className="text-slate-500 mb-8 text-lg font-medium bg-slate-100 inline-block px-4 py-1 rounded-full">{viewingQrClass.name}</p>

                            <div className="bg-white p-6 rounded-3xl inline-block shadow-lg border border-slate-100 mb-8 transform hover:scale-105 transition-transform duration-300">
                                <QRCodeCanvas
                                    value={qrUrl(viewingQrClass.token)}
                                    size={256}
                                    level="H"
                                    includeMargin
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button onClick={() => setViewingQrClass(null)} variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3">
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </AdminLayout>


        </>
    );
};
