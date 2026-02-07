import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ClipboardCheck, User, UserX, Phone, BookOpen, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Report } from '../types/database';

interface ProcessReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: (Report & { classes?: { name: string } }) | null;
    onSuccess: () => void;
}

type ActionType = 'giving_task' | 'contacting_teacher' | 'resolved';

export const ProcessReportModal: React.FC<ProcessReportModalProps> = ({ isOpen, onClose, report, onSuccess }) => {
    const [picketName, setPicketName] = useState('');
    const [missingTeacherName, setMissingTeacherName] = useState('');
    const [action, setAction] = useState<ActionType>('giving_task');
    const [loading, setLoading] = useState(false);

    // Load saved picket name from local storage on mount
    useEffect(() => {
        const savedPicketName = localStorage.getItem('picket_name');
        if (savedPicketName) {
            setPicketName(savedPicketName);
        }
    }, []);

    // Reset form when report changes
    useEffect(() => {
        if (isOpen && report) {
            setMissingTeacherName(report.missing_teacher_name || '');
            setAction(report.status === 'pending' ? 'giving_task' : report.status as ActionType);
        }
    }, [isOpen, report]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!report) return;

        setLoading(true);
        try {
            // Save picket name for convenience
            localStorage.setItem('picket_name', picketName);

            const { error } = await supabase
                .from('reports')
                .update({
                    picket_name: picketName,
                    missing_teacher_name: missingTeacherName,
                    status: action
                })
                .eq('id', report.id);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating report:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!report) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tindak Lanjut Laporan">
            <div className="p-1">
                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                        Kelas {report.classes?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {new Date(report.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <User size={16} className="text-violet-500" />
                                    Nama Petugas Piket
                                </span>
                            </label>
                            <Input
                                value={picketName}
                                onChange={(e) => setPicketName(e.target.value)}
                                placeholder="Siapa yang menangani ini?"
                                required
                                className="bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <UserX size={16} className="text-red-500" />
                                    Guru yang Berhalangan
                                </span>
                            </label>
                            <Input
                                value={missingTeacherName}
                                onChange={(e) => setMissingTeacherName(e.target.value)}
                                placeholder="Nama guru yang harusnya mengajar..."
                                required
                                className="bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Tindakan yang Diambil</label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAction('giving_task')}
                                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${action === 'giving_task'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${action === 'giving_task' ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Memberi Tugas (Selesai)</div>
                                        <div className="text-xs opacity-80">Berikan tugas & tandai selesai</div>
                                    </div>
                                    {action === 'giving_task' && (
                                        <div className="absolute top-4 right-4 text-emerald-500">
                                            <CheckCircle size={20} className="fill-current" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAction('contacting_teacher')}
                                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${action === 'contacting_teacher'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${action === 'contacting_teacher' ? 'bg-purple-200' : 'bg-slate-100'}`}>
                                        <Phone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Menghubungi Guru</div>
                                        <div className="text-xs opacity-80">Konfirmasi ke guru ybs</div>
                                    </div>
                                    {action === 'contacting_teacher' && (
                                        <div className="absolute top-4 right-4 text-purple-500">
                                            <CheckCircle size={20} className="fill-current" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAction('resolved')}
                                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${action === 'resolved'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${action === 'resolved' ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                                        <ClipboardCheck size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Selesai (Resolved)</div>
                                        <div className="text-xs opacity-80">Tandai sudah tertangani total</div>
                                    </div>
                                    {action === 'resolved' && (
                                        <div className="absolute top-4 right-4 text-emerald-500">
                                            <CheckCircle size={20} className="fill-current" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 py-3"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan & Update'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
