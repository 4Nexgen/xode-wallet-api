import axios from 'axios';

const BASE_URL = 'https://product-page-api.xgame.live/auth';

interface WalletResponse {
    wallet_address: string;
}

export async function getAccountData(start?: number, end?: number): Promise<string[] | Error> {
    try {
		const params: { start?: number; end?: number } = {};
        if (start) params.start = start;
        if (end) params.end = end;
        const response = await axios.get<{ data: WalletResponse[] }>(`${BASE_URL}/getWalletAddress`, {
            params,
        });
        return response.data.data.map((account) => account.wallet_address);
    } catch (error: any) {
        return Error(error.message);
    }
}

export async function updateAccountData(wallet: string): Promise<string | Error> {
    try {
        const response = await axios.put<{ message: string }>(`${BASE_URL}/updateWallet/${wallet}`, {
            did_receive: true,
        });
        return response.data.message;
    } catch (error: any) {
        return Error(error.message);
    }
}