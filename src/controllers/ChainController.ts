import { FastifyReply, FastifyRequest } from 'fastify';
import { 
    ITokensRequestParams,
    ITransferTokenRequestBody,
    ITransferAllTokenRequestBody,
    ISubmitExtrinsicRequestBody,
    IGetTokenPriceRequestParams,
} from '../schemas/ChainSchemas';
import WebsocketHeader from '../modules/WebsocketHeader';
import ChainRepository from '../repositories/ChainRepository';
import AstroRepository from '../repositories/AstroRepository';
import AzkalRepository from '../repositories/AzkalRepository';
import XGameRepository from '../repositories/XGameRepository';
import XaverRepository from '../repositories/XaverRepository';
import InitializeAPI from '../modules/InitializeAPI';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import IXONRepository from '../repositories/IXONRepository';

// Get smart contract
export const getSmartContractController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
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
    var api: any;
    try {
      WebsocketHeader.handleWebsocket(request);
      await cryptoWaitReady();
      api = await InitializeAPI.apiInitialization();
      if (api instanceof Error) {
          throw api;
      }
      const requestParams = request.params as ITokensRequestParams;
      let requestQuery: any = request.query;
      if (!requestParams || !requestParams.wallet_address) {
          return reply.badRequest("Invalid request parameter. Required fields: 'wallet_address'");
      }
      requestQuery.currency = requestQuery.currency === undefined ? 'USD' : requestQuery.currency;
      const [tokenResults, rateResult] = await Promise.all([
          Promise.all([
              ChainRepository.getTokensRepo(api, requestParams.wallet_address),
              AstroRepository.balanceOfRepo(requestParams.wallet_address),
            //   AzkalRepository.balanceOfRepo(api, requestParams.wallet_address),
              XGameRepository.balanceOfRepo(api, requestParams.wallet_address),
            //   XaverRepository.balanceOfRepo(api, requestParams.wallet_address),
              IXONRepository.balanceOfRepo(api, requestParams.wallet_address)
          ]),
          ChainRepository.forexRepo(requestQuery.currency)
      ]);
      const validTokenResults = tokenResults.filter(result => !(result instanceof Error));
      if (validTokenResults.length === 0) {
          return reply.internalServerError("All repositories returned errors.");
      }
      if (rateResult instanceof Error) {
          throw rateResult;
      }
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
    } finally {
        if (!(api instanceof Error)) {
            await api.disconnect();
        }
    }
};

export const getBalanceController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  var api: any;
  try {
    // WebsocketHeader.handleWebsocket(request);
    await cryptoWaitReady();
    api = await InitializeAPI.apiInitialization();
    if (api instanceof Error) {
        throw api;
    }
    const requestParams = request.params as ITokensRequestParams;
    const data = await ChainRepository.getTokenRepo(api, requestParams.wallet_address);
   
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
  finally {
      if (!(api instanceof Error)) {
          await api.disconnect();
      }
  }
};

export const tokenXonController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
      WebsocketHeader.handleWebsocket(request);
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
        WebsocketHeader.handleWebsocket(request);
        const tokens = await Promise.all([
            ChainRepository.getTokenMetadataRepo(),
            // AstroRepository.getContractMetadataRepo(),
            AzkalRepository.getAssetMetadataRepo(),
            XGameRepository.getAssetMetadataRepo(),
            XaverRepository.getAssetMetadataRepo(),
            IXONRepository.getAssetMetadataRepo(),
        ])
        if (tokens instanceof Error) {
            throw tokens;
        }
        return reply.send(tokens);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const tokenTransferController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
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
      WebsocketHeader.handleWebsocket(request);
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
      WebsocketHeader.handleWebsocket(request);
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
      let websocket = request.headers.websocket;
      if (!websocket) {
        request.headers.websocket = process.env.MAINNET_WS_PROVIDER_ENDPOINT;
      }
      WebsocketHeader.handleWebsocket(request);
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
      let websocket = request.headers.websocket;
      if (!websocket) {
        request.headers.websocket = process.env.MAINNET_WS_PROVIDER_ENDPOINT;
      }
      WebsocketHeader.handleWebsocket(request);
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
      WebsocketHeader.handleWebsocket(request);
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
    WebsocketHeader.handleWebsocket(request);
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