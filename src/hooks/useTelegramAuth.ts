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

                // Mock data for local testing outside Telegram
                if (!initData && process.env.NODE_ENV === 'development') {
                    console.warn("Using mock user for local development");
                    initData = "user=" + encodeURIComponent(JSON.stringify({ id: 12345, first_name: "Test", last_name: "User", username: "testuser" })) + "&hash=mocked_hash";
                }

                if (!initData) {
                    // For local development, throw error or use mock data
                    throw new Error('No initData available - Are you running inside Telegram?');
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
