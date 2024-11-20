import TXRepository from '../modules/TXRepository';
import PolkadotUtility from '../modules/PolkadotUtility';
import { 
  IMintRequestBody,
  ITransferRequestBody,
  IBurnRequestBody,
} from '../schemas/AssetSchemas';
import { Keyring } from '@polkadot/api';
import { api } from '../modules/InitializeAPI';

export default class XGameRepository {
  assetId = process.env.XGM_ASSET_ID as string ?? '1';
  ownerSeed = process.env.XGM_SEED as string;
  xgmPrice = '0';
  xgmImage = 'https://bafkreicmjilgrfhp3ubklbt7pdjzzt3o66ixjuy2r7xv4ghsoyoayxanp4.ipfs.w3s.link/';
  // These are required and changeable
  REFTIME: number = 300000000000;
  PROOFSIZE: number = 500000;

  static async mintRepo(data: IMintRequestBody) {
    console.log('mintRepo function was called');
    const instance = new XGameRepository();
    try {
      const metadata: any = await api.query.assets.metadata(
        instance.assetId,
      );
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'mint',
        [
          instance.assetId,
          data.to, 
          value
        ]
      );
      return result;
    } catch (error: any) {
      return Error(error || 'mintRepo error occurred.');
    }
  }

  static async transferRepo(data: ITransferRequestBody) {
    console.log('transferRepo function was called');
    const instance = new XGameRepository();
    try {
      const metadata: any = await api.query.assets.metadata(
        instance.assetId,
      );
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'transfer',
        [
          instance.assetId,
          data.target, 
          value
        ]
      );
      if (result instanceof Error) return result;
      return { hash: result.toHex() };
    } catch (error: any) {
      return Error(error || 'transferRepo error occurred.');
    }
  }

  static async burnRepo(data: IBurnRequestBody) {
    console.log('burnRepo function was called');
    const instance = new XGameRepository();
    try {
      const metadata: any = await api.query.assets.metadata(
        instance.assetId,
      );
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'burn',
        [
          instance.assetId,
          data.from, 
          value
        ]
      );
      return result;
    } catch (error: any) {
      return Error(error || 'burnRepo error occurred.');
    }
  }

  static async balanceOfRepo(account: string) {
    console.log('balanceOfRepo function was called');
    const instance = new XGameRepository();
    try {
      const [accountInfo, metadata] = await Promise.all([
        api.query.assets.account(instance.assetId, account),
        api.query.assets.metadata(instance.assetId)
      ]);
      if (accountInfo.toHuman() != null) {
        const { balance } = accountInfo.unwrap();
        const { decimals, symbol, name } = metadata.toJSON() as {
			decimals: string;
			symbol: string;
			name: string;
		};
        const balances = PolkadotUtility.balanceFormatter(
          parseInt(decimals),
          [symbol],
          balance
        );
        return {
          balance: balances,
          symbol: symbol,
          name: name,
          price: instance.xgmPrice,
          image: instance.xgmImage,
        };
      } else {
        return {
          balance: '0.0000',
          symbol: 'XGM',
          name: 'XGame',
          price: instance.xgmPrice,
          image: instance.xgmImage,
        };
      };
    } catch (error: any) {
      return Error(error || 'balanceOfRepo error occurred.');
    } 
  }
  
  static async totalSupplyRepo() {
    console.log('totalSupplyRepo function was called');
    const instance = new XGameRepository();
    try {
      const assetInfo: any = await api.query.assets.asset(
        instance.assetId
      );
      if (assetInfo.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { supply } = assetInfo.toJSON();
      return {
        total_supply: supply
      };
    } catch (error: any) {
      return Error(error || 'totalSupplyRepo error occurred.');
    }
  }

  static async getAssetMetadataRepo() {
    console.log('getAssetMetadataRepo function was called');
    const instance = new XGameRepository();
    try {
      const metadata = await api.query.assets.metadata(instance.assetId);
      return {
        name: metadata.toHuman().name,
        symbol: metadata.toHuman().symbol,
        decimals: metadata.toHuman().decimals,
        image: instance.xgmImage,
        price: instance.xgmPrice,
      }
    } catch (error: any) {
      return Error(error || 'getAssetMetadataRepo error occurred.');
    }
  }

  static async airdropXGMRepo(data: any) {
    console.log('airdropXGMRepo function was called');
    const instance = new XGameRepository();
    try {
      const metadata: any = await api.query.assets.metadata(
        instance.assetId,
      );
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
      const owner = keyring.addFromUri(instance.ownerSeed);
      const { decimals } = metadata.toJSON();
      const value = 10 * 10 ** decimals;
      let nonce = await api.rpc.system.accountNextIndex(owner.address);
      let index = 0;
      while (index < data.length) {
        const batch = data.slice(index, index + 1);
        for (const address of batch) {
          console.log(`Index: ${index} - `, address);
          const tx = api.tx.assets.transfer(instance.assetId, address, value); 
          await tx.signAndSend(owner, { nonce });
        }
        index += 1;
        const newNonce = await api.rpc.system.accountNextIndex(owner.address);
        if (newNonce.gt(nonce)) {
          nonce = newNonce;
        }
      }
      const tx = api.tx.assets.freezeAsset(instance.assetId); 
      await tx.signAndSend(owner, { nonce });
      return;
    } catch (error: any) {
      return Error(error || 'airdropXGMRepo error occurred.');
    }
  }
}
