'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Tag, X } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

function fmt(n: number) {
    return n.toLocaleString('ru-RU') + ' сум';
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get('plan') || '';
    const { token } = useTelegramAuth();

    const [basePrice, setBasePrice] = useState<number | null>(null);
    const [planName, setPlanName] = useState(plan || 'Неизвестный тариф');
    const [priceLoading, setPriceLoading] = useState(true);

    const [promoInput, setPromoInput] = useState('');
    const [promoApplying, setPromoApplying] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        discountedPrice: number;
        originalPrice: number;
        discountType: string;
        discountValue: number;
    } | null>(null);

    // Fetch price from DB — single source of truth
    useEffect(() => {
        if (!plan) { setPriceLoading(false); return; }
        fetch('/api/programs')
            .then(r => r.json())
            .then(data => {
                const prog = (data.programs || []).find((p: any) => p.title === plan);
                if (prog) {
                    setBasePrice(prog.price);
                    setPlanName(`${prog.title} (${prog.durationDays} дней)`);
                }
            })
            .catch(() => {})
            .finally(() => setPriceLoading(false));
    }, [plan]);

    const displayPrice = appliedPromo ? appliedPromo.discountedPrice : basePrice;
    const displayOldPrice = appliedPromo ? basePrice : null;

    const [payingWith, setPayingWith] = useState<'click' | 'payme' | null>(null);
    const [orderError, setOrderError] = useState('');

    const createOrder = async (): Promise<{ clickUrl: string; paymeUrl: string } | null> => {
        if (!token) { setOrderError('Необходимо войти через Telegram'); return null; }
        setOrderError('');
        const res = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ plan, promoCode: appliedPromo?.code ?? null }),
        });
        const data = await res.json();
        if (!res.ok) { setOrderError(data.error || 'Ошибка создания заказа'); return null; }
        return data;
    };

    const handlePayWithClick = async () => {
        setPayingWith('click');
        try {
            const order = await createOrder();
            if (order) window.location.href = order.clickUrl;
        } catch { setOrderError('Ошибка соединения. Попробуйте снова.'); }
        finally { setPayingWith(null); }
    };

    const handlePayWithPayme = async () => {
        setPayingWith('payme');
        try {
            const order = await createOrder();
            if (order) window.location.href = order.paymeUrl;
        } catch { setOrderError('Ошибка соединения. Попробуйте снова.'); }
        finally { setPayingWith(null); }
    };

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setPromoApplying(true);
        setPromoError('');
        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ code: promoInput.trim(), plan }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedPromo({
                    code: promoInput.trim().toUpperCase(),
                    discountedPrice: data.discountedPrice,
                    originalPrice: data.originalPrice,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                });
                setPromoInput('');
            } else {
                setPromoError(data.message || 'Промокод недействителен');
            }
        } catch {
            setPromoError('Ошибка проверки промокода');
        } finally {
            setPromoApplying(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoError('');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-rose-200">
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
                <button
                    onClick={() => router.push('/')}
                    className="group flex w-fit items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors mb-10"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Вернуться на главную
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-6 animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Скидка -30% действует сегодня!
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 tracking-tight mb-4">Оформление доступа</h1>
                    <p className="text-stone-500 font-light text-lg">Вы выбрали потрясающий путь к трансформации.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm mb-8 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full opacity-50 -z-0 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-stone-100 pb-8">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-1">Ваш тариф</h3>
                                <div className="text-2xl font-serif text-stone-900">{planName}</div>
                            </div>
                            <div className="text-left md:text-right">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-1">Сумма к оплате</h3>
                                <div className="flex items-end md:justify-end gap-3">
                                    {displayOldPrice && (
                                        <div className="text-xl font-medium text-stone-300 line-through mb-1">{fmt(displayOldPrice)}</div>
                                    )}
                                    <div className="text-4xl font-semibold text-rose-500">
                                        {priceLoading
                                            ? <span className="inline-block w-8 h-8 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                                            : displayPrice ? fmt(displayPrice) : '—'
                                        }
                                    </div>
                                </div>
                                {appliedPromo && (
                                    <div className="flex items-center gap-1 mt-1 md:justify-end">
                                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                            {appliedPromo.code} — скидка {appliedPromo.discountType === 'percent' ? `${appliedPromo.discountValue}%` : fmt(appliedPromo.discountValue)}
                                        </span>
                                        <button onClick={handleRemovePromo} className="text-stone-400 hover:text-stone-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Promo code field */}
                        {!priceLoading && basePrice && !appliedPromo && (
                            <div className="mb-6">
                                <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 block">
                                    <Tag className="w-3 h-3 inline mr-1" />
                                    Промокод
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                        placeholder="ВВЕДИТЕ ПРОМОКОД"
                                        className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-mono uppercase tracking-wider text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={!promoInput.trim() || promoApplying}
                                        className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
                                    >
                                        {promoApplying ? '...' : 'Применить'}
                                    </button>
                                </div>
                                {promoError && (
                                    <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                <div className="bg-stone-900 rounded-3xl p-8 text-center text-white shadow-xl shadow-stone-900/10 mb-12">
                    <h3 className="text-xl font-serif mb-3">Оплатите через Click</h3>
                    <p className="text-stone-300 font-light mb-8 text-sm max-w-md mx-auto">
                        Нажмите кнопку ниже — вы будете перенаправлены на защищённую страницу оплаты Click.
                        После успешной оплаты доступ к тренировкам откроется автоматически.
                    </p>

                    {orderError && (
                        <p className="text-red-400 text-sm mb-4">{orderError}</p>
                    )}

                    <button
                        onClick={handlePayWithClick}
                        disabled={creatingOrder || priceLoading || !basePrice}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-full font-medium transition-all hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5"
                    >
                        <CreditCard className="w-4 h-4" />
                        {creatingOrder ? 'Создаём заказ...' : `Оплатить ${displayPrice ? fmt(displayPrice) : ''} через Click`}
                    </button>
                </div>

                {/* Testimonials */}
                <div className="pt-8 border-t border-stone-200">
                    <h3 className="text-2xl font-serif text-stone-900 text-center mb-8">Что говорят девочки</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                            </div>
                            <p className="text-stone-600 font-light italic mb-4">
                                «Лола, это лучшее решение! С курсом Старт я наконец-то начала двигаться без боли в спине. Тренировки очень бережные, всем советую!»
                            </p>
                            <p className="text-sm font-medium text-stone-900">— Малика Т.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                            </div>
                            <p className="text-stone-600 font-light italic mb-4">
                                «Я никогда не любила спорт, но на Продвинутом прям втянулась. Всё очень понятно, Лола объясняет каждую мелочь. Чувствую себя потрясающе!»
                            </p>
                            <p className="text-sm font-medium text-stone-900">— Диана А.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
