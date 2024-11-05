import { ApiPromise, WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';

export default class InitializeAPI {
    static apiInitialization = async () => {
        try {
            const wsProvider = new WsProvider(process.env.MAINNET_WS_PROVIDER_ENDPOINT as string, false);
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
              types: {
                AccountInfo: 'AccountInfoWithDualRefCount'
              },
              provider: wsProvider
            });
            return api;
        } catch (error: any) {
            return Error('apiInitialization error occurred: ' + error);
        }
    }
}