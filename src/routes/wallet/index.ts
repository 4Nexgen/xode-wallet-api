// Wallet module handles wallets data that are stored in database(not blockchain)
import { FastifyPluginAsync } from 'fastify';
import {
  storeWalletController,
  readAllWalletController,
  readOneWalletController,
  updateWalletController,
  deleteWalletController,
} from '../../controllers/WalletController';
import {
  ISaveWalletRequestBody,
  IReadOneWalletRequestParams,
  IUpdateWalletRequestBody,
  IDeleteWalletRequestParams,
  IResponseSuccessful,
  IResponseError,
} from '../../schemas/WalletSchemas';

const wallet: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post<{
    Querystring: ISaveWalletRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/',
    storeWalletController
  );

  fastify.get<{
    Querystring: any;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/',
    readAllWalletController
  );

  fastify.get<{
    Querystring: IReadOneWalletRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/:id',
    readOneWalletController
  );

  fastify.put<{
    Querystring: IUpdateWalletRequestBody;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    updateWalletController
  );

  fastify.delete<{
    Querystring: IDeleteWalletRequestParams;
    Reply: IResponseSuccessful | IResponseError;
  }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    deleteWalletController
  );
};

export default wallet;
