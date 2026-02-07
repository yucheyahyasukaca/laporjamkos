import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';
import { QrCode, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Class } from '../types/database';
import { APP_VERSION } from '../constants';

export const StudentReport: React.FC = () => {
    const [reportingClass, setReportingClass] = useState<Class | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            window.history.replaceState({}, document.title, '/');
            validateToken(token);
        }
    }, []);

    const validateToken = async (token: string) => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('token', token)
                .single();

            if (error || !data) {
                setError('QR Code tidak valid');
                return;
            }

            setReportingClass(data);
            setShowModal(true);
        } catch (err) {
            setError('Terjadi kesalahan');
        }
    };

    const handleSubmit = async () => {
        if (!reportingClass) return;
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('reports')
                .insert({ class_id: reportingClass.id });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setReportingClass(null);
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError('Gagal mengirim laporan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setReportingClass(null);
        setError(null);
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full animate-slideUp">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
                            <img src="/sman1pati.png" alt="Logo SMAN 1 Pati" className="w-full h-full object-contain filter drop-shadow-md" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500 mb-4 tracking-tight drop-shadow-sm">
                            Lapor JAMKOS
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">Sistem Pelaporan Jam Kosong</p>
                    </div>

                    <GlassCard className="text-center py-12 border-white/60">
                        <div className="relative inline-block mb-8 group cursor-pointer">
                            <div className="absolute inset-0 bg-violet-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <div className="relative bg-gradient-to-tr from-violet-500 to-blue-500 p-6 rounded-full shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <QrCode className="text-white" size={48} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            Kelas Kosong?
                        </h2>
                        <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                            Scan QR code yang tertempel di dinding kelasmu untuk melapor.
                        </p>
                    </GlassCard>
                </div>

                <Modal isOpen={showModal} onClose={handleCancel}>
                    {success ? (
                        <div className="text-center py-8 animate-fadeIn">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 relative">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <CheckCircle className="text-green-500 relative z-10" size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Laporan Terkirim!</h3>
                            <p className="text-slate-500">Guru akan segera diberitahu.</p>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-4 mb-8 p-5 bg-blue-50 rounded-2xl border border-blue-100/50">
                                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Konfirmasi</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Kamu melapor kelas <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">{reportingClass?.name}</span> kosong.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-semibold"
                                >
                                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>

            {/* Copyright Footer */}
            <div className="absolute bottom-4 text-center w-full text-slate-400 text-xs text-shadow-sm">
                <p>&copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. All rights reserved. <span className="opacity-50 mx-1">|</span> v{APP_VERSION}</p>
            </div>
        </Layout>
    );
};
