import InitializeAPI from '../modules/InitializeAPI';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';
import { updateAccountData } from '../services/accountService';
import prisma from '../db';

export default class MarketingRepository {
	ownerSeed = process.env.ASTROCHIBBI_SEED as string;

	static async sendTokenRepo(data: string[]) {
		console.log('sendTokenRepo function was called');
		const instance = new MarketingRepository();
		var api: any;
		try {
			await cryptoWaitReady();
			api = await InitializeAPI.apiInitialization();
			if (api instanceof Error) {
				return api;
			}
			console.log(process.env.WS_PROVIDER_ENDPOINT as string)
			const chainDecimals = api.registry.chainDecimals[0];
			const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
			const owner = keyring.addFromUri(instance.ownerSeed);
			const value = 0.001 * 10 ** chainDecimals;
			console.log(`Value: ${value}`);
			let nonce = await api.rpc.system.accountNextIndex(owner.address);
			let index = 0;
			while (index < data.length) {
				const batch = data.slice(index, index + 1);
				for (const address of batch) {
					console.log(`Index: ${index} - `, address);
					const tx = api.tx.balances.transferKeepAlive(
						address,
						value
					);
					const [info, result, ] = await Promise.all([
						tx.paymentInfo(owner),
						tx.signAndSend(owner, { nonce }),
						updateAccountData(address)
					])
					const unitFactor = 10 ** 12
					const partialFee  = info.partialFee.toString();
					const fee = parseFloat(partialFee) / unitFactor;
					if (result) await this.storeMarketingData(address, String(value), String(fee.toFixed(12)), result.toHex())
				}
				index += 1;
				const newNonce = await api.rpc.system.accountNextIndex(owner.address);
				if (newNonce.gt(nonce)) nonce = newNonce;
			}
			return;
		} catch (error: any) {
			return Error(error || 'sendTokenRepo error occurred.');
		} finally {
			if (!(api instanceof Error)) {
				await api.disconnect();
			}
		}
	}

	static storeMarketingData = async (
		wallet: string,
		amount: string,
		fee: string,
		hash: string,
	) => {
		try {
			const createdWallet = await prisma.marketing_wallets.create({
				data: {
					wallet_address: wallet,
					amount,
					fee,
					hash,
				},
			});
			return createdWallet;
		} catch (error) {
			throw String(error || 'Unknown error occurred.');
		}
	};
}
