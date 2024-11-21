import { FastifyReply, FastifyRequest } from 'fastify';
import {
  IDecreaseEnergyRequestBody,
  IGetEnergyRequestBody,
  ISetEnergyImageRequestBody
} from '../schemas/EnergySchemas';
import EnergyRepository from '../repositories/EnergyRepository';
import WebsocketHeader from '../modules/WebsocketHeader';

export const decreaseEnergyController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as IDecreaseEnergyRequestBody;
    if (
      !requestBody || 
      !requestBody.owner ||
      !requestBody.decrease
    ) {
      return reply.badRequest("Invalid request body. Required fields: 'owner', 'decrease'");
    }
    
    const result = await new Promise(async (resolve, reject) => {
      try {
        const success = await EnergyRepository.decreaseEnergyRepo(requestBody);
        if (success instanceof Error) {
          reject(success);
        } else {
          const updatedEnergy = await EnergyRepository.getEnergyRepo(requestBody.owner);
          if (updatedEnergy instanceof Error) {
            reject(updatedEnergy);
          } else {
            resolve(updatedEnergy);
          }
        }
      } catch (error: any) {
        reject(error);
      }
    });
    if (result instanceof Error) {
      throw result;
    }
    return reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const getEnergyController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as IGetEnergyRequestBody;
    if (!requestBody || !requestBody.wallet_address) {
      return reply.badRequest("Missing or invalid request body.");
    }

    const energyResult = await EnergyRepository.getEnergyRepo(requestBody.wallet_address);
    if (energyResult instanceof Error) {
      throw energyResult;
    }
    if (energyResult == null) {
      const data = {
        owner: requestBody.wallet_address,
        energy: 20
      };
      const result = await new Promise(async (resolve, reject) => {
        const setEnergyResult: any = await EnergyRepository.setEnergyRepo(data);
        if (setEnergyResult instanceof Error) {
          reject(setEnergyResult);
        } else {
          resolve(await EnergyRepository.getEnergyRepo(requestBody.wallet_address));
        }
      });
      return await reply.send(result);
    } else {
      const result = await new Promise(async (resolve, reject) => {
        if (energyResult.resetable) {
          const setEnergyResult: any = await EnergyRepository.resetEnergyRepo(requestBody.wallet_address);
          if (setEnergyResult instanceof Error) {
            reject(setEnergyResult);
          } else {
            resolve(await EnergyRepository.getEnergyRepo(requestBody.wallet_address));
          }
        } else {
          resolve(energyResult);
        }
      });
      return await reply.send(result);
    }
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const setEnergyImageController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const requestBody = request.body as ISetEnergyImageRequestBody;
    if (!requestBody || !requestBody.image_url) {
      return reply.badRequest("Invalid request body. Required fields: 'image_url'");
    }
    
    const result = await EnergyRepository.setEnergyImageRepo(requestBody.image_url);
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};

export const getEnergyImageController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    WebsocketHeader.handleWebsocket(request);
    const result = await EnergyRepository.getEnergyImageRepo();
    if (result instanceof Error) {
      throw result;
    }
    return await reply.send(result);
  } catch (error: any) {
    reply.status(500).send('Internal Server Error: ' + error);
  }
};