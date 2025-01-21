import { signatureVerify } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { FastifyRequest } from 'fastify';
import CryptoJS from 'crypto-js';

export async function marketingAuth(
  request: FastifyRequest
): Promise<boolean | Error> {
  try {
    const tokenHeader = request.headers.token as string;
    const token_key = process.env.TOKEN_KEY as string;
    const seed = process.env.MARKETING_SEED as string;
    const decryptedData = JSON.parse(
      CryptoJS.AES.decrypt(tokenHeader, token_key).toString(CryptoJS.enc.Utf8)
    );
    const { signature, message, timestamp } = decryptedData;
    const currentTime = Date.now();
    const miliSecs = 60 * 1000;
    const expiration = currentTime - parseInt(timestamp, 10) <= miliSecs;
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

export function signMessage(message: string): {
  is_valid: boolean;
  token: string;
} {
  try {
    const seed = process.env.MARKETING_SEED as string;
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromMnemonic(seed);
    const signature = pair.sign(message);
    const is_valid = pair.verify(message, signature, pair.publicKey);
    if (!is_valid) return { is_valid: is_valid, token: '' };
    const token_key = process.env.TOKEN_KEY as string;
    const timestamp = Date.now().toString();
    const token = CryptoJS.AES.encrypt(
      JSON.stringify({ signature, message, timestamp }),
      token_key
    ).toString();
    return { is_valid: is_valid, token: token };
  } catch (error) {
    console.error(error);
    return { is_valid: false, token: '' };
  }
}
