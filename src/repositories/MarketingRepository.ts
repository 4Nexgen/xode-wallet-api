import InitializeAPI from '../modules/InitializeAPI';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';
import { updateAccountData } from '../services/accountService';
import prisma from '../db';
import { PrismaClient } from "@prisma/client";
import extension from "prisma-paginate";
import {
	IReadMarketingWalletsQuery,
	ISendTokenFeedbackBody
} from '../schemas/MarketingSchemas';

export default class MarketingRepository {
	ownerSeed = process.env.MARKETING_SEED as string;

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
			const chainDecimals = api.registry.chainDecimals[0];
			const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
			const owner = keyring.addFromUri(instance.ownerSeed);
			const value = 1 * 10 ** chainDecimals;
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
					const amount = value / unitFactor;
					if (result) await this.storeMarketingData(
						address,
						amount.toFixed(12),
						fee.toFixed(12),
						result.toHex(),
						"Game"
					)
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

	static async sendTokenByFeedbackRepo(data: ISendTokenFeedbackBody) {
		console.log('sendTokenByFeedbackRepo function was called');
		const instance = new MarketingRepository();
		var api: any;
		try {
			await cryptoWaitReady();
			api = await InitializeAPI.apiInitialization();
			if (api instanceof Error) {
				return api;
			}
			const chainDecimals = api.registry.chainDecimals[0];
			const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
			const owner = keyring.addFromUri(instance.ownerSeed);
			const value = 1 * 10 ** chainDecimals;
			let nonce = await api.rpc.system.accountNextIndex(owner.address);
			const tx = api.tx.balances.transferKeepAlive(
				data.address,
				value
			);
			const [info, result] = await Promise.all([
				tx.paymentInfo(owner),
				tx.signAndSend(owner, { nonce }),
			])
			const unitFactor = 10 ** 12
			const partialFee  = info.partialFee.toString();
			const fee = parseFloat(partialFee) / unitFactor;
			const amount = value / unitFactor;
			if (result) await this.storeMarketingData(
				data.address,
				amount.toFixed(12),
				fee.toFixed(12),
				result.toHex(),
				"Feedback"
			)
			return amount;
		} catch (error: any) {
			return Error(error || 'sendTokenByFeedbackRepo error occurred.');
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
		received_type: string,
	) => {
		try {
			const createdWallet = await prisma.marketing_wallets.create({
				data: {
					wallet_address: wallet,
					amount,
					fee,
					hash,
					received_type,
				},
			});
			return createdWallet;
		} catch (error) {
			throw String(error || 'Unknown error occurred.');
		}
	};

	static getMarketWallets = async (query: Partial<IReadMarketingWalletsQuery>) => {
		try {
			const validQuery = {
				AND: [
					...(query.wallet ? [{ wallet: query.wallet }] : []),
					...(query.amount ? [{ amount: query.amount }] : []),
					...(query.fee ? [{ fee: query.fee }] : []),
					...(query.hash ? [{ hash: query.hash }] : []),
					...(query.received_type ? [{ received_type: query.received_type }] : []),
					...(query.date_start ? [{ date: { gte: new Date(query.date_start) } }] : []),
					...(query.date_end ? [{ date: { lte: new Date(query.date_end) } }] : []),
				],
			};
			const prisma = new PrismaClient();
			const xprisma = prisma.$extends(extension);
			const [sums, result] = await Promise.all([
				prisma.marketing_wallets.aggregate({
					_sum: {
					  amount: true,
					  fee: true,
					},
				}),
				xprisma.marketing_wallets.paginate(
					{
						where: validQuery,
						orderBy: {
							id: 'desc',
						},
					},
					{
						limit: Number(query.entry),
						page: Number(query.page),
					}
				)
			]);
			return { ...result, sums };
		} catch (error: any) {
			return Error(error);
		}
	};
}
