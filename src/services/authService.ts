import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { FastifyRequest } from 'fastify';
import { IMarketinAuthRequestBody } from '../schemas/AuthSchemas';

export async function marketingAuth(
	request: FastifyRequest,
): Promise<boolean | Error> {
    try {
		await cryptoWaitReady();
		const body = request.body as IMarketinAuthRequestBody;
		const seed = process.env.MARKETING_SEED as string;
		const keyring = new Keyring({ type: 'sr25519' });
		const pair = keyring.addFromMnemonic(seed);
		const address = pair.address;
		const { isValid } = signatureVerify(body.message, body.signature, address);
		return isValid;
    } catch (error) {
		console.error(error);
        return false;
    }
}