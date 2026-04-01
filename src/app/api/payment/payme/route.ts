/**
 * Payme Merchant API — single endpoint for all JSON-RPC methods
 * Endpoint (вставить в кабинет Payme): https://fitnessflow-tau.vercel.app/api/payment/payme
 *
 * Methods handled:
 *  CheckPerformTransaction  — validate order before payment
 *  CreateTransaction        — Payme creates a transaction
 *  PerformTransaction       — payment completed, grant access
 *  CancelTransaction        — user/system cancelled
 *  CheckTransaction         — return transaction state
 *  GetStatement             — list transactions in range
 */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import {
    verifyPaymeAuth, rpcOk, rpcError,
    sumToTiyin, tiyinToSum,
    buildPaymeUrl,
    PAYME_ERR, PAYME_STATE,
} from '@/lib/payme';
import { grantSubscription, redeemPromoCode } from '@/lib/subscription';
import { sendPaymentConfirmation } from '@/lib/click';

export async function POST(req: Request) {
    // ── Authorization ──────────────────────────────────────────────────────
    if (!verifyPaymeAuth(req)) {
        return rpcError(null, PAYME_ERR.ACCESS_DENIED, 'Access denied');
    }

    const body = await req.json();
    const { method, params, id } = body;

    switch (method) {
        case 'CheckPerformTransaction':  return checkPerformTransaction(id, params);
        case 'CreateTransaction':        return createTransaction(id, params);
        case 'PerformTransaction':       return performTransaction(id, params);
        case 'CancelTransaction':        return cancelTransaction(id, params);
        case 'CheckTransaction':         return checkTransaction(id, params);
        case 'GetStatement':             return getStatement(id, params);
        default:
            return rpcError(id, -32601, `Unknown method: ${method}`);
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrderId(params: any): number | null {
    const raw = params?.account?.order_id;
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
}

async function loadPayment(orderId: number) {
    return db.select().from(payments).where(eq(payments.id, orderId)).limit(1).then(r => r[0] ?? null);
}

// ─── CheckPerformTransaction ──────────────────────────────────────────────────

async function checkPerformTransaction(id: any, params: any) {
    const orderId = getOrderId(params);
    if (!orderId) return rpcError(id, PAYME_ERR.ORDER_NOT_FOUND, 'Order not found');

    const payment = await loadPayment(orderId);
    if (!payment) return rpcError(id, PAYME_ERR.ORDER_NOT_FOUND, 'Order not found');

    if (payment.status === 'paid') {
        return rpcError(id, PAYME_ERR.ORDER_ALREADY_PAID, 'Order already paid');
    }

    const expectedTiyin = sumToTiyin(payment.finalAmount);
    if (params.amount !== expectedTiyin) {
        return rpcError(id, PAYME_ERR.INVALID_AMOUNT, 'Invalid amount');
    }

    return rpcOk(id, { allow: true });
}

// ─── CreateTransaction ────────────────────────────────────────────────────────

async function createTransaction(id: any, params: any) {
    const orderId = getOrderId(params);
    if (!orderId) return rpcError(id, PAYME_ERR.ORDER_NOT_FOUND, 'Order not found');

    const payment = await loadPayment(orderId);
    if (!payment) return rpcError(id, PAYME_ERR.ORDER_NOT_FOUND, 'Order not found');

    const expectedTiyin = sumToTiyin(payment.finalAmount);
    if (params.amount !== expectedTiyin) {
        return rpcError(id, PAYME_ERR.INVALID_AMOUNT, 'Invalid amount');
    }

    // Already has a Payme transaction for this order?
    if (payment.paymeTransId) {
        if (payment.paymeTransId === params.id) {
            // Same transaction — idempotent
            if (payment.paymeState === PAYME_STATE.CANCELLED_BEFORE ||
                payment.paymeState === PAYME_STATE.CANCELLED_AFTER) {
                return rpcError(id, PAYME_ERR.TRANSACTION_CANCELLED, 'Transaction cancelled');
            }
            return rpcOk(id, {
                create_time: payment.paymeCreateTime,
                transaction:  String(payment.id),
                state:        payment.paymeState,
            });
        }
        // Different transaction — order already in progress
        return rpcError(id, PAYME_ERR.CANNOT_PERFORM_TRANSACTION, 'Another transaction in progress');
    }

    if (payment.status === 'paid') {
        return rpcError(id, PAYME_ERR.ORDER_ALREADY_PAID, 'Order already paid');
    }

    const createTime = params.time ?? Date.now();

    await db.update(payments).set({
        paymeTransId:    params.id,
        paymeState:      PAYME_STATE.CREATED,
        paymeCreateTime: createTime,
        provider:        'payme',
    }).where(eq(payments.id, orderId));

    return rpcOk(id, {
        create_time: createTime,
        transaction:  String(orderId),
        state:        PAYME_STATE.CREATED,
    });
}

// ─── PerformTransaction ───────────────────────────────────────────────────────

async function performTransaction(id: any, params: any) {
    const payment = await db.select().from(payments)
        .where(eq(payments.paymeTransId, params.id))
        .limit(1).then(r => r[0] ?? null);

    if (!payment) return rpcError(id, PAYME_ERR.TRANSACTION_NOT_FOUND, 'Transaction not found');

    if (payment.paymeState === PAYME_STATE.COMPLETED) {
        // Idempotent
        return rpcOk(id, {
            perform_time: payment.paymePerformTime,
            transaction:   String(payment.id),
            state:         PAYME_STATE.COMPLETED,
        });
    }

    if (payment.paymeState !== PAYME_STATE.CREATED) {
        return rpcError(id, PAYME_ERR.CANNOT_PERFORM_TRANSACTION, 'Cannot perform transaction');
    }

    const performTime = Date.now();

    await db.update(payments).set({
        status:           'paid',
        paymeState:       PAYME_STATE.COMPLETED,
        paymePerformTime: performTime,
        paidAt:           new Date(),
    }).where(eq(payments.id, payment.id));

    await grantSubscription(payment.userId, payment.plan);

    if (payment.promoCodeId) {
        await redeemPromoCode(payment.promoCodeId, payment.userId);
    }

    sendPaymentConfirmation(payment.userId, payment.plan, payment.finalAmount)
        .catch(e => console.error('TG notification failed:', e));

    return rpcOk(id, {
        perform_time: performTime,
        transaction:   String(payment.id),
        state:         PAYME_STATE.COMPLETED,
    });
}

// ─── CancelTransaction ────────────────────────────────────────────────────────

async function cancelTransaction(id: any, params: any) {
    const payment = await db.select().from(payments)
        .where(eq(payments.paymeTransId, params.id))
        .limit(1).then(r => r[0] ?? null);

    if (!payment) return rpcError(id, PAYME_ERR.TRANSACTION_NOT_FOUND, 'Transaction not found');

    const cancelTime = Date.now();

    if (payment.paymeState === PAYME_STATE.COMPLETED) {
        // Already completed — cannot cancel (no refund logic here)
        return rpcError(id, PAYME_ERR.CANNOT_CANCEL_TRANSACTION, 'Cannot cancel completed transaction');
    }

    if (payment.paymeState === PAYME_STATE.CANCELLED_BEFORE ||
        payment.paymeState === PAYME_STATE.CANCELLED_AFTER) {
        // Idempotent
        return rpcOk(id, {
            cancel_time: payment.paymeCancelTime,
            transaction:  String(payment.id),
            state:        payment.paymeState,
        });
    }

    const newState = payment.paymeState === PAYME_STATE.CREATED
        ? PAYME_STATE.CANCELLED_BEFORE
        : PAYME_STATE.CANCELLED_AFTER;

    await db.update(payments).set({
        status:            'failed',
        paymeState:        newState,
        paymeCancelTime:   cancelTime,
        paymeCancelReason: params.reason ?? 0,
    }).where(eq(payments.id, payment.id));

    return rpcOk(id, {
        cancel_time: cancelTime,
        transaction:  String(payment.id),
        state:        newState,
    });
}

// ─── CheckTransaction ─────────────────────────────────────────────────────────

async function checkTransaction(id: any, params: any) {
    const payment = await db.select().from(payments)
        .where(eq(payments.paymeTransId, params.id))
        .limit(1).then(r => r[0] ?? null);

    if (!payment) return rpcError(id, PAYME_ERR.TRANSACTION_NOT_FOUND, 'Transaction not found');

    return rpcOk(id, {
        create_time:  payment.paymeCreateTime,
        perform_time: payment.paymePerformTime ?? 0,
        cancel_time:  payment.paymeCancelTime  ?? 0,
        transaction:  String(payment.id),
        state:        payment.paymeState,
        reason:       payment.paymeCancelReason ?? null,
    });
}

// ─── GetStatement ─────────────────────────────────────────────────────────────

async function getStatement(id: any, params: any) {
    const { from, to } = params;

    const rows = await db.select().from(payments).where(
        and(
            gte(payments.paymeCreateTime, from),
            lte(payments.paymeCreateTime, to),
        )
    );

    const transactions = rows
        .filter(p => p.paymeTransId)
        .map(p => ({
            id:           p.paymeTransId,
            time:         p.paymeCreateTime,
            amount:       sumToTiyin(p.finalAmount),
            account:      { order_id: String(p.id) },
            create_time:  p.paymeCreateTime,
            perform_time: p.paymePerformTime ?? 0,
            cancel_time:  p.paymeCancelTime  ?? 0,
            transaction:  String(p.id),
            state:        p.paymeState,
            reason:       p.paymeCancelReason ?? null,
        }));

    return rpcOk(id, { transactions });
}
