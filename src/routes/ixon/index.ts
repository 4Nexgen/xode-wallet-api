import { FastifyPluginAsync } from 'fastify';
import { 
  mintController,
  transferController,
  burnController,
  totalSupplyController,
  balanceOfController,
  airdropController,
} from '../../controllers/AssetController';
import { 
  IBalanceOfRequestParams, 
  IBurnRequestBody, 
  IMintRequestBody, 
  ITotalSupplyRequestParams, 
  ITransferRequestBody,
  IAirdropAssetRequestBody,
  IResponseSuccessful, 
  IResponseError, 
} from '../../schemas/AssetSchemas';
import { mint } from '../../swaggerschema/ixon/mint';
import { transfer } from '../../swaggerschema/ixon/transfer';
import { burn } from '../../swaggerschema/ixon/burn';
import { totalSupply } from '../../swaggerschema/ixon/totalSupply';
import { balanceOf } from '../../swaggerschema/ixon/balanceOf';

const ixon: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post<{
    Querystring: IMintRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/mint',
    { schema: mint },
    mintController
  );

  fastify.post<{
    Querystring: ITransferRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/transfer',
    { schema: transfer },
    transferController
  );

  fastify.delete<{
    Querystring: IBurnRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/burn',
    { schema: burn },
    burnController
  );

  fastify.get<{
    Querystring: ITotalSupplyRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/totalsupply',
    { schema: totalSupply },
    totalSupplyController
  );
  
  fastify.post<{
    Querystring: IBalanceOfRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/balanceof/:account',
    { schema: balanceOf },
    balanceOfController
  );

  fastify.post<{
    Querystring: IAirdropAssetRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/airdrop',
    airdropController
  );
};

export default ixon;
