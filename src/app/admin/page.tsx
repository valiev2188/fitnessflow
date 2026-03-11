'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                router.push('/dashboard'); // Not an admin
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

    const handleUpdateSubscription = async (userId: number, plan: string, status: string) => {
        try {
            const token = localStorage.getItem('fitness_token');
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, plan, status }),
            });
            if (!res.ok) throw new Error('Failed to update subscription');
            // Refresh user list to show changes
            fetchUsers();
        } catch (err) {
            alert('Error updating subscription');
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
            alert('Сообщение успешно отправлено!');
            setMessageModal(null);
            setMessageText('');
        } catch (err) {
            alert('Ошибка при отправке сообщения');
        } finally {
            setSendingMessage(false);
        }
    };

    if (loading) return <div className="p-8 text-stone-500">Загрузка данных...</div>;
    if (error) return <div className="p-8 text-rose-500">Ошибка: {error}</div>;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif text-stone-900">Панель Управления</h1>
                        <p className="text-stone-500 font-light mt-1">Управление доступом учениц</p>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                        Вернуться в Дашборд
                    </button>
                </header>

                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FDFBF7] border-b border-stone-200 text-stone-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Ученица</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Telegram ID</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Текущий тариф</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Управление доступом</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-stone-900">{user.name}</div>
                                            <div className="text-stone-500 font-light text-xs">@{user.username || 'нет_юзернейма'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-stone-500 text-xs">
                                            {user.telegramId}
                                            {user.role === 'admin' && <span className="ml-2 inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-600 text-[10px] uppercase font-bold tracking-widest">Admin</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscription?.status === 'active' ? (
                                                <div>
                                                    <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-medium text-xs mb-1">
                                                        {user.subscription.plan}
                                                    </span>
                                                    <div className="text-[10px] text-stone-400">
                                                        До: {new Date(user.subscription.expiresAt).toLocaleDateString('ru-RU')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-block px-2 py-1 rounded bg-stone-100 text-stone-500 font-medium text-xs">
                                                    Нет доступа (Демо)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleUpdateSubscription(user.id, 'Легкий старт', 'active')}
                                                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                                                >
                                                    Легкий старт
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateSubscription(user.id, 'Продвинутый', 'active')}
                                                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                                                >
                                                    Продвинутый
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateSubscription(user.id, 'Индивидуальный', 'active')}
                                                    className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
                                                >
                                                    Личное Ведение
                                                </button>
                                                <button
                                                    onClick={() => setMessageModal(user)}
                                                    className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Написать
                                                </button>
                                                {user.subscription?.status === 'active' && (
                                                    <button
                                                        onClick={() => handleUpdateSubscription(user.id, 'none', 'inactive')}
                                                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors ml-auto"
                                                    >
                                                        Забрать доступ
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-stone-500 font-light">
                                            Пока нет зарегистрированных учениц.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {messageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-serif text-stone-900 mb-2">Сообщение для {messageModal.name}</h3>
                        <p className="text-sm text-stone-500 font-light mb-6">Это сообщение будет отправлено от лица бота @testfref_bot напрямую в Telegram пользователю.</p>
                        <form onSubmit={handleSendMessage}>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Введите текст сообщения..."
                                className="w-full h-32 p-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 mb-4 resize-none"
                                required
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setMessageModal(null); setMessageText(''); }}
                                    className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingMessage || !messageText.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sendingMessage ? 'Отправка...' : 'Отправить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
