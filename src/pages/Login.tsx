import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import { APP_VERSION } from '../constants';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/admin');
        } catch (err: any) {
            setError('Email atau password salah');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full animate-slideUp">

                    <GlassCard className="px-8 py-10 bg-white/80 border-white shadow-xl shadow-slate-200/50">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm mb-6 p-2">
                                <img src="/sman1pati.png" alt="Logo SMAN 1 Pati" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Selamat Datang</h1>
                            <p className="text-slate-500 font-medium">Silakan login untuk mengelola kelas</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <Input
                                label="Alamat Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@sekolah.com"
                                required
                                className="bg-white border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                            />

                            <Input
                                label="Kata Sandi"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-white border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                            />

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full py-3.5 text-lg shadow-lg shadow-violet-500/20 group relative overflow-hidden bg-gradient-to-r from-violet-600 to-blue-600 hover:to-blue-700 transition-all duration-300"
                            >
                                <span className="relative flex items-center justify-center gap-2 text-white font-semibold">
                                    {loading ? 'Masuk...' : 'Masuk'}
                                    {!loading && <ArrowRight size={18} className="text-white/80 group-hover:text-white transition-colors" />}
                                </span>
                            </Button>
                        </form>
                    </GlassCard>

                    <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                        Dilindungi oleh Sistem Admin Lapor JAMKOS
                    </p>
                </div>

                {/* Copyright Footer */}
                <div className="absolute bottom-4 text-center w-full text-slate-400 text-xs text-shadow-sm">
                    <p>&copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. All rights reserved. <span className="opacity-50 mx-1">|</span> v{APP_VERSION}</p>
                </div>
            </div>
        </Layout>
    );
};
