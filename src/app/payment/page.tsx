'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, Copy, CheckCircle2, Send, CreditCard } from 'lucide-react';

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get('plan');
    const [copied, setCopied] = useState(false);

    // Humo details
    const humoCard = "8600030457183980";
    const receiverName = "Лола Р.";

    let price = "0";
    let planName = "Неизвестный тариф";

    switch (plan) {
        case 'Легкий старт':
            price = "40$";
            planName = "Легкий старт (21 день)";
            break;
        case 'Продвинутый':
            price = "80$";
            planName = "Продвинутый (с чатом)";
            break;
        case 'Индивидуальный':
            price = "200$";
            planName = "Личное Ведение (офлайн)";
            break;
        default:
            planName = plan || "Неизвестный тариф";
            price = "Уточните в боте";
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(humoCard);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendReceipt = () => {
        const message = encodeURIComponent(`Здравствуйте! Я хочу оплатить тариф "${planName}" за ${price}. Прикрепляю чек об оплате:`);
        window.open(`https://t.me/vvveins?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-rose-200">
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-24">
                <button
                    onClick={() => router.push('/')}
                    className="group flex w-fit items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors mb-12"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Вернуться на главную
                </button>

                <div className="text-center mb-12">
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
                            <div className="text-right">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-1">Сумма к оплате</h3>
                                <div className="text-3xl font-medium text-rose-500">{price}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-rose-400" />
                                Реквизиты для перевода
                            </h3>

                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <p className="text-stone-500 font-light mb-4 text-sm">Переведите точную сумму на карту Humo по указанному номеру.</p>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Получатель</div>
                                        <div className="text-stone-900 font-medium">{receiverName}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Номер Humo</div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl font-mono text-stone-900 font-medium tracking-wider">{humoCard}</div>
                                            <button
                                                onClick={handleCopy}
                                                className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors"
                                                title="Копировать номер"
                                            >
                                                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-stone-900 rounded-3xl p-8 text-center text-white shadow-xl shadow-stone-900/10">
                    <h3 className="text-xl font-serif mb-3">Оплатили? Отлично!</h3>
                    <p className="text-stone-300 font-light mb-8 text-sm max-w-md mx-auto">
                        Сделайте снимок экрана (скриншот) с чеком об оплате и отправьте его администратору в Telegram (@vvveins). Я проверю перевод и открою вам доступ к тренировкам.
                    </p>

                    <button
                        onClick={handleSendReceipt}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-all hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5"
                    >
                        <Send className="w-4 h-4" />
                        Отправить администратору
                    </button>
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
