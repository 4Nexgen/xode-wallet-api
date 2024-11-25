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
import WalletRepository from '../repositories/WalletRepository';
import IXONRepository from '../repositories/IXONRepository';
import IXAVRepository from '../repositories/IXAVRepository';

export const mintController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
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
    } else if (request.url.includes("ixav")) {
      result = await IXAVRepository.mintRepo(requestBody);
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
    } else if (request.url.includes("ixav")) {
      result = await IXAVRepository.transferRepo(requestBody);
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
    }  else if (request.url.includes("ixav")) {
      result = await IXAVRepository.burnRepo(requestBody);
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
	let result;
    if (request.url.includes("azk")) {
      result = await AzkalRepository.totalSupplyRepo();
    } else if (request.url.includes("xav")) {
      result = await XaverRepository.totalSupplyRepo();
    } else if (request.url.includes("xgm")) {
      result = await XGameRepository.totalSupplyRepo();
    } else if (request.url.includes("ixon")) {
      result = await IXONRepository.totalSupplyRepo();
    } else if (request.url.includes("ixav")) {
      result = await IXAVRepository.totalSupplyRepo();
    }
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
	try {
	  const requestParams = request.params as IBalanceOfRequestParams;
	  if (!requestParams || !requestParams.account) {
		return reply.badRequest("Invalid request parameter. Required fields: 'account'");
	  }
	  const repositoryMap: Record<string, any> = {
		azk: AzkalRepository.balanceOfRepo,
		xav: XaverRepository.balanceOfRepo,
		xgm: XGameRepository.balanceOfRepo,
		ixon: IXONRepository.balanceOfRepo,
		ixav: IXAVRepository.balanceOfRepo,
	  };
	  const identifier = Object.keys(repositoryMap).find((key) =>
		new RegExp(`/${key}/`).test(request.url)
	  );
	  if (!identifier) {
		return reply.badRequest("Invalid URL. No matching repository found.");
	  }
	  const result = await repositoryMap[identifier](requestParams.account);
	  if (result instanceof Error) {
		throw result;
	  }
	  return reply.send(result);
	} catch (error: any) {
	  reply.status(500).send("Internal Server Error: " + error);
	}
  };
  

export const airdropController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
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
    } else if (request.url.includes("ixav")) {
      result = await IXAVRepository.airdropIXAVRepo(account);
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