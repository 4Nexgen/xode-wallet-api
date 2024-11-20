import TXRepository from '../modules/TXRepository';
import { Keyring } from '@polkadot/api';
import abi from '../smartcontracts/astrochibbi/astro_energy.json';
import { IDecreaseEnergyRequestBody } from '../schemas/EnergySchemas';

export default class EnergyRepository {
  energyAddress = process.env.ASTRO_ENERGY_ADDRESS as string;
  ownerSeed = process.env.ASTROCHIBBI_SEED as string;
  // These are required and changeable
  REFTIME: number = 300000000000;
  PROOFSIZE: number = 500000;

  static async decreaseEnergyRepo(data: IDecreaseEnergyRequestBody) {
    console.log('decreaseEnergyRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contractAddress = instance.energyAddress;
      const contract = TXRepository.getContract(abi, contractAddress);
      const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
      const owner = keyring.addFromUri(instance.ownerSeed);
      const storageDepositLimit = null;
      if (contract === undefined) {
        return Error('decreaseEnergyRepo contract undefined.');
      }
      const result = await TXRepository.sendContractTransaction(
        contract,
        'decreaseEnergy',
        owner,
        [
          data.decrease,
          data.owner,
        ],
        instance,
        storageDepositLimit
      );
      return result;
    } catch (error: any) {
      return Error(error || 'decreaseEnergyRepo error occurred.');
    }
  }

  static async resetEnergyRepo(ownerAddress: string) {
    console.log('resetEnergyRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contractAddress = instance.energyAddress;
      const contract = TXRepository.getContract(abi, contractAddress);
      const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
      const owner = keyring.addFromUri(instance.ownerSeed);
      const storageDepositLimit = null;
      if (contract === undefined) {
        return Error('resetEnergyRepo contract undefined.');
      }
      const result = await TXRepository.sendContractTransaction(
        contract,
        'resetEnergy',
        owner,
        [ 
          ownerAddress,
        ],
        instance,
        storageDepositLimit
      );
      return result;
    } catch (error: any) {
      return Error(error || 'resetEnergyRepo error occurred.');
    } 
  }

  static async setEnergyRepo(data: any) {
    console.log('setEnergyRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contractAddress = instance.energyAddress;
      const contract = TXRepository.getContract(abi, contractAddress);
      const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
      const owner = keyring.addFromUri(instance.ownerSeed);
      const storageDepositLimit = null;
      if (contract === undefined) {
        return Error('setEnergyRepo contract undefined.');
      }
      const result = await TXRepository.sendContractTransaction(
        contract,
        'setEnergy',
        owner,
        [ 
          data.owner,
        ],
        instance,
        storageDepositLimit
      );
      return result;
    } catch (error: any) {
      return Error(error || 'setEnergyRepo error occurred.');
    } 
  }

  static async setEnergyImageRepo(image_url: string) {
    console.log('setEnergyImageRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contractAddress = instance.energyAddress;
      const contract = TXRepository.getContract(abi, contractAddress);
      const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
      const owner = keyring.addFromUri(instance.ownerSeed);
      const storageDepositLimit = null;
      if (contract === undefined) {
        return Error('setEnergyImageRepo contract undefined.');
      }
      const result = await TXRepository.sendContractTransaction(
        contract,
        'setEnergyImage',
        owner,
        [ image_url ],
        instance,
        storageDepositLimit
      );
      return result;
    } catch (error: any) {
      return Error(error || 'setEnergyImageRepo error occurred.');
    }
  }
  
  static async getEnergyRepo(ownerAddress: String) {
    console.log('getEnergyRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contract = TXRepository.getContract(abi, instance.energyAddress);
      if (!contract) {
        return Error('Contract not initialized.');
      }
      if (!contract.query || !contract.query.getEnergy) {
        return Error('getEnergyRepo function not found in the contract ABI.');
      }
      const energy = await TXRepository.sendContractQuery(
        contract,
        'getEnergy',
        [ 
          ownerAddress, 
        ],
        instance
      );
      const result = energy.ok;
      if (result != null) {
        return { 
          currentEnergy: result.energy,
          resetable: result.resetable,
          imagePath: result.imagePath,
          maxEnergy: 20,
        };
      } else {
        return result;
      }
    } catch (error: any) {
      return Error(error || 'getEnergyRepo error occurred.');
    } 
  }

  static async getEnergyImageRepo() {
    console.log('getEnergyRepo function was called');
    const instance = new EnergyRepository();
    try {
      const contract = TXRepository.getContract(abi, instance.energyAddress);
      if (!contract) {
        return Error('Contract not initialized.');
      }
      if (!contract.query || !contract.query.getEnergyImage) {
        return Error('getEnergyImage function not found in the contract ABI.');
      }
      const energy = await TXRepository.sendContractQuery(
        contract,
        'getEnergyImage',
        [],
        instance
      );
      return { image_path: energy.ok };
    } catch (error: any) {
      return Error(error || 'getEnergyImageRepo error occurred.');
    }
  }
}