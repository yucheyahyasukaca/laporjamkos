import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout'; // Import AdminLayout
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';
import { Search, Plus, Trash2, Printer, Eye, Users, LayoutGrid, List } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import type { Class } from '../types/database';

export const Classes: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [viewingQrClass, setViewingQrClass] = useState<Class | null>(null);
    const [printingClass, setPrintingClass] = useState<Class | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchClasses();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
        }
    };

    const fetchClasses = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('classes')
            .select('*')
            .order('name');
        if (data) setClasses(data);
        setLoading(false);
    };

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setIsAdding(true);
        try {
            const { error } = await supabase
                .from('classes')
                .insert({ name: newClassName });

            if (error) throw error;

            setNewClassName('');
            setShowAddModal(false);
            fetchClasses();
        } catch (err) {
            console.error('Error adding class:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteClass = async (id: string, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus kelas ${name}?`)) return;

        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchClasses();
        } catch (err) {
            console.error('Error deleting class:', err);
        }
    };

    const handlePrint = (cls: Class) => {
        setPrintingClass(cls);
        setTimeout(() => window.print(), 100);
    };

    const qrUrl = (token: string) => {
        return `${window.location.origin}/?token=${token}`;
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <AdminLayout>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Kelas</h1>
                        <p className="text-slate-500 font-medium">Kelola daftar kelas dan kode QR</p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="mr-2" size={20} />
                        Tambah Kelas
                    </Button>
                </div>

                {/* Main Card */}
                <GlassCard className="!p-6 min-h-[500px] flex flex-col">
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between mb-8">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari kelas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-slate-50/50"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Tampilan Grid"
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Tampilan List"
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <Users size={18} />
                                <span className="hidden sm:inline">Total:</span>
                                <span>{filteredClasses.length} Kelas</span>
                            </div>
                        </div>
                    </div>

                    {/* Classes Content */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Memuat data...
                        </div>
                    ) : filteredClasses.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                <Search className="text-slate-300" size={40} />
                            </div>
                            <p className="text-slate-500 font-medium">Tidak ada kelas ditemukan.</p>
                            {searchQuery && <p className="text-slate-400 text-sm">Coba kata kunci lain.</p>}
                        </div>
                    ) : (
                        <>
                            {/* GRID VIEW */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                                    {filteredClasses.map((cls) => (
                                        <div key={cls.id} className="group relative bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300">

                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-lg group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                                    {cls.name.substring(0, 2)}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setViewingQrClass(cls)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat QR"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-800 mb-1">{cls.name}</h3>
                                            <p className="text-xs text-slate-400 font-mono mb-4 truncate">ID: {cls.id.split('-')[0]}...</p>

                                            <Button
                                                variant="secondary"
                                                onClick={() => handlePrint(cls)}
                                                className="w-full py-2 text-sm bg-slate-50 hover:bg-violet-50 border-slate-200 hover:border-violet-200 text-slate-600 hover:text-violet-700"
                                            >
                                                <Printer className="mr-2" size={16} />
                                                Cetak QR
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* LIST VIEW */}
                            {viewMode === 'list' && (
                                <div className="animate-fadeIn space-y-3">
                                    {filteredClasses.map((cls) => (
                                        <div key={cls.id} className="group flex items-center justify-between p-4 bg-white/40 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md hover:border-violet-200 transition-all duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 font-bold group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                                    {cls.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{cls.name}</h3>
                                                    <p className="text-xs text-slate-400 font-mono">ID: {cls.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handlePrint(cls)}
                                                    className="hidden sm:flex py-1.5 px-3 text-xs bg-slate-50 hover:bg-violet-50 border-slate-200 hover:border-violet-200 text-slate-600 hover:text-violet-700"
                                                >
                                                    <Printer className="mr-2" size={14} />
                                                    Cetak
                                                </Button>

                                                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                                                <button
                                                    onClick={() => setViewingQrClass(cls)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat QR"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </GlassCard>

                {/* Add Class Modal */}
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="p-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Tambah Kelas Baru</h3>
                            <p className="text-slate-500">Masukkan nama kelas selengkapnya</p>
                        </div>

                        <form onSubmit={handleAddClass}>
                            <Input
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                placeholder="Contoh: XII IPA 1"
                                className="mb-6 bg-slate-50 border-slate-200 text-center text-lg py-3"
                                required
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20"
                                >
                                    {isAdding ? 'Menyimpan...' : 'Simpan Kelas'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>

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

            {/* Print Layout */}
            {printingClass && (
                <div className="hidden print:flex min-h-screen items-center justify-center p-8 bg-white fixed inset-0 z-[100]">
                    <div className="text-center border-4 border-black p-12 rounded-[3rem] max-w-2xl w-full">
                        <h1 className="text-6xl font-black mb-4 tracking-tighter">Lapor JAMKOS</h1>
                        <div className="h-2 w-32 bg-black mx-auto mb-8"></div>

                        <h2 className="text-4xl font-bold mb-12 border-b-4 border-black inline-block pb-2">
                            KELAS {printingClass.name}
                        </h2>

                        <div className="flex justify-center mb-10">
                            <QRCodeCanvas
                                value={qrUrl(printingClass.token)}
                                size={400}
                                level="H"
                                includeMargin
                                imageSettings={{
                                    src: "",
                                    x: undefined,
                                    y: undefined,
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <p className="text-2xl font-bold mb-2 uppercase tracking-wide">Scan untuk lapor</p>
                        <p className="text-lg text-gray-600">Guru tidak hadir? Scan kode ini!</p>
                    </div>
                </div>
            )}
        </>
    );
};
