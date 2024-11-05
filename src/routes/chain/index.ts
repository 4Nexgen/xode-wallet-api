import { FastifyPluginAsync } from 'fastify';
import {
  getSmartContractController,
  getTokensController,
  tokenListController,
  submitExtrinsicController,
  tokenTransferController,
  tokenTransferAllController,
  getTotalSupplyController,
  getCirculatingSupplyController,
  getSupplyController,
  getTokenPricesController,
  getBalanceController,
} from '../../controllers/ChainController';
// import { airdropController } from '../../controllers/AssetController';
import {
  IGetSmartContractRequestBody,
  ITokensRequestParams,
  ITokenListRequestParams,
  ITransferTokenRequestBody,
  ITransferAllTokenRequestBody,
  ISubmitExtrinsicRequestBody,
  // IAirdropNativeRequestBody,
  IGetTotalSupplyRequestParams,
  IGetCirculatingSupplyRequestParams,
  IGetSupplyRequestParams,
  IGetTokenPriceRequestParams,
  IResponseSuccessful,
  IResponseError,
} from '../../schemas/ChainSchemas';
import { token_list } from '../../swaggerschema/chain/token_list';
import { user_token_balance } from '../../swaggerschema/chain/user_token_balance';
import { token_transfer } from '../../swaggerschema/chain/token_transfer';
import { token_transfer_all } from '../../swaggerschema/chain/token_transfer_all';
import { submit_extrinsic } from '../../swaggerschema/chain/submit_extrinsic';
import { total_supply } from '../../swaggerschema/chain/total_supply';
import { circulating_supply } from '../../swaggerschema/chain/circulating_supply';
import { token_prices } from '../../swaggerschema/chain/token_prices';

const chain: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get<{
    Querystring: IGetSmartContractRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/smartcontract',
    getSmartContractController
  );

  fastify.get<{
    Querystring: ITokensRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/gettokens/:wallet_address',
    { schema: user_token_balance },
    getTokensController
  );

  fastify.post<{
    Querystring: ITokensRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/tokenXonController/:wallet_address',
    // { schema: user_token_balance },
    getBalanceController
  );

  fastify.get<{
    Querystring: ITokenListRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/tokenlist',
    { schema: token_list },
    tokenListController
  );

  fastify.post<{
    Querystring: ITransferTokenRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/transfer',
    { schema: token_transfer },
    tokenTransferController
  );

  fastify.post<{
    Querystring: ITransferAllTokenRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/transferall',
    { schema: token_transfer_all },
    tokenTransferAllController
  );

  fastify.post<{
    Querystring: ISubmitExtrinsicRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/extrinsic/submit',
    { schema: submit_extrinsic },
    submitExtrinsicController
  );

//   fastify.post<{
//     Querystring: any;
//     Reply: IResponseSuccessful | IResponseError;
//   }>(
//     '/airdrop',
//     airdropController
//   );

  fastify.get<{
    Querystring: IGetTotalSupplyRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/totalsupply',
    { schema: total_supply },
    getTotalSupplyController
  );

  fastify.get<{
    Querystring: IGetCirculatingSupplyRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/circulatingsupply',
    { schema: circulating_supply },
    getCirculatingSupplyController
  );

  fastify.get<{
    Querystring: IGetSupplyRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/supply',
    getSupplyController
  );

  fastify.get<{
    Querystring: IGetTokenPriceRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/price/:currency',
    { schema: token_prices },
    getTokenPricesController
  );
};

export default chain;
