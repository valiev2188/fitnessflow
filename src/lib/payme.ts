/**
 * Payme Merchant API utilities
 * Docs: https://developer.help.paycom.uz/ru/
 *
 * Amounts: Payme uses TIYIN (1 сум = 100 tiyin)
 * Auth:    Basic base64("Paycom:{PAYME_KEY}")
 */

const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID!; // ID кассы
const PAYME_KEY         = process.env.PAYME_KEY!;          // Ключ (prod) or PAYME_TEST_KEY

// ─── Auth ────────────────────────────────────────────────────────────────────

export function verifyPaymeAuth(req: Request): boolean {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Basic ')) return false;
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const expected = `Paycom:${PAYME_KEY}`;
    return decoded === expected;
}

// ─── Amount helpers ───────────────────────────────────────────────────────────

/** Сумы → тийин */
export function sumToTiyin(sum: number): number {
    return sum * 100;
}

/** Тийин → сумы */
export function tiyinToSum(tiyin: number): number {
    return Math.round(tiyin / 100);
}

// ─── JSON-RPC helpers ─────────────────────────────────────────────────────────

export function rpcOk(id: string | number, result: object) {
    return Response.json({ jsonrpc: '2.0', id, result });
}

export function rpcError(id: string | number | null, code: number, message: string, data?: object) {
    return Response.json({
        jsonrpc: '2.0',
        id,
        error: { code, message: { ru: message, uz: message, en: message }, data },
    });
}

// ─── Error codes ──────────────────────────────────────────────────────────────

export const PAYME_ERR = {
    ACCESS_DENIED:               -32504, // неверная авторизация
    INVALID_AMOUNT:              -31001, // неверная сумма
    ORDER_NOT_FOUND:             -31050, // заказ не найден
    ORDER_ALREADY_PAID:          -31051, // заказ уже оплачен
    TRANSACTION_NOT_FOUND:       -31003, // транзакция не найдена
    TRANSACTION_CANCELLED:       -31007, // транзакция уже отменена
    CANNOT_PERFORM_TRANSACTION:  -31008, // невозможно выполнить транзакцию
    CANNOT_CANCEL_TRANSACTION:   -31007, // невозможно отменить (уже выполнена)
} as const;

// ─── Payme transaction states ─────────────────────────────────────────────────

export const PAYME_STATE = {
    CREATED:           1,
    COMPLETED:         2,
    CANCELLED_BEFORE:  -1,
    CANCELLED_AFTER:   -2,
} as const;

// ─── Checkout URL builder ─────────────────────────────────────────────────────

export function buildPaymeUrl(orderId: number, amountSum: number): string {
    const params = {
        m:  PAYME_MERCHANT_ID,
        ac: { order_id: String(orderId) },
        a:  sumToTiyin(amountSum),
        l:  'ru',
    };
    const encoded = Buffer.from(JSON.stringify(params)).toString('base64');
    return `https://checkout.paycom.uz/${encoded}`;
}
