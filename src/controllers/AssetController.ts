import { FastifyReply, FastifyRequest } from 'fastify';
import {
  IMintRequestBody,
  ITransferRequestBody,
  IBurnRequestBody,
  IBalanceOfRequestParams,
} from '../schemas/AssetSchemas';
import AzkalRepository from '../repositories/AzkalRepository';
import XaverRepository from '../repositories/XaverRepository';
import XGameRepository from '../repositories/XGameRepository';
import IXONRepository from '../repositories/IXONRepository';
import IXAVRepository from '../repositories/IXAVRepository';
import IDONRepository from '../repositories/IDONRepository';
import MPCRepository from '../repositories/MPCRepository';
import IMPCRepository from '../repositories/IMPCRepository';

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
    } else if (request.url.includes("idon")) {
      result = await IDONRepository.mintRepo(requestBody);
    } else if (request.url.includes("mpc")) {
      result = await MPCRepository.mintRepo(requestBody);
    } else if (request.url.includes("impc")) {
      result = await IMPCRepository.mintRepo(requestBody);
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
    }  else if (request.url.includes("idon")) {
      result = await IDONRepository.transferRepo(requestBody);
    } else if (request.url.includes("mpc")) {
      result = await MPCRepository.transferRepo(requestBody);
    } else if (request.url.includes("impc")) {
      result = await IMPCRepository.transferRepo(requestBody);
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
    } else if (request.url.includes("idon")) {
      result = await IDONRepository.burnRepo(requestBody);
    } else if (request.url.includes("mpc")) {
      result = await MPCRepository.burnRepo(requestBody);
    } else if (request.url.includes("impc")) {
      result = await IMPCRepository.burnRepo(requestBody);
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
    } else if (request.url.includes("idon")) {
      result = await IDONRepository.totalSupplyRepo();
    } else if (request.url.includes("mpc")) {
      result = await MPCRepository.totalSupplyRepo();
    } else if (request.url.includes("impc")) {
      result = await IMPCRepository.totalSupplyRepo();
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
    idon: IDONRepository.balanceOfRepo,
    mpc: MPCRepository.balanceOfRepo,
    impc: IMPCRepository.balanceOfRepo,
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
  