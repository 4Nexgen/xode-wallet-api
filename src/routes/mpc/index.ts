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
import { mint } from '../../swaggerschema/mpc/mint';
import { transfer } from '../../swaggerschema/mpc/transfer';
import { burn } from '../../swaggerschema/mpc/burn';
import { totalSupply } from '../../swaggerschema/mpc/totalSupply';
import { balanceOf } from '../../swaggerschema/mpc/balanceOf';

const mpc: FastifyPluginAsync = async (fastify, opts) => {
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

export default mpc;
