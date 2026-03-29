'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Coins, Flame, CheckCircle, Trophy, Users, Star, ArrowLeft, Copy, Check, Share2, Dumbbell
} from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ProgressRecord {
    id: number;
    workoutId: number;
    completed: boolean;
    completedAt: string | null;
}

interface PointTransaction {
    id: number;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string | null;
}

interface PointsData {
    balance: number;
    transactions: PointTransaction[];
}

interface ReferralData {
    code: string;
    referralLink: string;
    registeredCount: number;
    purchasedCount: number;
}

const TX_ICONS: Record<string, React.ReactNode> = {
    workout_complete: <CheckCircle className="w-4 h-4 text-rose-400" />,
    course_complete: <Trophy className="w-4 h-4 text-yellow-400" />,
    referral_signup: <Users className="w-4 h-4 text-violet-400" />,
    referral_purchase: <Users className="w-4 h-4 text-violet-500" />,
    admin_grant: <Star className="w-4 h-4 text-stone-400" />,
};

function formatDate(ts: string | null) {
    if (!ts) return '';
    return new Date(Number(ts) * 1000 > 1e12 ? Number(ts) : new Date(ts).getTime()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function ProgressPage() {
    const { token } = useTelegramAuth();

    const [progress, setProgress] = useState<ProgressRecord[]>([]);
    const [points, setPoints] = useState<PointsData>({ balance: 0, transactions: [] });
    const [referral, setReferral] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [progressRes, pointsRes, referralRes] = await Promise.all([
            fetch('/api/progress', { headers }),
            fetch('/api/points', { headers }),
            fetch('/api/referral', { headers }),
        ]);

        const [progressData, pointsData, referralData] = await Promise.all([
            progressRes.json(),
            pointsRes.json(),
            referralRes.json(),
        ]);

        setProgress(progressData.progress || []);
        setPoints(pointsData);
        setReferral(referralData);
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (token) fetchData();
    }, [token, fetchData]);

    const completed = progress.filter(p => p.completed);

    // Calculate streak
    const dates = [...new Set(
        completed
            .filter(p => p.completedAt)
            .map(p => new Date(p.completedAt!).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (dates[0] === today || dates[0] === yesterday) {
        for (let i = 0; i < dates.length; i++) {
            const expected = new Date(Date.now() - i * 86400000).toDateString();
            if (dates[i] === expected) { streak++; } else { break; }
        }
    }

    const handleCopy = () => {
        if (!referral) return;
        navigator.clipboard.writeText(referral.referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleShare = () => {
        if (!referral) return;
        const text = encodeURIComponent('Тренируйся дома вместе со мной! Бережные тренировки для женщин 🌸');
        const url = encodeURIComponent(referral.referralLink);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto px-4 pt-5 pb-8 space-y-4">

                {/* Points Hero Card */}
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-5 h-5 opacity-80" />
                        <span className="text-sm opacity-80">Ваши баллы</span>
                    </div>
                    <p className="text-5xl font-bold tracking-tight">
                        {points.balance.toLocaleString('ru-RU')}
                    </p>
                    <p className="text-sm opacity-70 mt-1">баллов накоплено</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <Dumbbell className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
                        <p className="text-xs text-gray-500">тренировок</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{streak}</p>
                        <p className="text-xs text-gray-500">дней подряд</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{dates.length}</p>
                        <p className="text-xs text-gray-500">активных дней</p>
                    </div>
                </div>

                {/* How to earn */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Как заработать баллы</h2>
                    <div className="space-y-3">
                        {[
                            { icon: <CheckCircle className="w-4 h-4 text-rose-400" />, label: 'За каждую тренировку', pts: '+10' },
                            { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: 'За завершение курса', pts: '+200' },
                            { icon: <Users className="w-4 h-4 text-violet-400" />, label: 'Подруга зарегистрировалась', pts: '+50' },
                            { icon: <Users className="w-4 h-4 text-violet-500" />, label: 'Подруга купила курс', pts: '+300' },
                        ].map(({ icon, label, pts }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <span className="text-sm text-gray-700">{label}</span>
                                </div>
                                <span className="text-sm font-semibold text-rose-500">{pts}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referral Section */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-violet-500" />
                        <h2 className="text-sm font-semibold text-gray-900">Пригласи подругу</h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Зарабатывай баллы, когда подруга регистрируется и покупает курс
                    </p>

                    {referral && (
                        <>
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-3 border border-gray-100">
                                <span className="text-xs text-gray-600 truncate flex-1 mr-2 font-mono">
                                    {referral.referralLink}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-xs font-medium text-rose-500 shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Скопировано' : 'Копировать'}
                                </button>
                            </div>

                            <button
                                onClick={handleShare}
                                className="w-full flex items-center justify-center gap-2 bg-violet-50 text-violet-700 rounded-xl py-3 text-sm font-medium mb-4"
                            >
                                <Share2 className="w-4 h-4" />
                                Поделиться в Telegram
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-violet-50 rounded-xl p-3 text-center">
                                    <p className="text-xl font-bold text-violet-600">{referral.registeredCount}</p>
                                    <p className="text-xs text-violet-500 mt-0.5">зарегистрировалось</p>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-3 text-center">
                                    <p className="text-xl font-bold text-rose-600">{referral.purchasedCount}</p>
                                    <p className="text-xs text-rose-500 mt-0.5">купили курс</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">История баллов</h2>

                    {points.transactions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                            Пока нет начислений — завершите первую тренировку!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {points.transactions.slice(0, 15).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                                            {TX_ICONS[tx.type] ?? <Star className="w-4 h-4 text-gray-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 leading-tight">
                                                {tx.description || tx.type}
                                            </p>
                                            <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
