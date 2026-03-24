'use client';

import { useEffect, useState } from 'react';

export function useTelegramAuth() {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [startParam, setStartParam] = useState<string | null>(null);

    useEffect(() => {
        async function authenticate() {
            try {
                // ────────────────────────────────────────────────
                // PATH 1: Telegram Mini App (in Telegram client)
                // ────────────────────────────────────────────────
                if (typeof window !== 'undefined') {
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const tg = (window as any).Telegram?.WebApp;
                    if (tg?.initData && tg.initData.length > 0) {
                        tg.ready();
                        tg.expand();

                        if (tg.initDataUnsafe?.start_param) {
                            setStartParam(tg.initDataUnsafe.start_param);
                        }

                        const response = await fetch('/api/auth', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ initData: tg.initData }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            setToken(data.token);
                            setUser(data.user);
                            localStorage.setItem('fitness_token', data.token);
                            return;
                        }
                    }
                }

                // ────────────────────────────────────────────────
                // PATH 2: Web Browser — check existing session cookie or localStorage
                // ────────────────────────────────────────────────
                const storedToken = localStorage.getItem('fitness_token');

                const res = await fetch('/api/auth/me', {
                    // Send cookie automatically, plus Authorization header if we have token
                    credentials: 'include',
                    headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
                });

                if (res.ok) {
                    const data = await res.json();
                    setToken(data.token || storedToken);
                    setUser(data.user);
                    if (data.token) localStorage.setItem('fitness_token', data.token);
                    return;
                }

                // No valid session found → unauthenticated (not guest fallback)
                setError('unauthenticated');

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        authenticate();
    }, []);

    return { user, token, error, loading, startParam };
}
