import {
    ITransferNFTFromWOARequestBody,
    IUpdateNFTRequestBody,
    IBalanceTransferRequestBody
} from '../schemas/NFTSchemas';
import TXRepository from '../modules/TXRepository';
import { Keyring } from '@polkadot/api';
import abi from '../smartcontracts/astrochibbi/astro_nft.json';
import NFT from '../models/nft';
import { api } from '../modules/InitializeAPI';

export default class AstroChibbiRepository {
    contractAddress = process.env.ASTROCHIBBI_ADDRESS as string;
    ownerSeed = process.env.ASTROCHIBBI_SEED as string;
    // These are required and changeable
    REFTIME: number = 300000000000;
    PROOFSIZE: number = 500000;

    static getNFTAtributes = async (data: string) => {
      const rarity: number = parseInt(data);
      const attackRange: Record<number, [number, number]> = {
        0: [1, 7],
        1: [8, 15],
        2: [16, 24],
        3: [25, 30],
      };
      const attack = 10 + this.getRandomRange(attackRange, rarity);
      const defenseRange: Record<number, [number, number]> = {
        0: [1, 7],
        1: [8, 15],
        2: [16, 24],
        3: [25, 30],
      };
      const defense = 10 + this.getRandomRange(defenseRange, rarity);
      const hitpointsRange: Record<number, [number, number]> = {
        0: [1, 12],
        1: [13, 25],
        2: [26, 38],
        3: [39, 50],
      };
      const hitpoints = 100 + this.getRandomRange(hitpointsRange, rarity);
      const passiveType = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
      const passivePercent = this.getPassivePercentage(rarity);

      const attributes = {
        rarity: rarity,
        attack: attack.toFixed(0),
        defense: defense.toFixed(0),
        hitpoints: hitpoints.toFixed(0),
        passive1: {
          type: passiveType,
          percentage: passivePercent.toFixed(2)
        }
      };
      return attributes;
    }

    static getRandomRange = (
      ranges: any,
      rarity: number
    ) => {
      const range = ranges[rarity];
      const [min, max] = range;
      return Math.random() * (max - min) + min;
    }

    static getPassivePercentage = (
      rarity: number
    ): number => {
      const ranges: Record<number, [number, number]> = {
        0: [0.01, 0.99],
        1: [1.00, 1.49],
        2: [1.50, 1.99],
        3: [2.00, 3.00],
      };
      return this.getRandomRange(ranges, rarity);
    }

    static async updateNFTRepo(nftData: IUpdateNFTRequestBody, id: number) {
        console.log('updateNFTRepo function was called');
        const instance = new AstroChibbiRepository();
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
              nftData.collection,
              nftData.astro_type,
              nftData.specs,
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

    static transferFromWithoutApprovalRepo = async (
        data: ITransferNFTFromWOARequestBody
      ) => {
        console.log('transferNFTFromWithoutApprovalRepo function was called');
        const instance = new AstroChibbiRepository();
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
            'transferFromWithoutApproval',
            owner,
            [data.from, data.to, data.id],
            instance,
            storageDepositLimit
          );
          return result;
        } catch (error: any) {
          return Error(error || 'transferNFTFromWithoutApprovalRepo error occurred.');
        }
    }

    static async getMarketplaceNftsByCollectionIdRepo(data: any) {
      console.log('getMarketplaceNftsByCollectionIdRepo function was called');
      const instance = new AstroChibbiRepository();
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
      const instance = new AstroChibbiRepository();
      try {
        const contract = TXRepository.getContract(abi, instance.contractAddress);
        const player_wallet_address = wallet_address;
    
        if (!contract) {
          return Error('Contract not initialized.');
        }
    
        if (!contract.query || !contract.query.getUserNft) {
          return Error('getUserNft function not found in the contract ABI.');
        }
    
        const result = await TXRepository.sendContractQuery(
          contract,
          'getUserNft',
          [player_wallet_address],
          instance
        );
		console.log(result)
        const rarityMapping: Record<string, string> = {
          "0": "Normal",
          "1": "Rare",
          "2": "Epic",
          "3": "Legend"
        };
        const response: NFT[] = result.ok;
        const data = response.map((item) => {
          return {
            ...item,
            rarity: rarityMapping[item.stats.rarity]
          };
        });
        if (result !== undefined) {
          return data;
        } else {
          return [{
            nftTokenId: undefined,
            imagePath: "",
            name: "",
            description: "",
            price: undefined,
            isForSale: undefined,
            isEquipped: undefined,
            category: "",
            collection: "",
            astroType: "",
            rarity: "",
            network: "",
            blockchainId: "",
            collectionId: "",
            tokenOwner: ""
          }]
        }
      } catch (error: any) {
        console.log('getUserNFTRepo: ', error);
        return Error(error);
      } 
  }
  
  static async getNFTByIdRepo(token_id: string) {
      console.log('getNFTByIdRepo function was called');
      const instance = new AstroChibbiRepository();
      try {
        const contract = TXRepository.getContract(abi, instance.contractAddress);
        const tokenId = token_id;
    
        if (!contract) {
          return Error('Contract not initialized.');
        }
    
        if (!contract.query || !contract.query.getNftById) {
          return Error('getNFTById function not found in the contract ABI.');
        }
    
        const result = await TXRepository.sendContractQuery(
          contract,
          'getNftById',
          [tokenId],
          instance
        );
        const response = result.ok;
        const rarityMapping: Record<string, string> = {
          "0": "Normal",
          "1": "Rare",
          "2": "Epic",
          "3": "Legend"
        };
        const data = {
          ...response,
          rarity: rarityMapping[response.stats.rarity],
          stats: undefined
        }
        if (result.ok != null) {
          return data;
        } else {
          return Error('Token Not Found');
        }
      } catch (error: any) {
        return Error(error || 'getNFTByIdRepo error occurred.');
      }
    }

    static async balanceTransferRepo(data: IBalanceTransferRequestBody) {
      console.log('balanceTransferRepo function was called');
      const instance = new AstroChibbiRepository();
      try {
        const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
        const chainDecimals = api.registry.chainDecimals[0];
        const value = data.amount * 10 ** chainDecimals;
        const owner = keyring.addFromUri(instance.ownerSeed);
        const result = await TXRepository.sendApiTransaction(
          'balances',
          'forceTransfer',
          owner,
          [data.from, value]
        );
        return result;
      } catch (error: any) {
        return Error(error || 'balanceTransferRepo error occurred.');
      }
    }
}