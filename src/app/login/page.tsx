'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionUrl, setSessionUrl] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<'pending' | 'success' | 'rejected'>('pending');

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        async function initAuth() {
            try {
                // Check if already logged in via cookie/me
                const meRes = await fetch('/api/auth/me', { credentials: 'include' });
                if (meRes.ok) {
                    router.replace('/dashboard');
                    return;
                }

                // Request new login session
                const res = await fetch('/api/auth/session', { method: 'POST' });
                const data = await res.json();
                
                if (data.sessionId) {
                    const botName = process.env.NEXT_PUBLIC_BOT_USERNAME || 'testfref_bot';
                    setSessionUrl(`https://t.me/${botName}?start=login_${data.sessionId}`);
                    setLoading(false);

                    // Start polling
                    pollInterval = setInterval(async () => {
                        try {
                            const pollRes = await fetch(`/api/auth/poll?session=${data.sessionId}`);
                            const pollData = await pollRes.json();
                            
                            if (pollData.status === 'approved' && pollData.token) {
                                clearInterval(pollInterval);
                                setPollingStatus('success');
                                localStorage.setItem('fitness_token', pollData.token);
                                router.replace('/dashboard');
                            } else if (pollData.status === 'rejected' || pollData.error === 'Invalid session') {
                                clearInterval(pollInterval);
                                setPollingStatus('rejected');
                                setError('Авторизация отменена или устарела. Обновите страницу.');
                            }
                        } catch (e) {
                            // ignore poll errors
                        }
                    }, 2500);
                } else {
                    setError('Не удалось инициализировать сессию');
                    setLoading(false);
                }
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        initAuth();

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ background: '#FDFBF7', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            <a href="/" className="mb-12 text-[22px] font-medium tracking-wide" style={{ color: '#1A1A1A', textDecoration: 'none' }}>
                Lola<span style={{ color: '#C69377', fontStyle: 'italic' }}>Fitness</span>
            </a>

            <div style={{
                background: '#fff',
                borderRadius: 28,
                padding: '48px 40px',
                maxWidth: 400,
                width: '100%',
                boxShadow: '0 12px 60px rgba(26,26,26,0.08)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>🤍</div>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
                    Войти в аккаунт
                </h1>
                
                {pollingStatus === 'success' ? (
                     <div style={{ padding: '32px 0' }}>
                         <p style={{ color: '#4CAF50', fontSize: 18, fontWeight: 500 }}>Успешно!</p>
                         <p style={{ fontSize: 14, color: '#7A7169', marginTop: 8 }}>Перенаправляем в кабинет...</p>
                     </div>
                ) : (
                <>
                    <p style={{ fontSize: 15, color: '#7A7169', lineHeight: 1.6, marginBottom: 32 }}>
                        Для входа на сайт, перейдите в нашего Telegram-бота и подтвердите авторизацию.
                    </p>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                            <div style={{
                                width: 32, height: 32,
                                border: '3px solid #E5DDD5',
                                borderTopColor: '#C69377',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <div>
                            {sessionUrl && pollingStatus === 'pending' && (
                                <a 
                                    href={sessionUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: '#2AABEE',
                                        color: '#fff',
                                        padding: '16px 24px',
                                        borderRadius: '100px',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        fontSize: 16,
                                        width: '100%',
                                        boxShadow: '0 4px 14px rgba(42,171,238,0.4)',
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.1406 2.85938C21.8438 3.09375 22.0312 4.07812 21.4688 4.64062L17.5781 21.0469C17.3906 21.8438 16.4062 22.1719 15.75 21.6562L11.5312 18.2812L8.25 21.5625C7.96875 21.8438 7.5 21.6562 7.5 21.2344V17.0625L19.4531 6.1875L5.4375 16.0312L2.0625 14.8594C1.3125 14.5781 1.26562 13.5 1.96875 13.1719L21.1406 2.85938Z" fill="currentColor"/>
                                    </svg>
                                    Перейти в Telegram
                                </a>
                            )}
                            {pollingStatus === 'pending' && !error && (
                                <div style={{ fontSize: 13, color: '#A09A93', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <div style={{ width: 14, height: 14, border: '2px solid #E5DDD5', borderTopColor: '#C69377', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }}></div>
                                    Ожидаем подтверждения...
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <p style={{
                            marginTop: 16,
                            fontSize: 13,
                            color: '#e05858',
                            background: '#fff0f0',
                            padding: '12px 16px',
                            borderRadius: 12,
                            border: '1px solid #fcd',
                        }}>
                            ⚠️ {error}
                        </p>
                    )}
                </>
                )}
            </div>

            <a href="/" style={{ marginTop: 24, fontSize: 13, color: '#B0A89E', textDecoration: 'none' }}>
                ← Вернуться на главную
            </a>
        </div>
    );
}
