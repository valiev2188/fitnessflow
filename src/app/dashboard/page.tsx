import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-4">
                <h1 className="text-3xl font-serif tracking-tight text-stone-900 mb-6">Ваша Трансформация</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm shadow-rose-900/5 transition-all hover:shadow-md hover:border-rose-100">
                        <h3 className="font-medium text-stone-900">Программы</h3>
                        <p className="text-sm text-stone-500 font-light mt-2">Выберите свой идеальный курс тренировок.</p>
                    </div>
                    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm shadow-rose-900/5 transition-all hover:shadow-md hover:border-rose-100">
                        <h3 className="font-medium text-stone-900">Мои Тренировки</h3>
                        <p className="text-sm text-stone-500 font-light mt-2">Продолжайте путь к идеальному телу.</p>
                    </div>
                    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm shadow-rose-900/5 transition-all hover:shadow-md hover:border-rose-100">
                        <h3 className="font-medium text-stone-900">Прогресс</h3>
                        <p className="text-sm text-stone-500 font-light mt-2">Отслеживайте свои маленькие победы.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
