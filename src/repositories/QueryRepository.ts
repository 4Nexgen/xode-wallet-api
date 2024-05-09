import TXRepository from '../modules/TXRepository';
import InitializeAPI from '../modules/InitializeAPI';
import abi from '../smartcontracts/astrochibbi/astro_nft.json';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import NFT from '../models/nft';

export default class QueryRepository {
    contractAddress = process.env.ASTROCHIBBI_ADDRESS as string;
    // These are required and changeable
    REFTIME: number = 300000000000;
    PROOFSIZE: number = 500000;

    static async getMarketplaceNftsByCollectionIdRepo(data: any) {
        console.log('getMarketplaceNftsByCollectionIdRepo function was called');
        const instance = new QueryRepository();
        var api: any;
        try {
          await cryptoWaitReady();
          api = await InitializeAPI.apiInitialization();
      if (api instanceof Error) {
        return api;
      }
          const contract = await TXRepository.getContract(api, abi, instance.contractAddress);
          if (contract !== undefined) {
            const nft = await TXRepository.sendContractQuery(
              api,
              contract,
              'getMarketplaceNftsByCollection',
              [data.collection_id],
              instance
            );
            return nft.ok;
          }
        } catch (error: any) {
          throw Error(error || 'getMarketplaceNftsByCollectionIdRepo error occurred.');
        } finally {
          if (!(api instanceof Error)) {
            await api.disconnect();
          }
        }
    }
    
    static async getUserNFTRepo(wallet_address: string) {
        console.log('getUserNFTRepo function was called');
        const instance = new QueryRepository();
        var api: any;
        try {
          await cryptoWaitReady();
          api = await InitializeAPI.apiInitialization();
          if (api instanceof Error) {
            return api;
          }
          const contract = await TXRepository.getContract(api, abi, instance.contractAddress);
          const player_wallet_address = wallet_address;
      
          if (!contract) {
            return Error('Contract not initialized.');
          }
      
          if (!contract.query || !contract.query.getUserNft) {
            return Error('getUserNft function not found in the contract ABI.');
          }
      
          const result = await TXRepository.sendContractQuery(
            api,
            contract,
            'getUserNft',
            [player_wallet_address],
            instance
          );
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
        } finally {
          if (!(api instanceof Error)) {
            await api.disconnect();
          }
        }
    }
    
    static async getNFTByIdRepo(token_id: string) {
        console.log('getNFTByIdRepo function was called');
        const instance = new QueryRepository();
        var api: any;
        try {
          await cryptoWaitReady();
          api = await InitializeAPI.apiInitialization();
          if (api instanceof Error) {
            return api;
          }
          const contract = await TXRepository.getContract(api, abi, instance.contractAddress);
          const tokenId = token_id;
      
          if (!contract) {
            return Error('Contract not initialized.');
          }
      
          if (!contract.query || !contract.query.getNftById) {
            return Error('getNFTById function not found in the contract ABI.');
          }
      
          const result = await TXRepository.sendContractQuery(
            api,
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
        } finally {
          if (!(api instanceof Error)) {
            await api.disconnect();
          }
        }
    }
}