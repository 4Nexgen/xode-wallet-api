import { FastifyReply, FastifyRequest } from 'fastify';
import {
    IUpdateOneNFTRequestParams,
    IUpdateNFTRequestBody,
    ITransferNFTFromWOARequestBody,
    IBalanceTransferRequestBody,
    IGetMarketplaceNFTRequestBody,
    IGetNFTByIdRequestParams,
    IGetUserNFTRequestParams
} from '../schemas/NFTSchemas';
import AstroChibbiRepository from '../repositories/AstroChibbiRepository';
// import FruitBlitzRepository from '../repositories/FruitBlitzRepository';
import EnergyRepository from '../repositories/EnergyRepository';

export const updateNFTHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
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
        
        const targetNFT = await AstroChibbiRepository.updateNFTRepo(
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

export const transferFromWOANFTHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const requestBody = request.body as ITransferNFTFromWOARequestBody;
        if (
            !requestBody || 
            !requestBody.from ||
            !requestBody.to ||
            !requestBody.id
            ) {
            return reply.badRequest("Missing or invalid request body.");
        }
        const result = await AstroChibbiRepository.transferFromWithoutApprovalRepo(requestBody);
        if (result instanceof Error) {
            throw result;
        }
        return reply.send(result);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getMarketplaceNftsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const requestBody = request.body as IGetMarketplaceNFTRequestBody;
        if (!requestBody || !requestBody.collection_id) {
            return reply.badRequest("Invalid request body. Required fields: 'collection_id'.");
        }
        const nfts = await AstroChibbiRepository.getMarketplaceNftsByCollectionIdRepo(requestBody);
        if (nfts instanceof Error) {
            throw nfts;
        }
        const updatedImages = nfts.map((nft: { imagePath: string; }) => {
            return {
                ...nft,
                imagePath: nft.imagePath.replace('.ipfs.cf-ipfs.com/', '.ipfs.w3s.link/')
            };
        });
        return reply.send(updatedImages);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getUserNftsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const requestParams = request.params as IGetUserNFTRequestParams;
        if (!requestParams || !requestParams.wallet_address) {
            return reply.badRequest("Invalid request parameters. Required parameter: wallet address");
        }
        const nfts: any = await AstroChibbiRepository.getUserNFTRepo(requestParams.wallet_address);
        if (nfts instanceof Error) {
            throw nfts;
        }
        const updatedImages = nfts.map((nft: { imagePath: string; }) => {
            return {
                ...nft,
                imagePath: nft.imagePath.replace('.ipfs.cf-ipfs.com/', '.ipfs.w3s.link/')
            };
        });
        return reply.send(updatedImages);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const getNftByIdHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const requestParams = request.params as IGetNFTByIdRequestParams;
        if (!requestParams || !requestParams.token_id) {
            return reply.badRequest("Invalid request parameters. Required parameter: token ID");
        }
        const nfts = await AstroChibbiRepository.getNFTByIdRepo(requestParams.token_id);
        if (nfts instanceof Error) {
            throw nfts;
        }
        if (nfts == null) {
            return reply.send([]);
        } else {
            const updatedImage = {
                ...nfts,
                imagePath: nfts.imagePath.replace('.ipfs.cf-ipfs.com/', '.ipfs.w3s.link/')
            };
            return reply.send(updatedImage);
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
        const requestParams = request.params as IGetUserNFTRequestParams;
        if (!requestParams || !requestParams.wallet_address) {
            return reply.badRequest("Invalid request parameters. Required parameter: wallet address");
        }
        const [astro, energy] = await Promise.all([
            AstroChibbiRepository.getUserNFTRepo(requestParams.wallet_address),
            // FruitBlitzRepository.getUserNFTRepo(api, requestParams.wallet_address),
            EnergyRepository.getEnergyRepo(requestParams.wallet_address),
        ]);
        if (astro instanceof Error || energy instanceof Error) {
            throw astro || energy;
        }
        // if (blitz.length > 0 || blitz != undefined) {
        //     blitz.forEach((data: any) => {
        //         astro.push(data);
        //     });
        // }
        let result: any;
        if (astro.length > 0 && astro.every((nft: any) => nft.collection.includes('AstroChibbi Conquest: Galactic Delight'))) {
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
                astro.push(nftEntry);
            }
        }
        const updatedImages = astro.map((nft: any) => {
            return {
                ...nft,
                imagePath: nft.imagePath.replace('.ipfs.cf-ipfs.com/', '.ipfs.w3s.link/')
            };
        });
        return reply.send(updatedImages);
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const balanceTransferHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const requestBody = request.body as IBalanceTransferRequestBody;
      if (!requestBody || 
        !requestBody.from ||
        !requestBody.amount
      ) {
        return reply.badRequest("Missing or invalid request body.");
      }
      const result = await AstroChibbiRepository.balanceTransferRepo(requestBody);
      if (result instanceof Error) {
        throw result;
      }
      return reply.send(result);
    } catch (error: any) {
      reply.status(500).send('Internal Server Error: ' + error);
    }
  };
  