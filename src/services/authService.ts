import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { FastifyRequest } from 'fastify';
import CryptoJS from 'crypto-js';

export async function marketingAuth(
	request: FastifyRequest,
): Promise<boolean | Error> {
    try {
		await cryptoWaitReady();
		const tokenHeader = request.headers.token as string;
		const token_key = process.env.TOKEN_KEY as string;
		const seed = process.env.MARKETING_SEED as string;
		const decryptedData = JSON.parse(
			CryptoJS.AES.decrypt(tokenHeader, token_key).toString(CryptoJS.enc.Utf8)
		);
		const { signature, message, timestamp } = decryptedData;
		const currentTime = Date.now();
		const miliSecs = 60 * 1000;
		const expiration = (currentTime - parseInt(timestamp, 10)) <= miliSecs;
		if (!expiration) return false;
		const keyring = new Keyring({ type: 'sr25519' });
		const pair = keyring.addFromMnemonic(seed);
		const address = pair.address;
		const { isValid } = signatureVerify(message, signature, address);
		return isValid;
    } catch (error) {
		console.error(error);
        return false;
    }
}