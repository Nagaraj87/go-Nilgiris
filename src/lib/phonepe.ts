import crypto from 'crypto-js';

// Load credentials from environment
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const ENV = process.env.PHONEPE_ENV || 'UAT'; // Default to UAT (Sandbox)

// Determine the correct PhonePe base URL
export const getPhonePeBaseUrl = () => {
    return ENV === 'PROD'
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
};

export const getPhonePeMerchantId = () => MERCHANT_ID;

/**
 * Generates the X-VERIFY checksum required by PhonePe APIs.
 * It takes the Base64 JSON payload and the api endpoint (e.g., "/pg/v1/pay").
 */
export const generateChecksum = (base64Payload: string, apiEndpoint: string) => {
    if (!SALT_KEY) {
        throw new Error('PHONEPE_SALT_KEY is not configured in the environment.');
    }
    const stringToHash = base64Payload + apiEndpoint + SALT_KEY;
    const sha256Hash = crypto.SHA256(stringToHash).toString(crypto.enc.Hex);
    return `${sha256Hash}###${SALT_INDEX}`;
};

/**
 * Verifies the checksum sent back from PhonePe via Server-to-Server callbacks.
 */
export const verifyChecksum = (base64Payload: string, receivedChecksum: string) => {
    if (!SALT_KEY) return false;
    const stringToHash = base64Payload + SALT_KEY;
    const expectedHash = crypto.SHA256(stringToHash).toString(crypto.enc.Hex);
    const expectedChecksum = `${expectedHash}###${SALT_INDEX}`;
    return expectedChecksum === receivedChecksum;
};
