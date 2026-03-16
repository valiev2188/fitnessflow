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
                let initData: string | null = null;

                // Try to get real Telegram initData
                // Wait a moment for the SDK to finish loading
                if (typeof window !== 'undefined') {
                    // Small delay to ensure telegram-web-app.js has initialized
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const tg = (window as any).Telegram?.WebApp;
                    if (tg) {
                        tg.ready();
                        tg.expand(); // Expand to full height
                        if (tg.initData && tg.initData.length > 0) {
                            initData = tg.initData;
                            console.log('✅ Got real Telegram initData');
                        }
                        // Read start_param for deep linking (e.g. startapp=programs)
                        if (tg.initDataUnsafe?.start_param) {
                            setStartParam(tg.initDataUnsafe.start_param);
                        }
                    }
                }

                // Fallback for web browser access (outside Telegram)
                if (!initData) {
                    console.warn("No Telegram initData - using web guest fallback");
                    initData = "user=" + encodeURIComponent(JSON.stringify({
                        id: 99999999,
                        first_name: "Гость",
                        last_name: "",
                        username: "web_guest"
                    })) + "&hash=mocked_hash";
                }

                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ initData }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to authenticate with backend');
                }

                const data = await response.json();
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('fitness_token', data.token);
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

