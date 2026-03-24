'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        onTelegramWidgetAuth: (user: any) => void;
    }
}

export default function LoginPage() {
    const router = useRouter();
    const widgetRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if already logged in
        fetch('/api/auth/me', { credentials: 'include' }).then(res => {
            if (res.ok) router.replace('/dashboard');
        });

        // Attach Telegram widget callback to window
        window.onTelegramWidgetAuth = async (telegramData: any) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/auth/telegram-widget', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ telegramData }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Auth failed');

                // Save token for API calls from dashboard
                localStorage.setItem('fitness_token', data.token);
                router.replace('/dashboard');
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        // Dynamically inject Telegram widget script
        if (widgetRef.current && !widgetRef.current.querySelector('script')) {
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_BOT_USERNAME || 'testfref_bot');
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-radius', '14');
            script.setAttribute('data-onauth', 'onTelegramWidgetAuth(user)');
            script.setAttribute('data-request-access', 'write');
            script.async = true;
            widgetRef.current.appendChild(script);
        }
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ background: '#FDFBF7', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Logo */}
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
                <p style={{ fontSize: 15, color: '#7A7169', lineHeight: 1.6, marginBottom: 32 }}>
                    Нажмите кнопку ниже и авторизуйтесь через ваш Telegram-аккаунт.
                    Тот же аккаунт, что используется в боте — единый доступ везде.
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
                    <div ref={widgetRef} style={{ display: 'flex', justifyContent: 'center' }} />
                )}

                {error && (
                    <p style={{
                        marginTop: 16,
                        fontSize: 13,
                        color: '#e05858',
                        background: '#fff0f0',
                        padding: '10px 16px',
                        borderRadius: 12,
                        border: '1px solid #fcd',
                    }}>
                        ⚠️ {error}
                    </p>
                )}

                <p style={{ marginTop: 28, fontSize: 12, color: '#B0A89E' }}>
                    После входа ваш доступ синхронизируется между телефоном и ноутбуком.
                </p>
            </div>

            <a href="/" style={{ marginTop: 24, fontSize: 13, color: '#B0A89E', textDecoration: 'none' }}>
                ← Вернуться на главную
            </a>
        </div>
    );
}
