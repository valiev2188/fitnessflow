'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LogOut, Bell, Shield, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, token } = useTelegramAuth();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('fitness_token');
        router.push('/');
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight mb-2">Настройки</h1>
                    <p className="text-stone-500 font-light">Управляйте своим профилем и предпочтениями.</p>
                </div>

                <div className="flex flex-col space-y-6">
                    {/* Profile Section */}
                    <section className="rounded-3xl border border-stone-100 bg-white overflow-hidden shadow-sm shadow-rose-900/5">
                        <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/30">
                            <h2 className="text-lg font-medium text-stone-900">Профиль</h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 text-3xl font-medium border border-rose-100 shadow-sm">
                                    {user?.name?.[0]?.toUpperCase() || 'L'}
                                </div>
                                <div>
                                    <div className="font-medium text-stone-900 text-xl">{user?.name || 'Гость'}</div>
                                    <div className="text-sm font-light text-stone-500 mt-1">ID: {user?.telegramId || 'Не подключено'}</div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-600">Имя пользователя (Telegram)</label>
                                    <div className="rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-stone-900 font-medium">
                                        {user?.username ? `@${user.username}` : 'Не указано'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-600">Тарифный План</label>
                                    <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-rose-700 font-medium">
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span>
                                        Базовый
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section className="rounded-3xl border border-stone-100 bg-white overflow-hidden shadow-sm shadow-rose-900/5">
                        <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/30">
                            <h2 className="text-lg font-medium text-stone-900">Уведомления и Безопасность</h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            <div className="flex items-center justify-between p-6 md:p-8 hover:bg-stone-50/50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 border border-stone-100">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-stone-900">Напоминания</div>
                                        <div className="text-sm font-light text-stone-500 mt-0.5">Получать уведомления о тренировках.</div>
                                    </div>
                                </div>
                                <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-rose-400 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-white shadow-inner">
                                    <span className="inline-block h-5 w-5 translate-x-6 transform rounded-full bg-white transition-transform shadow-sm" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 md:p-8 hover:bg-stone-50/50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 border border-stone-100">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-stone-900">Приватность</div>
                                        <div className="text-sm font-light text-stone-500 mt-0.5">Управление вашими данными.</div>
                                    </div>
                                </div>
                                <button className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 px-4 py-2 rounded-xl">Настроить</button>
                            </div>

                            <div className="flex items-center justify-between p-6 md:p-8 hover:bg-stone-50/50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 border border-stone-100">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-stone-900">Устройства</div>
                                        <div className="text-sm font-light text-stone-500 mt-0.5">Активные сессии веб-приложения.</div>
                                    </div>
                                </div>
                                <button className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 px-4 py-2 rounded-xl">Все</button>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="rounded-3xl border border-rose-100 bg-[#FDFBF7] p-6 md:p-8 mt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-stone-900">Выход</h3>
                                <p className="text-sm text-stone-500 font-light mt-1">Очистить локальные данные сессии.</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-2xl bg-white border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-all shadow-sm active:scale-95"
                            >
                                <LogOut className="h-4 w-4" />
                                Выйти
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
