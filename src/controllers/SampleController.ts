import { FastifyReply, FastifyRequest } from 'fastify';
import SampleRepository from '../repositories/SampleRepository';
import { ApiPromise, WsProvider } from '@polkadot/api';

let api: ApiPromise;

export const sampleController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	console.log('sampleController called');
	try {
		console.log(`Is it connected? ${api}`)
		if (!api) {
			const customRPC = {
				balances: {
					transferKeepAlive: {
						description: 'Custom transferKeepAlive RPC method',
						params: [
							{ name: 'account', type: 'AccountId' },
							{ name: 'amount', type: 'u128' },
							{ name: 'at', type: 'BlockHash', isOptional: true }
						],
						type: 'String'
					}
				}
			}
			const wsProvider = new WsProvider('wss://rpc1.paseo.popnetwork.xyz');
			api = await ApiPromise.create({provider: wsProvider, rpc: customRPC});
		}
		const result = await SampleRepository.sampleRepo(api);
		console.log(result);
	} catch (error: any) {
		reply.status(500).send('Internal Server Error: ' + error);
	}
};