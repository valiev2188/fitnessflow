import crypto from 'crypto';

export function validateTelegramInitData(initData: string, botToken: string): boolean {
    if (!initData || !botToken) return false;

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
        return false;
    }

    urlParams.delete('hash');
    const items = Array.from(urlParams.entries());
    items.sort(([a], [b]) => a.localeCompare(b));

    const dataCheckString = items.map(([key, value]) => `${key}=${value}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
}
