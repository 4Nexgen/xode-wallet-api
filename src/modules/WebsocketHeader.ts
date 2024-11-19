// import { ContractPromise } from '@polkadot/api-contract';
import '@polkadot/api-augment';

export default class WebsocketHeader {
    static handleWebsocket = async (request: any) => {
        try {
            let websocket: string | undefined = request.headers.websocket;
            if (!websocket) {
                this.defaultWebsocket();
                return websocket;
            }

            if (Array.isArray(websocket)) {
                websocket = websocket.join(',');
            }
            
            const mainnetEnv = process.env.MAINNET_WS_PROVIDER_ENDPOINT as string;

            process.env.WS_PROVIDER_ENDPOINT = websocket;
            if (websocket === mainnetEnv || websocket.includes('n7yoxCmcIrCF6VziCcDmYTwL8R03a')) {
                process.env.TRANSFER_ADDRESS = '5Hk3W88P8nP5tXTGZbvuwWcgj9vLk2kUrroaNfbq6nch7Yju'
                this.setEnvAddresses(
                    process.env.MAINNET_ASTROCHIBBI_ADDRESS as string,
                    process.env.MAINNET_ASTRO_ECONOMY_ADDRESS as string,
                    process.env.MAINNET_ASTRO_ENERGY_ADDRESS as string,
                    process.env.MAINNET_FRUITBLITZ_ADDRESS as string,
                    process.env.MAINNET_BLITZ_ECONOMY_ADDRESS as string,
                    process.env.MAINNET_BLITZ_ENERGY_ADDRESS as string,
                );
            } else {
                process.env.TRANSFER_ADDRESS = '5GEWpoRwekYSSohumnMrWnnPf4EFhCFQ4nnk4sJzroJRwbY8'
                this.defaultWebsocket();
            }
        } catch (error: any) {
            return Error(error);
        }
    }

    static defaultWebsocket = async () => {
        try {
            process.env.WS_PROVIDER_ENDPOINT = process.env.TESTNET_WS_PROVIDER_ENDPOINT;
            this.setEnvAddresses(
                process.env.TESTNET_ASTROCHIBBI_ADDRESS as string,
                process.env.TESTNET_ASTRO_ECONOMY_ADDRESS as string,
                process.env.TESTNET_ASTRO_ENERGY_ADDRESS as string,
                process.env.TESTNET_FRUITBLITZ_ADDRESS as string,
                process.env.TESTNET_BLITZ_ECONOMY_ADDRESS as string,
                process.env.TESTNET_BLITZ_ENERGY_ADDRESS as string,
            );
        } catch (error: any) {
            return Error(error);
        }
    }

    static setEnvAddresses = (
        astrochibbiAddress: string,
        astroEconomyAddress: string,
        astroEnergyAddress: string,
        fruitblitzAddress: string,
        fruitblitzEconomyAddress: string,
        fruitblitzEnergyAddress: string,
    ) => {
        process.env.ASTROCHIBBI_ADDRESS = astrochibbiAddress;
        process.env.ASTRO_ECONOMY_ADDRESS = astroEconomyAddress;
        process.env.ASTRO_ENERGY_ADDRESS = astroEnergyAddress;
        process.env.FRUITBLITZ_ADDRESS = fruitblitzAddress;
        process.env.BLITZ_ECONOMY_ADDRESS = fruitblitzEconomyAddress;
        process.env.BLITZ_ENERGY_ADDRESS = fruitblitzEnergyAddress;
    }
}
