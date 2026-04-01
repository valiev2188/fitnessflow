'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/dashboard/programs');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6">
            <div className="text-center">
                <div className="text-5xl mb-6">✅</div>
                <h1 className="text-3xl font-serif text-stone-900 mb-3">Оплата принята!</h1>
                <p className="text-stone-500 font-light mb-8">
                    Доступ к тренировкам открывается автоматически.
                    <br />
                    Переходим в личный кабинет...
                </p>
                <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        </div>
    );
}
