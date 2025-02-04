import { FastifyReply, FastifyRequest } from 'fastify';
import { 
    ITokensRequestParams,
    ITransferTokenRequestBody,
    ITransferAllTokenRequestBody,
    ISubmitExtrinsicRequestBody,
    IGetTokenPriceRequestParams,
} from '../schemas/ChainSchemas';
import ChainRepository from '../repositories/ChainRepository';
import AstroRepository from '../repositories/AstroRepository';
import XGameRepository from '../repositories/XGameRepository';
import IXONRepository from '../repositories/IXONRepository';
import IXAVRepository from '../repositories/IXAVRepository';
import AzkalRepository from '../repositories/AzkalRepository';
import XaverRepository from '../repositories/XaverRepository';
import IDONRepository from '../repositories/IDONRepository';
import MPCRepository from '../repositories/MPCRepository';
import IMPCRepository from '../repositories/IMPCRepository';
import DONRepository from '../repositories/DondonRepository';

// Get smart contract
export const getSmartContractController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const result = await ChainRepository.getSmartContractRepo();
        if (result instanceof Error) {
            throw result;
        }
        return await reply.send(result);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getABIController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const result = await ChainRepository.getABIRepo();
        if (result instanceof Error) {
            throw result;
        }
        return await reply.send(result);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getTokensController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
		const { wallet_address } = request.params as ITokensRequestParams;
		let requestQuery: any = request.query;
		if (!wallet_address) {
			return reply.badRequest("Invalid request parameter. Required fields: 'wallet_address'");
		}
		requestQuery.currency = requestQuery.currency === undefined ? 'USD' : requestQuery.currency;
		const [tokenResults, rateResult] = await Promise.all([
			Promise.all([
				ChainRepository.getTokensRepo(wallet_address),
				AstroRepository.balanceOfRepo(wallet_address),
				XGameRepository.balanceOfRepo(wallet_address),
				XaverRepository.balanceOfRepo(wallet_address),
        AzkalRepository.balanceOfRepo(wallet_address),
				IXONRepository.balanceOfRepo(wallet_address),
        IXAVRepository.balanceOfRepo(wallet_address),
        IDONRepository.balanceOfRepo(wallet_address),
        MPCRepository.balanceOfRepo(wallet_address),
        IMPCRepository.balanceOfRepo(wallet_address),
        DONRepository.balanceOfRepo(wallet_address)
			]),
			ChainRepository.forexRepo(requestQuery.currency)
		]);
		const validTokenResults = tokenResults.filter(result => !(result instanceof Error));
		if (validTokenResults.length === 0) {
			return reply.internalServerError("All repositories returned errors.");
		}
		if (rateResult instanceof Error) throw rateResult;
		let total = validTokenResults.reduce((acc, token) => {
			if ('balance' in token && typeof token.balance === 'string') {
				return acc + (parseFloat(token.balance) * parseFloat(token.price));
			}
			return acc;
		}, 0);
		return reply.send({ 
			tokens: validTokenResults, 
			currency: rateResult.currency, 
			rate: (rateResult.rate).toFixed(4), 
			total: (total * rateResult.rate).toFixed(4) 
		});
	} catch (error: any) {
		reply.status(500).send('Internal Server Error: ' + error);
	}
};

export const getBalanceController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const requestParams = request.params as ITokensRequestParams;
    const data = await ChainRepository.getTokenRepo(requestParams.wallet_address);
   
    if(!(data instanceof Error)){
      if(data.status == 200){
       console.log("XON", data)
        return reply.send(data.data);
      } 
    }

    reply.status(500).send('Internal Server Error: ' + data.data);
  } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
  } 
};

export const tokenXonController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
      const tokens = await ChainRepository.getTokenMetadataRepo();
      if (tokens instanceof Error) {
          throw tokens;
      }
      return reply.send(tokens);
  } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const tokenListController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
		const [native, assets] = await Promise.all([
			ChainRepository.getTokenMetadataRepo(),
			ChainRepository.getAssetsRepo()
		]);
        if (native instanceof Error || assets instanceof Error) {
            throw native || assets;
        }
		assets.push(native);
        return reply.send(assets);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const tokenTransferController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const requestBody = request.body as ITransferTokenRequestBody;
        if (!requestBody || 
            !requestBody.target ||
            requestBody.value == null
        ) {
            return reply.badRequest("Invalid request body. Required fields: 'target', 'value");
        }
        const result = await ChainRepository.tokenTransferRepo(requestBody);
        if (result instanceof Error) {
            throw result;
        }
        return reply.send(result);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const tokenTransferAllController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
      const requestBody = request.body as ITransferAllTokenRequestBody;
      if (!requestBody || 
          !requestBody.target
      ) {
          return reply.badRequest("Invalid request body. Required fields: 'target'");
      }
      const result = await ChainRepository.tokenTransferAllRepo(requestBody);
      if (result instanceof Error) {
          throw result;
      }
      return reply.send(result);
  } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const submitExtrinsicController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const requestBody = request.body as ISubmitExtrinsicRequestBody;
    try {
      const result = await ChainRepository.submitExtrinsicRepo(requestBody);
      if (result instanceof Error) {
        throw result;
      }
      return reply.send(result);
    } catch (error) {
      reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getTotalSupplyController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
    //   let websocket = request.headers.websocket;
    //   if (!websocket) {
    //     request.headers.websocket = process.env.MAINNET_WS_PROVIDER_ENDPOINT;
    //   }
      const result = await ChainRepository.getTotalSupplyRepo();
      if (result instanceof Error) {
        throw result;
      }
      return reply.send(result);
    } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getCirculatingSupplyController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
    //   let websocket = request.headers.websocket;
    //   if (!websocket) {
    //     request.headers.websocket = process.env.MAINNET_WS_PROVIDER_ENDPOINT;
    //   }
      const result = await ChainRepository.getCirculatingSupplyRepo();
      if (result instanceof Error) {
        throw result;
      }
      return reply.send(result);
    } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getSupplyController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const [totalSupplyResult, circulatingSupplyResult] = await Promise.all([
        ChainRepository.getTotalSupplyRepo(),
        ChainRepository.getCirculatingSupplyRepo(),
      ]);
      if (totalSupplyResult instanceof Error) {
        throw totalSupplyResult;
      }
      if (circulatingSupplyResult instanceof Error) {
        throw circulatingSupplyResult;
      }
      const circulatingSupply = (circulatingSupplyResult as { circulatingSupply: string }).circulatingSupply;
      const totalSupply = (totalSupplyResult as { totalSupply: string }).totalSupply;
      return reply.send({
        circulatingSupply,
        totalSupply,
        tokenPrice: 10,
      });
    } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getTokenPricesController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const requestParams = request.params as IGetTokenPriceRequestParams;
    if (!requestParams || 
      !requestParams.currency
    ) {
        return reply.badRequest("Invalid request body. Required fields: 'currency'");
    }
    const data = await ChainRepository.forexRepo(requestParams.currency);
    if (data instanceof Error) {
      throw data;
    }
    const result = await ChainRepository.getTokenPricesRepo(data);
    if (result instanceof Error) {
      throw result;
    }
    return reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};