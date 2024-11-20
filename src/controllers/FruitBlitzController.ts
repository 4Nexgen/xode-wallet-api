import { FastifyReply, FastifyRequest } from 'fastify';
import {
    IGetMarketplaceNFTRequestBody,
    IGetUserNFTRequestParams,
    IGetNFTByIdRequestParams,
    IUpdateOneNFTRequestParams,
    IUpdateNFTRequestBody,
    IMintRequestBody,
} from '../schemas/FruitBlitzSchemas';
import FruitBlitzRepository from '../repositories/FruitBlitzRepository';
import EnergyRepository from '../repositories/EnergyRepository';
import WebsocketHeader from '../modules/WebsocketHeader';

export const mintController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestBody = request.body as IMintRequestBody;
        if (!requestBody) {
            return reply.badRequest('Missing or invalid request body.');
        }
        if (
            !requestBody.image_path &&
            !requestBody.name &&
            !requestBody.description &&
            !requestBody.price &&
            requestBody.is_for_sale === undefined &&
            requestBody.is_equipped === undefined &&
            requestBody.is_drop === undefined &&
            !requestBody.category &&
            !requestBody.blockchain_id
        ) {
            return reply.badRequest("Invalid request body.");
        }
        
        const result = await FruitBlitzRepository.mintRepo(requestBody);
        if (result instanceof Error) {
            throw result;
        }
        return reply.send(result);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const updateNFTHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestParams = request.params as IUpdateOneNFTRequestParams;
        if (!requestParams || !requestParams.id) {
            return reply.badRequest("Missing 'id' parameter in URI 'nfts/:id'");
        }

        const requestBody = request.body as IUpdateNFTRequestBody;
        if (!requestBody) {
            return reply.badRequest('Missing or invalid request body.');
        }
        if (
            !requestBody.name &&
            !requestBody.description &&
            !requestBody.category &&
            !requestBody.collection &&
            !requestBody.image_path &&
            !requestBody.price &&
            requestBody.is_for_sale === undefined &&
            !requestBody.astro_type &&
            !requestBody.specs &&
            !requestBody.blockchain_id
        ) {
            return reply.badRequest("Invalid request body.");
        }
        
        const targetNFT = await FruitBlitzRepository.updateNFTRepo(
        requestBody,
        requestParams.id,
        );
        if (targetNFT instanceof Error) {
            throw targetNFT;
        }
        return reply.send(targetNFT);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getMarketplaceNftsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestBody = request.body as IGetMarketplaceNFTRequestBody;
        if (!requestBody || !requestBody.collection_id) {
            return reply.badRequest("Invalid request body. Required fields: 'collection_id'.");
        }
        const nfts = await FruitBlitzRepository.getMarketplaceNfts(requestBody);
        if (nfts instanceof Error) {
            throw nfts;
        }
        return reply.send(nfts);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getUserNftsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestParams = request.params as IGetUserNFTRequestParams;
        if (!requestParams || !requestParams.wallet_address) {
            return reply.badRequest("Invalid request parameters. Required parameter: wallet address");
        }
        const nfts: any = await FruitBlitzRepository.getUserNFTRepo(requestParams.wallet_address);
        if (nfts instanceof Error) {
            throw nfts;
        }
        return reply.send(nfts);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getNftByIdHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestParams = request.params as IGetNFTByIdRequestParams;
        if (!requestParams || !requestParams.token_id) {
            return reply.badRequest("Invalid request parameters. Required parameter: token_id");
        }
        const nfts = await FruitBlitzRepository.getNFTByIdRepo(requestParams.token_id);
        if (nfts instanceof Error) {
            throw nfts;
        }
        if (nfts == null) {
            return reply.send([]);
        } else {
            return reply.send(nfts);
        }
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const dashboardNftHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        WebsocketHeader.handleWebsocket(request);
        const requestParams = request.params as IGetUserNFTRequestParams;
        if (!requestParams || !requestParams.wallet_address) {
            return reply.badRequest("Invalid request parameters. Required parameter: wallet address");
        }
        const [nfts, energy] = await Promise.all([
            FruitBlitzRepository.getUserNFTRepo(requestParams.wallet_address),
            EnergyRepository.getEnergyRepo(requestParams.wallet_address),
        ]);
        if (nfts instanceof Error || energy instanceof Error) {
            throw nfts || energy;
        }
        let result: any;
        if (nfts.length > 0 && nfts.every((nft: any) => nft.collection.includes('FruitBlitz'))) {
            if (energy == null) {
                const data = {
                    owner: requestParams.wallet_address,
                    energy: 20,
                };
                const setEnergyResult = await EnergyRepository.setEnergyRepo(data);
                if (setEnergyResult instanceof Error) {
                    throw setEnergyResult;
                }
                result = await EnergyRepository.getEnergyRepo(requestParams.wallet_address);
                if (result instanceof Error) {
                    throw result;
                }
            } else {
                result = energy;
                if (result.resetable) {
                    const resetEnergyResult = await EnergyRepository.resetEnergyRepo(requestParams.wallet_address);
                    if (resetEnergyResult instanceof Error) {
                        throw resetEnergyResult;
                    }
                    result = await EnergyRepository.getEnergyRepo(requestParams.wallet_address);
                    if (result instanceof Error) {
                        throw result;
                    }
                }
            }
            if (result != null) {
                const nftEntry: any = {
                    nftTokenId: 0,
                    imagePath: result.imagePath || '',
                    name: 'Energy Capsule',
                    description: 'An energy capsule that can be used to use characters.',
                    price: result.currentEnergy,
                    isForSale: false,
                    isEquipped: true,
                    category: 'Capsule',
                    collection: 'AstroChibbi Conquest: Galactic Delight',
                    astroType: 'None',
                    rarity: 'None',
                    network: 'None',
                    blockchainId: 'None',
                    collectionId: '5FJ9VWpubQXeiLKGcVmo3zD627UAJCiW6bupSUATeyNXTH1m',
                    tokenOwner: requestParams.wallet_address,
                };
                nfts.push(nftEntry);
            }
        }
        return reply.send(nfts);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    } 
};