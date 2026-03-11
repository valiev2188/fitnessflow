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

                // Fallback for testing outside Telegram (e.g. browser)
                if (!initData) {
                    console.warn("Using mock user for web testing");
                    // Using the admin's ID for mock testing to grant admin access
                    initData = "user=" + encodeURIComponent(JSON.stringify({ id: 5369141852, first_name: "Web", last_name: "User", username: "webuser" })) + "&hash=mocked_hash";
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
