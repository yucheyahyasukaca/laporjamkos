import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout'; // Import AdminLayout
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { Clock, Calendar, CheckCircle, BookOpen, Phone } from 'lucide-react';
import { Modal } from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import type { Class } from '../types/database';
import { Button } from '../components/Button';



export const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [viewingQrClass, setViewingQrClass] = useState<Class | null>(null);
    const [stats, setStats] = useState({
        pending: 0,
        processing: 0,
        resolved: 0,
        totalToday: 0
    });
    const [todayReports, setTodayReports] = useState<any[]>([]);
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all');

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

            // Fetch ALL reports for today with class details
            const { data: reports, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    class:classes(name)
                `)
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            const allReports = reports || [];

            // Calculate stats
            const pendingCount = allReports.filter(r => r.status === 'pending').length;
            const processingCount = allReports.filter(r => r.status === 'contacting_teacher').length;
            const resolvedCount = allReports.filter(r => ['resolved', 'giving_task'].includes(r.status)).length;

            setStats({
                pending: pendingCount,
                processing: processingCount,
                resolved: resolvedCount,
                totalToday: allReports.length
            });

            setTodayReports(allReports);

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

    // Filter logic for the table
    const filteredReports = todayReports.filter(report => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return report.status === 'pending';
        if (filterStatus === 'processing') return report.status === 'contacting_teacher';
        if (filterStatus === 'resolved') return ['resolved', 'giving_task'].includes(report.status);
        return true;
    });

    return (
        <>
            <AdminLayout>
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-violet-600 font-medium mb-1 bg-violet-50 w-fit px-3 py-1 rounded-full text-xs md:text-sm">
                            <Calendar size={14} />
                            {currentDate}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Admin!</span>
                        </h1>
                        <p className="text-slate-500 mt-1 text-lg">Pantau status kelas jam kosong hari ini.</p>
                    </div>
                </div>

                {/* RTS (Real Time Status) Grid - The "Perjelas" Request */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 1. Masih Kosong (Pending) - CRITICAL */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-red-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-600">
                            <Clock size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <Clock size={20} />
                                </div>
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Belum Ditangani</p>
                            </div>
                            <h2 className="text-5xl font-bold text-slate-800 mb-1">{stats.pending}</h2>
                            <p className="text-red-500 text-sm font-medium">Kelas masih kosong!</p>
                        </div>
                    </GlassCard>

                    {/* 2. Sedang Proses */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-amber-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-600">
                            <Phone size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Phone size={20} />
                                </div>
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Sedang Proses</p>
                            </div>
                            <h2 className="text-5xl font-bold text-slate-800 mb-1">{stats.processing}</h2>
                            <p className="text-amber-600 text-sm font-medium">Menghubungi guru...</p>
                        </div>
                    </GlassCard>

                    {/* 3. Selesai */}
                    <GlassCard className="!p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-emerald-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-600">
                            <CheckCircle size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <CheckCircle size={20} />
                                </div>
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Selesai</p>
                            </div>
                            <h2 className="text-5xl font-bold text-slate-800 mb-1">{stats.resolved}</h2>
                            <p className="text-emerald-600 text-sm font-medium">Guru hadir / Diberi tugas</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Live Status Board Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-2 h-6 bg-violet-600 rounded-full"></div>
                            Live Status Hari Ini
                        </h3>

                        {/* Filters */}
                        <div className="flex p-1 bg-white/50 backdrop-blur rounded-xl border border-white/60 shadow-sm w-fit">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Belum
                            </button>
                            <button
                                onClick={() => setFilterStatus('processing')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'processing' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Proses
                            </button>
                            <button
                                onClick={() => setFilterStatus('resolved')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'resolved' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="p-4 font-semibold text-slate-500 text-sm">Waktu</th>
                                        <th className="p-4 font-semibold text-slate-500 text-sm">Kelas</th>
                                        <th className="p-4 font-semibold text-slate-500 text-sm">Status Terkini</th>
                                        <th className="p-4 font-semibold text-slate-500 text-sm">Keterangan</th>
                                        <th className="p-4 font-semibold text-slate-500 text-sm text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">Memuat data...</td>
                                        </tr>
                                    ) : filteredReports.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="text-slate-300" size={24} />
                                                    </div>
                                                    <p>Tidak ada data untuk status ini.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-white/50 transition-colors">
                                            <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                                                {new Date(report.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-lg text-slate-800">{report.class?.name || 'Unknown'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${report.status === 'pending' ? 'bg-red-100 text-red-600 border border-red-200' :
                                                        report.status === 'giving_task' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
                                                            report.status === 'contacting_teacher' ? 'bg-purple-100 text-purple-600 border border-purple-200' :
                                                                'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>

                                                    {report.status === 'pending' ? <Clock size={14} /> :
                                                        report.status === 'giving_task' ? <BookOpen size={14} /> :
                                                            report.status === 'contacting_teacher' ? <Phone size={14} /> :
                                                                <CheckCircle size={14} />}

                                                    {report.status === 'pending' ? 'Belum Ditangani' :
                                                        report.status === 'giving_task' ? 'Diberi Tugas' :
                                                            report.status === 'contacting_teacher' ? 'Hubungi Guru' :
                                                                'Selesai'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-slate-600 max-w-xs truncate">
                                                    {report.status === 'pending' ? 'Menunggu tindakan piket' :
                                                        report.picket_name ? `Ditangani oleh ${report.picket_name}` : '-'}
                                                </p>
                                                {report.missing_teacher_name && (
                                                    <p className="text-xs text-slate-400 mt-1">Guru: {report.missing_teacher_name}</p>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    onClick={() => navigate('/admin/reports')}
                                                    variant="secondary"
                                                    className="py-1.5 px-3 text-xs"
                                                >
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
