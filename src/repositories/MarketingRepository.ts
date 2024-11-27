import { Keyring } from '@polkadot/api';
import {
	updateAccountData,
	getFeedbackData,
} from '../services/accountService';
import prisma from '../db';
import { PrismaClient } from "@prisma/client";
import extension from "prisma-paginate";
import {
	IReadMarketingWalletsQuery,
	ISendTokenFeedbackBody
} from '../schemas/MarketingSchemas';
import { api } from '../modules/InitializeAPI';
import { WalletResponse } from '../services/accountService';

let processedAccounts = new Set<string>();
let isRunning: boolean = false;

export default class MarketingRepository {
	ownerSeed = process.env.MARKETING_SEED as string;

	static getBlockHash = async () => {
		try {
			if (isRunning) return;
			isRunning = true;
			api.rpc.chain.subscribeNewHeads(async (header) => {
				const blockHash = header.hash;
				const signedBlock = await api.rpc.chain.getBlock(blockHash);
				for (const extrinsic of signedBlock.block.extrinsics) {
					const tx_hash = extrinsic.hash.toHex();
					if (processedAccounts.has(tx_hash)) {
						this.updateBlockHash(tx_hash, blockHash.toString());
						processedAccounts.delete(tx_hash);
					}
				}
			});
		} catch (error) {
			return Error(String(error))
		}
	}

	static async sendTokenRepo(data: WalletResponse[], token: string) {
		console.log('sendTokenRepo function was called');
		const instance = new MarketingRepository();
		try {
			const chainDecimals = api.registry.chainDecimals[0];
			const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
			const owner = keyring.addFromUri(instance.ownerSeed);
			const token_amount = Number(process.env.TOKEN_AMOUNT as string)
			const value = token_amount * 10 ** chainDecimals;
			let nonce = await api.rpc.system.accountNextIndex(owner.address);
			let index = 0;
			while (index < data.length) {
				const batch = data.slice(index, index + 1);
				for (const account of batch) {
					console.log(`Index: ${index} - `, account.wallet_address);
					const tx = api.tx.balances.transferKeepAlive(
						account.wallet_address,
						value
					);
					const [info, result, wallet] = await Promise.all([
						tx.paymentInfo(owner),
						tx.signAndSend(owner, { nonce }),
						updateAccountData(account.wallet_address, token)
					]);
					const unitFactor = 10 ** 12
					const partialFee  = info.partialFee.toString();
					const fee = parseFloat(partialFee) / unitFactor;
					const amount = value / unitFactor;
					if (result) await this.storeMarketingData(
						account.wallet_address,
						account.email_address,
						amount.toFixed(12),
						fee.toFixed(12),
						result.toHex(),
						wallet instanceof Error ? 'XGame' : wallet.games.game_name || 'XGame'
					);
					processedAccounts.add(result.toHex());
				}
				index += 1;
				const newNonce = await api.rpc.system.accountNextIndex(owner.address);
				if (newNonce.gt(nonce)) nonce = newNonce;
			}
			return;
		} catch (error: any) {
			return Error(error || 'sendTokenRepo error occurred.');
		}
	}

	static async sendTokenByFeedbackRepo(data: ISendTokenFeedbackBody, token: string) {
		console.log('sendTokenByFeedbackRepo function was called');
		const instance = new MarketingRepository();
		try {
			const chainDecimals = api.registry.chainDecimals[0];
			const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
			const owner = keyring.addFromUri(instance.ownerSeed);
			const token_amount = Number(process.env.TOKEN_AMOUNT as string)
			const value = token_amount * 10 ** chainDecimals;
			const [nonce, feedback] = await Promise.all([
				api.rpc.system.accountNextIndex(owner.address),
				getFeedbackData(String(data.feedback_id), token)
			]);
			if (
				feedback instanceof Error ||
				feedback.wallet_address != data.address ||
				feedback.status != 'Approve'
			) {
				return Error('Feedback provider does not match or not approved!');
			}
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
				data.address,
				amount.toFixed(12),
				fee.toFixed(12),
				result.toHex(),
				String(data.feedback_id) || 'Feedback'
			)
			return amount;
		} catch (error: any) {
			return Error(error || 'sendTokenByFeedbackRepo error occurred.');
		}
	}

	static storeMarketingData = async (
		wallet: string,
		email: string,
		amount: string,
		fee: string,
		tx_hash: string,
		received_type: string,
	) => {
		try {
			const createdWallet = await prisma.marketing_wallets.create({
				data: {
					wallet_address: wallet,
					email_address: email,
					amount,
					fee,
					tx_hash,
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
					...(query.tx_hash ? [{ tx_hash: query.tx_hash }] : []),
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

	static updateBlockHash = async (
		tx_hash: string,
		block_hash: string,
	) => {
		try {
			const updatedHash = await prisma.marketing_wallets.update({
				where: { tx_hash },
				data: { block_hash },
			});
			return updatedHash;
		} catch (error) {
			throw String(error || 'Unknown error occurred.');
		}
	};
}
