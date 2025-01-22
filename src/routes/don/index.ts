import { FastifyPluginAsync } from 'fastify';
import { 
  mintController,
  transferController,
  burnController,
  totalSupplyController,
  balanceOfController,
} from '../../controllers/AssetController';
import { 
  IBalanceOfRequestParams, 
  IBurnRequestBody, 
  IMintRequestBody, 
  ITotalSupplyRequestParams, 
  ITransferRequestBody,
  IResponseSuccessful, 
  IResponseError, 
} from '../../schemas/AssetSchemas';
import { mint } from '../../swaggerschema/don/mint';
import { transfer } from '../../swaggerschema/don/transfer';
import { burn } from '../../swaggerschema/don/burn';
import { totalSupply } from '../../swaggerschema/don/totalSupply';
import { balanceOf } from '../../swaggerschema/don/balanceOf';

const don: FastifyPluginAsync = async (fastify, opts) => {
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
  
  fastify.get<{
    Querystring: IBalanceOfRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/balanceof/:account',
    { schema: balanceOf },
    balanceOfController
  );
};

export default don;
