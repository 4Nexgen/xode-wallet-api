import axios from 'axios';

const BASE_URL = 'https://product-page-api.xgame.live';

interface WalletResponse {
    wallet_address: string;
}

interface UpdateResponse {
	id: number;
	wallet_address: string;
	category: string;
	did_receive: boolean;
	game_id: number;
	created_at: string;
	updated_at: string;
	games: { game_name: string };
}

interface FeedbackResponse {
	id: number;
  	wallet_address: String;
  	status: String;
}

export async function getAccountData(start?: number, end?: number): Promise<string[] | Error> {
    try {
		const params: { start?: number; end?: number } = {};
        if (start) params.start = start;
        if (end) params.end = end;
        const response = await axios.get<{ data: WalletResponse[] }>(
			`${BASE_URL}/auth/getWalletAddress`,
			{ params }
		);
        return response.data.data.map((account) => account.wallet_address);
    } catch (error: any) {
        return Error(error.message);
    }
}

export async function updateAccountData(wallet: string): Promise<UpdateResponse | Error> {
    try {
        const response = await axios.put<{ data: UpdateResponse }>(
			`${BASE_URL}/auth/updateWallet/${wallet}`,
			{ did_receive: true }
		);
        return response.data.data;
    } catch (error: any) {
        return Error(error.message);
    }
}

export async function getFeedbackData(id: string, token: string): Promise<FeedbackResponse | Error> {
    try {
        const response = await axios.get<{ data: FeedbackResponse }>(
            `${BASE_URL}/feed_back/getFeedBack/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.data;
    } catch (error: any) {
        return Error(error.message);
    }
}