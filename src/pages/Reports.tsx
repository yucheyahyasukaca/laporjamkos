import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AdminLayout } from '../components/AdminLayout'; // Import AdminLayout
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, Clock, Filter, Search, Calendar, Menu } from 'lucide-react';
import type { Class, Report } from '../types/database';

interface ReportWithClass extends Report {
    classes: Class;
}

export const Reports: React.FC = () => {
    const [reports, setReports] = useState<ReportWithClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolvedToday: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchReports();
        subscribeToReports();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*, classes(*)')
                .order('created_at', { ascending: false });

            if (data) {
                setReports(data as ReportWithClass[]);
                calculateStats(data as ReportWithClass[]);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: ReportWithClass[]) => {
        const today = new Date().toDateString();
        const pending = data.filter(r => r.status === 'pending').length;
        const resolvedToday = data.filter(r =>
            r.status === 'resolved' &&
            new Date(r.created_at).toDateString() === today
        ).length;

        setStats({
            total: data.length,
            pending,
            resolvedToday
        });
    };

    const subscribeToReports = () => {
        const channel = supabase
            .channel('public:reports')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
                fetchReports();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleResolve = async (id: string) => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: 'resolved' })
                .eq('id', id);

            if (error) throw error;
            // No need to manually fetch, subscription will handle it
        } catch (err) {
            console.error('Error resolving report:', err);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.classes?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Riwayat Laporan</h1>
                    <p className="text-slate-500 font-medium">Pantau semua laporan jam kosong di sini</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="!p-5 border-l-4 border-l-violet-500">
                    <p className="text-slate-500 font-medium mb-1">Total Laporan</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
                </GlassCard>
                <GlassCard className="!p-5 border-l-4 border-l-amber-500">
                    <p className="text-slate-500 font-medium mb-1">Perlu Ditangani</p>
                    <h3 className="text-3xl font-bold text-amber-600">{stats.pending}</h3>
                </GlassCard>
                <GlassCard className="!p-5 border-l-4 border-l-emerald-500">
                    <p className="text-slate-500 font-medium mb-1">Selesai Hari Ini</p>
                    <h3 className="text-3xl font-bold text-emerald-600">{stats.resolvedToday}</h3>
                </GlassCard>
            </div>

            {/* Main Content */}
            <GlassCard className="!p-6 min-h-[500px]">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                    <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus('resolved')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'resolved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Selesai
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama kelas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-slate-50/50"
                        />
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Memuat laporan...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                <Filter className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">Tidak ada laporan yang sesuai filter.</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className={`group p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${report.status === 'pending'
                                        ? 'bg-amber-50/30 border-amber-100 hover:border-amber-200'
                                        : 'bg-white/40 border-slate-100 hover:border-violet-100'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${report.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {report.status === 'pending' ? <Bell size={24} /> : <CheckCircle size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-800">Kelas {report.classes?.name}</h3>
                                                {report.status === 'pending' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                                                        Baru
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {formatDate(report.created_at)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {formatTime(report.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {report.status === 'pending' ? (
                                        <Button
                                            onClick={() => handleResolve(report.id)}
                                            className="w-full md:w-auto bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 shadow-sm"
                                        >
                                            <CheckCircle className="mr-2" size={18} />
                                            Tandai Selesai
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-xl">
                                            <CheckCircle size={18} />
                                            <span>Sudah Ditangani</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </AdminLayout>
    );
};
