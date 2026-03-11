'use client';

import { useEffect, useState } from 'react';

export function useTelegramAuth() {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function authenticate() {
            try {
                let initData = null;
                if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                    const tg = (window as any).Telegram.WebApp;
                    tg.ready();
                    initData = tg.initData;
                }

                // Fallback for web browser access (outside Telegram)
                // Uses a generic non-admin ID so regular users don't get admin access
                if (!initData) {
                    console.warn("No Telegram initData found - using web demo user");
                    initData = "user=" + encodeURIComponent(JSON.stringify({ id: 99999999, first_name: "Гость", last_name: "", username: "guest_user" })) + "&hash=mocked_hash";
                }

                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ initData }),
                });

                if (!response.ok) {
                    throw new Error('Failed to authenticate with backend');
                }

                const data = await response.json();
                setToken(data.token);
                setUser(data.user);

                // Store in localStorage for subsequent requests
                localStorage.setItem('fitness_token', data.token);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        authenticate();
    }, []);

    return { user, token, error, loading };
}
