import {
    IUpdateNFTRequestBody,
    IMintRequestBody,
} from '../schemas/FruitBlitzSchemas';
import TXRepository from '../modules/TXRepository';
import { Keyring } from '@polkadot/api';
import abi from '../smartcontracts/fruitblitz/fruitblitz_nft.json';

export default class FruitBlitzRepository {
    contractAddress = process.env.FRUITBLITZ_ADDRESS as string;
    ownerSeed = process.env.FRUITBLITZ_SEED as string;
    // These are required and changeable
    REFTIME: number = 300000000000;
    PROOFSIZE: number = 500000;

    static async mintRepo(nftData: IMintRequestBody) {
      console.log('mintRepo function was called');
      const instance = new FruitBlitzRepository();
      try {
        const contractAddress = instance.contractAddress;
        const contract = TXRepository.getContract(abi, contractAddress);
        const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
        const owner = keyring.addFromUri(instance.ownerSeed);
        const storageDepositLimit = null;
        if (contract === undefined) { 
          return Error('Contract undefined');
        }
        const result = await TXRepository.sendContractTransaction(
          contract,
          'mint',
          owner,
          [
            nftData.image_path,
            nftData.name,
            nftData.description,
            nftData.price,
            nftData.is_for_sale,
            nftData.is_equipped,
            nftData.is_drop,
            nftData.category,
            nftData.blockchain_id,
          ],
          instance,
          storageDepositLimit
        );
        return result;
      } catch (error: any) {
        return Error(error || 'mintRepo error occurred.');
      }
  }

    static async updateNFTRepo(nftData: IUpdateNFTRequestBody, id: number) {
        console.log('updateNFTRepo function was called');
        const instance = new FruitBlitzRepository();
        try {
          const contractAddress = instance.contractAddress;
          const contract = TXRepository.getContract(abi, contractAddress);
          const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
          const owner = keyring.addFromUri(instance.ownerSeed);
          const storageDepositLimit = null;
          if (contract === undefined) { 
            return Error('Contract undefined');
          }
          const result = await TXRepository.sendContractTransaction(
            contract,
            'updateToken',
            owner,
            [
              id,
              nftData.image_path,
              nftData.name,
              nftData.description,
              nftData.price,
              nftData.is_for_sale,
              nftData.category,
              nftData.blockchain_id,
            ],
            instance,
            storageDepositLimit
          );
          return result;
        } catch (error: any) {
          return Error(error || 'updateNFTRepo error occurred.');
        }
    }

    static async getMarketplaceNfts(data: any) {
      console.log('getMarketplaceNftsByCollectionIdRepo function was called');
      const instance = new FruitBlitzRepository();
      try {
        const contract = TXRepository.getContract(abi, instance.contractAddress);
        if (contract !== undefined) {
          const nft = await TXRepository.sendContractQuery(
            contract,
            'getMarketplaceNftsByCollection',
            [data.collection_id],
            instance
          );
          return nft.ok;
        }
      } catch (error: any) {
        throw Error(error || 'getMarketplaceNftsByCollectionIdRepo error occurred.');
      }
    }

    static async getUserNFTRepo(wallet_address: string) {
      console.log('getUserNFTRepo function was called');
      const instance = new FruitBlitzRepository();
      try {
        const contract = TXRepository.getContract(abi, instance.contractAddress);
        if (!contract) {
          return Error('Contract not initialized.');
        }
        if (!contract.query || !contract.query.getUserNft) {
          return Error('getUserNft function not found in the contract ABI.');
        }
        const result = await TXRepository.sendContractQuery(
          contract,
          'getUserNft',
          [ wallet_address, '' ],
          instance
        );
        return result.ok;
      } catch (error: any) {
        console.log('getUserNFTRepo: ', error);
        return Error(error);
      } 
    }

    static async getNFTByIdRepo(token_id: string) {
      console.log('getNFTByIdRepo function was called');
      const instance = new FruitBlitzRepository();
      try {
        const contract = TXRepository.getContract(abi, instance.contractAddress);
        if (!contract) {
          return Error('Contract not initialized.');
        }
        if (!contract.query || !contract.query.getNftById) {
          return Error('getNFTById function not found in the contract ABI.');
        }
        const result = await TXRepository.sendContractQuery(
          contract,
          'getNftById',
          [token_id],
          instance
        );
        return result;
      } catch (error: any) {
        return Error(error || 'getNFTByIdRepo error occurred.');
      }
    }
}