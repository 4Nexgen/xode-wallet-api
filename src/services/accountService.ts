import axios from 'axios';
import { signMessage } from './authService';

const BASE_URL = process.env.XGAME_API;

export interface WalletResponse {
  wallet_address: string;
  emails: { email_address: string };
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
  wallets: { wallet_address: string };
  status: String;
}

export async function getAccountData(
  token: string,
  start?: number,
  end?: number
): Promise<WalletResponse[] | Error> {
  const result = signMessage('marketing');
  if (!result.is_valid) return Error('Invalid signature.');
  try {
    const params: {
      start?: number;
      end?: number;
      did_receive?: boolean;
      verified?: boolean;
    } = {};
    if (start !== undefined) params.start = start;
    if (end !== undefined) params.end = end;
    params.did_receive = false;
    params.verified = true;
    const response = await axios.get<{ result: WalletResponse[] }>(
      `${BASE_URL}/wallets`,
      {
        params,
        headers: {
          // Authorization: `Bearer ${token}`,
          Token: result.token,
        },
      }
    );
    return response.data.result;
  } catch (error: any) {
    return Error(error.message);
  }
}

export async function updateAccountData(
  wallet: string,
  token: string
): Promise<UpdateResponse | Error> {
  const result = await signMessage('marketing');
  if (!result.is_valid) return Error('Invalid signature.');
  try {
    const response = await axios.put<{ data: UpdateResponse }>(
      `${BASE_URL}/wallets/${wallet}`,
      { did_receive: true },
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          Token: result.token,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    return Error(error.message);
  }
}

export async function getFeedbackData(
  id: string,
  token: string
): Promise<FeedbackResponse | Error> {
  const result = await signMessage('marketing');
  if (!result.is_valid) return Error('Invalid signature.');
  try {
    const response = await axios.get<FeedbackResponse>(
      `${BASE_URL}/feedbacks/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Token: result.token,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return Error(error.message);
  }
}

export async function emailtokenReceiver(
  email: string,
  token: string
): Promise<{} | Error> {
  try {
    const response = await axios.post<{ data: {} }>(
      `${BASE_URL}/emails/email-token-receiver`,
      { email },
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

interface TokenTransaction {
  sender_wallet_address: string;
  receiver_wallet_address: string;
  email_address: string;
  airdrop: string;
  gas_fee: string;
  tx_hash: string;
  block_hash: string;
  received_type: string;
}

export async function storeTokenTransaction(
  sender_wallet_address: string,
  receiver_wallet_address: string,
  email_address: string,
  airdrop: string,
  gas_fee: string,
  tx_hash: string,
  received_type: string
): Promise<{} | Error> {
  const result = signMessage('marketing');
  if (!result.is_valid) return Error('Invalid signature.');
  const data: TokenTransaction = {
    sender_wallet_address,
    receiver_wallet_address,
    email_address,
    airdrop,
    gas_fee,
    tx_hash,
    block_hash: '',
    received_type,
  };
  try {
    const response = await axios.post<{ data: {} }>(
      `${BASE_URL}/token-transactions`,
      data,
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          Token: result.token,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    return Error(error.message);
  }
}

export async function updateTokenTransaction(
  tx_hash: string,
  block_hash: string
): Promise<{} | Error> {
  const result = signMessage('marketing');
  if (!result.is_valid) return Error('Invalid signature.');
  try {
    const response = await axios.put<{ data: {} }>(
      `${BASE_URL}/token-transactions/${tx_hash}`,
      { block_hash },
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          Token: result.token,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    return Error(error.message);
  }
}
