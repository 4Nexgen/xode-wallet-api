import { FastifyReply, FastifyRequest } from 'fastify';
import {
  IMintRequestBody,
  ITransferRequestBody,
  IBurnRequestBody,
  IBalanceOfRequestParams,
  IAirdropAssetRequestBody,
} from '../schemas/AssetSchemas';
import AzkalRepository from '../repositories/AzkalRepository';
import XaverRepository from '../repositories/XaverRepository';
import XGameRepository from '../repositories/XGameRepository';
import ChainRepository from '../repositories/ChainRepository';
import WebsocketHeader from '../modules/WebsocketHeader';
import WalletRepository from '../repositories/WalletRepository';
import InitializeAPI from '../modules/InitializeAPI';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import IXONRepository from '../repositories/IXONRepository';

export const mintController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as IMintRequestBody;
    if (
      !requestBody || 
      !requestBody.to ||
      !requestBody.value
    ) {
      return reply.badRequest("Invalid request body. Required fields: 'to', 'value'");
    }
    let result;
    if (request.url.includes("azk")) {
      result = await AzkalRepository.mintRepo(requestBody);
    } else if (request.url.includes("xav")) {
      result = await XaverRepository.mintRepo(requestBody);
    } else if (request.url.includes("xgm")) {
      result = await XGameRepository.mintRepo(requestBody);
    } else if (request.url.includes("ixon")) {
      result = await IXONRepository.mintRepo(requestBody);
    }
    
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const transferController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as ITransferRequestBody;
    if (
      !requestBody || 
      !requestBody.target ||
      !requestBody.value
    ) {
      return reply.badRequest("Invalid request body.");
    }
    let result;
    if (request.url.includes("azk")) {
      result = await AzkalRepository.transferRepo(requestBody);
    } else if (request.url.includes("xav")) {
      result = await XaverRepository.transferRepo(requestBody);
    } else if (request.url.includes("xgm")) {
      result = await XGameRepository.transferRepo(requestBody);
    } else if (request.url.includes("ixon")) {
      result = await IXONRepository.transferRepo(requestBody);
    }

    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const burnController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as IBurnRequestBody;
    if (
      !requestBody || 
      !requestBody.from ||
      !requestBody.value
    ) {
      return reply.badRequest("Invalid request body. Required fields: 'to', 'value'");
    }
    let result;
    if (request.url.includes("azk")) {
      result = await AzkalRepository.burnRepo(requestBody);
    } else if (request.url.includes("xav")) {
      result = await XaverRepository.burnRepo(requestBody);
    } else if (request.url.includes("xgm")) {
      result = await XGameRepository.burnRepo(requestBody);
    } else if (request.url.includes("ixon")) {
      result = await IXONRepository.burnRepo(requestBody);
    }
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const totalSupplyController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const result = await AzkalRepository.totalSupplyRepo();
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    console.error(`totalSupplyController: error trying to transfer balance: ${error}`);
    reply.status(500).send('Internal Server Error');
  }
};


export const balanceOfController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  var api: any;
  try {
    WebsocketHeader.handleWebsocket(request);
    await cryptoWaitReady();
    api = await InitializeAPI.apiInitialization();
    if (api instanceof Error) {
      throw api;
    }
    const requestParams = request.params as IBalanceOfRequestParams;
    if (!requestParams || !requestParams.account) {
      return reply.badRequest("Invalid request parameter. Required fields: 'account'");
    }
    const result = await AzkalRepository.balanceOfRepo(api, requestParams.account);
    if (result instanceof Error) {
      throw result;
    }
    console.log('azk',result)
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  } finally {
    if (!(api instanceof Error)) {
      await api.disconnect();
    }
  }
};

export const airdropController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const query: any = request.query;
    let { account }: { account: string[] } = request.body as IAirdropAssetRequestBody;
    let wallets: any[] = [];
    if (!Array.isArray(account)) {
      account = [];
    }
    if (query.created_at !== undefined || query.start !== undefined) {
      wallets = await WalletRepository.getWallets(query);
      wallets.forEach(wallet => {
        account.push(wallet.wallet_address);
      });
    }
    account = Array.from(new Set(account));
    if (Array.isArray(account) && account.length <= 0) {
      return reply.badRequest("Invalid request body. Required field at least one 'account'");
    }
    let result;
    if (request.url.includes("azk")) {
      result = await AzkalRepository.airdropAZKRepo(account);
    } else if (request.url.includes("xgm")) {
      result = await XGameRepository.airdropXGMRepo(account);
    } else if (request.url.includes("ixon")) {
      result = await IXONRepository.airdropIXONRepo(account);
    } else if (request.url.includes("chain")) {
      result = await ChainRepository.airdropXONRepo(account);
    }
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};