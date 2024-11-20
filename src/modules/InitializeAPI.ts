import { ApiPromise, WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';

let api_mainnet: ApiPromise;
let api_testnet: ApiPromise;

export let api: ApiPromise;
export default class InitializeAPI {
    static apiInitialization = async () => {
        try {
			const rpc_endpoint = process.env.WS_PROVIDER_ENDPOINT as string;
			console.log(rpc_endpoint);
			if (rpc_endpoint.includes('n7yoxCmcIrCF6VziCcDmYTwL8R03a')) {
				if (!api_mainnet) {
					const client = await this.create_api(rpc_endpoint);
					if (client instanceof Error) return client;
					api_mainnet = client;
				}
				api = api_mainnet;
			} else {
				if (!api_testnet) {
					const client = await this.create_api(rpc_endpoint);
					if (client instanceof Error) return client;
					api_testnet = client;
				}
				api = api_testnet;
			}
        } catch (error: any) {
            return Error('apiInitialization error occurred: ' + error);
        }
    }

	static create_api = async (rpc_endpoint: string): Promise<ApiPromise | Error> => {
		try {
			const wsProvider = new WsProvider(rpc_endpoint, false);
			wsProvider.connect();
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => {
					reject(Error('Websocket connection error'));
				}, 30 * 1000);
			});
			await Promise.race([
				wsProvider.isReady,
				timeoutPromise
			]);
			if (!wsProvider.isConnected) {
				await wsProvider.disconnect();
				return Error('apiInitialization error occurred: ');
			}
			const api = await ApiPromise.create({
				provider: wsProvider
			});
			return api;
		} catch (error: any) {
			return Error(error);
		}
	}
}