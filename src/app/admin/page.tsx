'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MoreVertical, X, Check, Search, ShieldAlert, Send } from 'lucide-react';

type User = {
    id: number;
    telegramId: string;
    name: string;
    username: string;
    role: string;
    createdAt: string;
    subscription: {
        id: number;
        plan: string;
        status: string;
        expiresAt: string;
    } | null;
    profile?: {
        phone: string | null;
        goal: string | null;
        level: string | null;
        age: number | null;
        weight: number | null;
    } | null;
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modals state
    const [accessModal, setAccessModal] = useState<User | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('Старт');
    const [selectedDays, setSelectedDays] = useState(30);

    const [messageModal, setMessageModal] = useState<User | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('fitness_token');
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                router.push('/dashboard');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessModal) return;

        try {
            const token = localStorage.getItem('fitness_token');
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    userId: accessModal.id, 
                    plan: selectedPlan, 
                    status: 'active',
                    days: selectedDays
                }),
            });
            if (!res.ok) throw new Error('Failed to update subscription');
            
            setAccessModal(null);
            fetchUsers();
        } catch (err) {
            alert('Error updating subscription');
        }
    };

    const handleRevokeAccess = async (userId: number) => {
        if (!confirm('Отключить доступ этому пользователю?')) return;
        
        try {
            const token = localStorage.getItem('fitness_token');
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, plan: 'none', status: 'inactive', days: 0 }),
            });
            if (!res.ok) throw new Error('Failed to revoke access');
            fetchUsers();
        } catch (err) {
            alert('Error revoking subscription');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageModal || !messageText.trim()) return;

        setSendingMessage(true);
        try {
            const token = localStorage.getItem('fitness_token');
            const res = await fetch('/api/admin/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ telegramId: messageModal.telegramId, message: messageText }),
            });
            if (!res.ok) throw new Error('Failed to send message');
            
            setMessageModal(null);
            setMessageText('');
            alert('Сообщение отправлено!');
        } catch (err) {
            alert('Ошибка при отправке сообщения');
        } finally {
            setSendingMessage(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5" />
                <span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
            {/* Minimalist Top Nav */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-serif text-stone-900 leading-none mb-1">Панель Управления</h1>
                    <p className="text-xs text-stone-500">Доступ и управление ученицами</p>
                </div>
                <button 
                    onClick={() => router.push('/dashboard')} 
                    className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors bg-stone-100/50 hover:bg-stone-100 px-4 py-2 rounded-xl"
                >
                    В дашборд
                </button>
            </header>

            <main className="max-w-5xl mx-auto p-6 mt-4">
                {/* Search Bar Placeholder */}
                <div className="mb-6 flex items-center gap-3 w-full bg-white border border-stone-200 rounded-2xl p-3 shadow-sm">
                    <Search className="w-5 h-5 text-stone-400" />
                    <input 
                        type="text" 
                        placeholder="Поиск по имени или ID..." 
                        className="bg-transparent border-none outline-none w-full text-sm placeholder:text-stone-400"
                    />
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-stone-100">
                                    <th className="px-6 py-5 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">Пользователь</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">Профиль</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">Доступ</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">Управление</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-serif text-lg">
                                                    {(user.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-stone-900 flex items-center gap-2">
                                                        {user.name || 'Без имени'} 
                                                        {user.role === 'admin' && <span className="bg-rose-100 text-rose-600 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md">Admin</span>}
                                                    </div>
                                                    <div className="text-stone-400 font-mono text-xs mt-0.5">{user.telegramId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5 align-middle">
                                            {user.profile ? (
                                                <div className="flex flex-col gap-1 text-[11px] text-stone-500">
                                                    {user.profile.phone && <div className="flex items-center gap-1.5"><span className="text-stone-400">📞</span> {user.profile.phone}</div>}
                                                    {user.profile.goal && <div className="flex items-center gap-1.5"><span className="text-stone-400">🎯</span> {user.profile.goal}</div>}
                                                    {(user.profile.age || user.profile.weight || user.profile.level) && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {user.profile.level && <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{user.profile.level}</span>}
                                                            {user.profile.age && <span>{user.profile.age} лет</span>}
                                                            {user.profile.weight && <span>{user.profile.weight} кг</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 italic">Нет профиля</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5 align-middle">
                                            {user.subscription?.status === 'active' ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 font-medium text-xs">
                                                        {user.subscription.plan}
                                                    </span>
                                                    <span className="text-[11px] text-stone-400 font-medium">
                                                        До {new Date(user.subscription.expiresAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500 font-medium text-xs">
                                                    Нет доступа
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-5 align-middle">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button 
                                                    onClick={() => setAccessModal(user)}
                                                    className="px-4 py-2 text-xs font-medium bg-white border border-stone-200 text-stone-700 rounded-xl hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm"
                                                >
                                                    Дать доступ
                                                </button>
                                                
                                                <button 
                                                    onClick={() => setMessageModal(user)}
                                                    className="p-2 text-stone-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="Написать"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                
                                                {user.subscription?.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleRevokeAccess(user.id)}
                                                        className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Забрать"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Grant Access Modal */}
            {accessModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-lg font-serif font-medium text-stone-900">Доступ: {accessModal.name}</h3>
                            <button onClick={() => setAccessModal(null)} className="p-2 bg-stone-100 text-stone-500 hover:text-stone-900 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleGrantAccess} className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Выберите программу</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Старт', 'Продвинутый', 'VIP'].map(plan => (
                                        <button
                                            key={plan}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`p-3 rounded-2xl text-sm font-medium border text-left transition-all relative overflow-hidden ${
                                                selectedPlan === plan 
                                                    ? 'border-rose-500 bg-rose-50 text-rose-700' 
                                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                            } ${plan === 'VIP' ? 'col-span-2' : ''}`}
                                        >
                                            {plan}
                                            {selectedPlan === plan && <Check className="w-4 h-4 absolute top-3 right-3 text-rose-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Длительность (дней)</label>
                                <div className="flex gap-2">
                                    {[30, 60, 90].map(days => (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => setSelectedDays(days)}
                                            className={`flex-1 p-2 rounded-xl border text-sm transition-all ${
                                                selectedDays === days
                                                    ? 'bg-stone-900 border-stone-900 text-white font-medium'
                                                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                            }`}
                                        >
                                            {days}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium shadow-lg shadow-rose-500/25 transition-all outline-none focus:ring-4 focus:ring-rose-500/20 active:scale-[0.98]"
                            >
                                Активировать доступ
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-serif text-stone-900 leading-tight">Сообщение</h3>
                                <p className="text-sm text-stone-500">Для {messageModal.name}</p>
                            </div>
                            <button onClick={() => setMessageModal(null)} className="p-2 bg-stone-100 text-stone-500 hover:text-stone-900 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSendMessage}>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Напишите тут..."
                                className="w-full h-32 p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 mb-6 resize-none transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={sendingMessage || !messageText.trim()}
                                className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Send className="w-4 h-4" />
                                {sendingMessage ? 'Отправляем...' : 'Отправить в Telegram'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
