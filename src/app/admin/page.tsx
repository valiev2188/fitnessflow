'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MoreVertical, X, Check, Search, ShieldAlert, Send, Tag, Megaphone, Users } from 'lucide-react';

type Subscription = {
    id: number;
    plan: string;
    status: string;
    expiresAt: string | null;
};

type User = {
    id: number;
    telegramId: string;
    name: string;
    username: string;
    role: string;
    createdAt: string;
    subscriptions: Subscription[];
    profile?: {
        phone: string | null;
        goal: string | null;
        level: string | null;
        age: number | null;
        weight: number | null;
    } | null;
};

type PromoCode = {
    id: number;
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: string | null;
    applicablePlan: string | null;
    isActive: boolean;
    createdAt: string;
};

type Tab = 'users' | 'promo' | 'broadcast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Users tab modals
    const [accessModal, setAccessModal] = useState<User | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('Старт');
    const [selectedDays, setSelectedDays] = useState(30);
    const [messageModal, setMessageModal] = useState<User | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Promo codes tab
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [promoLoading, setPromoLoading] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: '', discountType: 'percent', discountValue: '10',
        maxUses: '', expiresAt: '', applicablePlan: '',
    });
    const [promoCreating, setPromoCreating] = useState(false);
    const [promoError, setPromoError] = useState('');

    // Broadcast tab
    const [broadcastAudience, setBroadcastAudience] = useState('all');
    const [broadcastPlan, setBroadcastPlan] = useState('Старт');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number } | null>(null);

    const router = useRouter();
    const token = () => localStorage.getItem('fitness_token');

    useEffect(() => { fetchUsers(); }, []);
    useEffect(() => { if (activeTab === 'promo') fetchPromoCodes(); }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } });
            if (res.status === 401) { router.push('/dashboard'); return; }
            if (!res.ok) throw new Error('Failed to fetch users');
            setUsers(await res.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPromoCodes = async () => {
        setPromoLoading(true);
        try {
            const res = await fetch('/api/admin/promo-codes', { headers: { Authorization: `Bearer ${token()}` } });
            const data = await res.json();
            setPromoCodes(data.codes || []);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleGrantAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessModal) return;
        try {
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ userId: accessModal.id, plan: selectedPlan, status: 'active', days: selectedDays }),
            });
            if (!res.ok) throw new Error('Failed to update subscription');
            setAccessModal(null);
            fetchUsers();
        } catch {
            alert('Error updating subscription');
        }
    };

    const handleRevokeAccess = async (userId: number, plan: string) => {
        if (!confirm(`Отключить доступ к «${plan}»?`)) return;
        try {
            await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ userId, plan, status: 'inactive', days: 0 }),
            });
            fetchUsers();
        } catch {
            alert('Error revoking subscription');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageModal || !messageText.trim()) return;
        setSendingMessage(true);
        try {
            const res = await fetch('/api/admin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ telegramId: messageModal.telegramId, message: messageText }),
            });
            if (!res.ok) throw new Error();
            setMessageModal(null);
            setMessageText('');
            alert('Сообщение отправлено!');
        } catch {
            alert('Ошибка при отправке сообщения');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoCreating(true);
        setPromoError('');
        try {
            const res = await fetch('/api/admin/promo-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    code: newPromo.code,
                    discountType: newPromo.discountType,
                    discountValue: newPromo.discountValue,
                    maxUses: newPromo.maxUses || null,
                    expiresAt: newPromo.expiresAt || null,
                    applicablePlan: newPromo.applicablePlan || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setPromoError(data.error || 'Ошибка создания'); return; }
            setNewPromo({ code: '', discountType: 'percent', discountValue: '10', maxUses: '', expiresAt: '', applicablePlan: '' });
            fetchPromoCodes();
        } finally {
            setPromoCreating(false);
        }
    };

    const handleTogglePromo = async (id: number, isActive: boolean) => {
        await fetch(`/api/admin/promo-codes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ isActive: !isActive }),
        });
        fetchPromoCodes();
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        if (!confirm('Отправить рассылку? Это действие нельзя отменить.')) return;
        setBroadcasting(true);
        setBroadcastResult(null);
        try {
            const audience = broadcastAudience === 'program' ? `program:${broadcastPlan}` : broadcastAudience;
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ message: broadcastMessage, audience }),
            });
            const data = await res.json();
            setBroadcastResult({ sent: data.sent, failed: data.failed });
        } finally {
            setBroadcasting(false);
        }
    };

    const now = new Date();
    const activeSubCount = users.filter(u =>
        u.subscriptions.some(s => s.status === 'active' && (!s.expiresAt || new Date(s.expiresAt) > now))
    ).length;
    const inactiveCount = users.length - activeSubCount;

    const audienceCount =
        broadcastAudience === 'all' ? users.length
        : broadcastAudience === 'active_subs' ? activeSubCount
        : broadcastAudience === 'inactive' ? inactiveCount
        : users.filter(u => u.subscriptions.some(s => s.plan === broadcastPlan && s.status === 'active' && (!s.expiresAt || new Date(s.expiresAt) > now))).length;

    if (loading) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5" /><span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-serif text-stone-900 leading-none mb-1">Панель Управления</h1>
                    <p className="text-xs text-stone-500">Доступ и управление ученицами</p>
                </div>
                <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100/50 hover:bg-stone-100 px-4 py-2 rounded-xl transition-colors">
                    В дашборд
                </button>
            </header>

            <main className="max-w-5xl mx-auto p-6 mt-4">
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mb-6 w-fit">
                    {([
                        { id: 'users', label: 'Пользователи', icon: <Users className="w-4 h-4" /> },
                        { id: 'promo', label: 'Промокоды', icon: <Tag className="w-4 h-4" /> },
                        { id: 'broadcast', label: 'Рассылка', icon: <Megaphone className="w-4 h-4" /> },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white text-stone-900 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                            }`}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB: USERS ── */}
                {activeTab === 'users' && (
                    <>
                        <div className="mb-6 flex items-center gap-3 w-full bg-white border border-stone-200 rounded-2xl p-3 shadow-sm">
                            <Search className="w-5 h-5 text-stone-400" />
                            <input type="text" placeholder="Поиск по имени или ID..." className="bg-transparent border-none outline-none w-full text-sm placeholder:text-stone-400" />
                        </div>

                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-100">
                                            {['Пользователь', 'Профиль', 'Доступ', 'Управление'].map(h => (
                                                <th key={h} className="px-6 py-5 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {users.map(user => (
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
                                                            {user.profile.phone && <div>📞 {user.profile.phone}</div>}
                                                            {user.profile.goal && <div>🎯 {user.profile.goal}</div>}
                                                            <div className="flex gap-2 mt-1">
                                                                {user.profile.level && <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{user.profile.level}</span>}
                                                                {user.profile.age && <span>{user.profile.age} лет</span>}
                                                                {user.profile.weight && <span>{user.profile.weight} кг</span>}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-stone-400 italic">Нет профиля</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 align-middle">
                                                    {(() => {
                                                        const activeSubs = user.subscriptions.filter(s => s.status === 'active');
                                                        if (!activeSubs.length) return (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500 font-medium text-xs">Нет доступа</span>
                                                        );
                                                        return (
                                                            <div className="flex flex-col gap-1.5">
                                                                {activeSubs.map(sub => (
                                                                    <div key={sub.id} className="flex items-center gap-1.5">
                                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 font-medium text-xs">{sub.plan}</span>
                                                                        <span className="text-[10px] text-stone-400">{sub.expiresAt ? `до ${new Date(sub.expiresAt).toLocaleDateString('ru-RU')}` : '∞'}</span>
                                                                        <button onClick={() => handleRevokeAccess(user.id, sub.plan)} className="p-0.5 text-stone-300 hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-5 align-middle">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button onClick={() => setAccessModal(user)} className="px-4 py-2 text-xs font-medium bg-white border border-stone-200 text-stone-700 rounded-xl hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm">Дать доступ</button>
                                                        <button onClick={() => setMessageModal(user)} className="p-2 text-stone-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Написать"><Send className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB: PROMO CODES ── */}
                {activeTab === 'promo' && (
                    <div className="space-y-6">
                        {/* Create form */}
                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6">
                            <h2 className="text-base font-serif text-stone-900 mb-5">Создать промокод</h2>
                            <form onSubmit={handleCreatePromo} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Код</label>
                                        <input
                                            required
                                            value={newPromo.code}
                                            onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                            placeholder="LOLA20"
                                            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Тариф</label>
                                        <select
                                            value={newPromo.applicablePlan}
                                            onChange={e => setNewPromo(p => ({ ...p, applicablePlan: e.target.value }))}
                                            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                                        >
                                            <option value="">Любой</option>
                                            <option>Старт</option>
                                            <option>Продвинутый</option>
                                            <option>VIP</option>
                                            <option>Питание</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Тип скидки</label>
                                        <div className="flex gap-2">
                                            {[{ v: 'percent', l: '%' }, { v: 'flat', l: 'сум' }].map(({ v, l }) => (
                                                <button
                                                    key={v} type="button"
                                                    onClick={() => setNewPromo(p => ({ ...p, discountType: v }))}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                                        newPromo.discountType === v ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-600'
                                                    }`}
                                                >{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">
                                            Значение {newPromo.discountType === 'percent' ? '(%)' : '(сум)'}
                                        </label>
                                        <input
                                            required type="number" min="1"
                                            value={newPromo.discountValue}
                                            onChange={e => setNewPromo(p => ({ ...p, discountValue: e.target.value }))}
                                            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Макс. использований</label>
                                        <input
                                            type="number" min="1"
                                            value={newPromo.maxUses}
                                            onChange={e => setNewPromo(p => ({ ...p, maxUses: e.target.value }))}
                                            placeholder="Без лимита"
                                            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Срок действия</label>
                                        <input
                                            type="date"
                                            value={newPromo.expiresAt}
                                            onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))}
                                            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                                        />
                                    </div>
                                </div>

                                {promoError && <p className="text-xs text-red-500">{promoError}</p>}

                                <button
                                    type="submit" disabled={promoCreating}
                                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20"
                                >
                                    {promoCreating ? 'Создаём...' : 'Создать промокод'}
                                </button>
                            </form>
                        </div>

                        {/* Promo codes list */}
                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                            {promoLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                                </div>
                            ) : promoCodes.length === 0 ? (
                                <p className="text-sm text-stone-400 text-center py-10">Промокодов пока нет</p>
                            ) : (
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-100">
                                            {['Код', 'Скидка', 'Использований', 'Срок', 'Тариф', 'Статус'].map(h => (
                                                <th key={h} className="px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-widest bg-stone-50/50">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {promoCodes.map(pc => (
                                            <tr key={pc.id} className="hover:bg-stone-50/30 transition-colors">
                                                <td className="px-5 py-4 font-mono font-medium text-stone-900">{pc.code}</td>
                                                <td className="px-5 py-4 text-rose-600 font-semibold">
                                                    {pc.discountType === 'percent' ? `${pc.discountValue}%` : `${pc.discountValue.toLocaleString('ru-RU')} сум`}
                                                </td>
                                                <td className="px-5 py-4 text-stone-500">
                                                    {pc.usedCount}{pc.maxUses ? `/${pc.maxUses}` : ''}
                                                </td>
                                                <td className="px-5 py-4 text-stone-500 text-xs">
                                                    {pc.expiresAt ? new Date(pc.expiresAt).toLocaleDateString('ru-RU') : '∞'}
                                                </td>
                                                <td className="px-5 py-4 text-stone-500 text-xs">{pc.applicablePlan || 'Любой'}</td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={() => handleTogglePromo(pc.id, pc.isActive)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                            pc.isActive
                                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                                        }`}
                                                    >
                                                        {pc.isActive ? 'Активен' : 'Неактивен'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: BROADCAST ── */}
                {activeTab === 'broadcast' && (
                    <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 space-y-6 max-w-lg">
                        <h2 className="text-base font-serif text-stone-900">Рассылка в Telegram</h2>

                        {/* Audience */}
                        <div>
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 block">Аудитория</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { v: 'all', l: 'Все пользователи' },
                                    { v: 'active_subs', l: 'Активные подписки' },
                                    { v: 'inactive', l: 'Без подписки' },
                                    { v: 'program', l: 'По тарифу' },
                                ].map(({ v, l }) => (
                                    <button
                                        key={v} type="button"
                                        onClick={() => setBroadcastAudience(v)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            broadcastAudience === v
                                                ? 'bg-stone-900 text-white'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                    >{l}</button>
                                ))}
                            </div>
                        </div>

                        {broadcastAudience === 'program' && (
                            <div>
                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Тариф</label>
                                <select
                                    value={broadcastPlan}
                                    onChange={e => setBroadcastPlan(e.target.value)}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                                >
                                    <option>Старт</option>
                                    <option>Продвинутый</option>
                                    <option>VIP</option>
                                    <option>Питание</option>
                                </select>
                            </div>
                        )}

                        <div className="text-sm text-stone-500 bg-stone-50 rounded-xl px-4 py-2.5">
                            Получателей: <span className="font-semibold text-stone-900">{audienceCount}</span>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 block">Сообщение</label>
                            <textarea
                                value={broadcastMessage}
                                onChange={e => setBroadcastMessage(e.target.value)}
                                placeholder="Привет! Сегодня особое предложение..."
                                rows={5}
                                className="w-full border border-stone-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                            />
                        </div>

                        <p className="text-xs text-stone-400">Поддерживается HTML-форматирование Telegram: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;</p>

                        {broadcastResult && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm">
                                <p className="font-medium text-emerald-700">Рассылка завершена</p>
                                <p className="text-emerald-600 mt-1">Отправлено: {broadcastResult.sent} · Ошибок: {broadcastResult.failed}</p>
                            </div>
                        )}

                        <button
                            onClick={handleBroadcast}
                            disabled={broadcasting || !broadcastMessage.trim()}
                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                        >
                            <Megaphone className="w-4 h-4" />
                            {broadcasting ? 'Отправляем...' : `Отправить рассылку (${audienceCount})`}
                        </button>
                    </div>
                )}
            </main>

            {/* Grant Access Modal */}
            {accessModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-lg font-serif font-medium text-stone-900">Доступ: {accessModal.name}</h3>
                            <button onClick={() => setAccessModal(null)} className="p-2 bg-stone-100 text-stone-500 hover:text-stone-900 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleGrantAccess} className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Выберите программу</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[{ label: 'Старт', span: false }, { label: 'Продвинутый', span: false }, { label: 'VIP', span: false }, { label: 'Питание', span: true }].map(({ label, span }) => (
                                        <button key={label} type="button" onClick={() => { setSelectedPlan(label); if (label === 'Питание') setSelectedDays(0); }}
                                            className={`p-3 rounded-2xl text-sm font-medium border text-left transition-all relative overflow-hidden ${selectedPlan === label ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'} ${span ? 'col-span-2' : ''}`}>
                                            {label}
                                            {selectedPlan === label && <Check className="w-4 h-4 absolute top-3 right-3 text-rose-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Длительность</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[{ label: '30 дней', value: 30 }, { label: '60 дней', value: 60 }, { label: '90 дней', value: 90 }, { label: 'Пожизненный', value: 0 }].map(({ label, value }) => (
                                        <button key={value} type="button" onClick={() => setSelectedDays(value)}
                                            className={`flex-1 p-2 rounded-xl border text-sm transition-all whitespace-nowrap ${selectedDays === value ? 'bg-stone-900 border-stone-900 text-white font-medium' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium shadow-lg shadow-rose-500/25 transition-all outline-none focus:ring-4 focus:ring-rose-500/20 active:scale-[0.98]">
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
                            <button onClick={() => setMessageModal(null)} className="p-2 bg-stone-100 text-stone-500 hover:text-stone-900 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSendMessage}>
                            <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Напишите тут..." className="w-full h-32 p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 mb-6 resize-none transition-all" required />
                            <button type="submit" disabled={sendingMessage || !messageText.trim()} className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
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
