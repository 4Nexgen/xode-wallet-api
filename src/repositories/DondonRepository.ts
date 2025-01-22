import TXRepository from '../modules/TXRepository';
import PolkadotUtility from '../modules/PolkadotUtility';
import {
  IMintRequestBody,
  ITransferRequestBody,
  IBurnRequestBody,
} from '../schemas/AssetSchemas';
import { api } from '../modules/InitializeAPI';

export default class DONRepository {
  assetId = (process.env.DON_ASSET_ID as string) ?? '9';
  donPrice = '0';
  donImage =
    'https://images.ctfassets.net/ceadegliwn46/36GLn5ySNli6vVflmcnMcx/d92e2a8928cd6892bc8649ec5df86d9f/idon_1.png';
  // These are required and changeable
  REFTIME: number = 300000000000;
  PROOFSIZE: number = 500000;

  static async mintRepo(data: IMintRequestBody) {
    console.log('mintRepo function was called');
    const instance = new DONRepository();
    try {
      const metadata: any = await api.query.assets.metadata(instance.assetId);
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'mint',
        [instance.assetId, data.to, value]
      );
      return result;
    } catch (error: any) {
      return Error(error || 'mintRepo error occurred.');
    }
  }

  static async transferRepo(data: ITransferRequestBody) {
    console.log('transferRepo function was called');
    const instance = new DONRepository();
    try {
      const metadata: any = await api.query.assets.metadata(instance.assetId);
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'transfer',
        [instance.assetId, data.target, value]
      );
      if (result instanceof Error) {
        return result;
      }
      return { hash: result.toHex() };
    } catch (error: any) {
      return Error(error || 'transferRepo error occurred.');
    }
  }

  static async burnRepo(data: IBurnRequestBody) {
    console.log('burnRepo function was called');
    const instance = new DONRepository();
    try {
      const metadata: any = await api.query.assets.metadata(instance.assetId);
      if (metadata.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { decimals } = metadata.toJSON();
      const value = data.value * 10 ** decimals;
      const result = TXRepository.constructChainExtrinsicTransaction(
        'assets',
        'burn',
        [instance.assetId, data.from, value]
      );
      return result;
    } catch (error: any) {
      return Error(error || 'burnRepo error occurred.');
    }
  }

  static async balanceOfRepo(account: string) {
    console.log('balanceOfRepo function was called');
    const instance = new DONRepository();
    try {
      const [accountInfo, metadata] = await Promise.all([
        api.query.assets.account(instance.assetId, account),
        api.query.assets.metadata(instance.assetId),
      ]);
      if (accountInfo.toHuman() != null) {
        const { balance } = accountInfo.unwrap();
        const { decimals, symbol, name } = metadata;
        const balances = PolkadotUtility.balanceFormatter(
          decimals.toNumber(),
          [symbol.toHuman()],
          balance
        );
        return {
          balance: balances,
          symbol: symbol.toHuman(),
          name: name.toHuman(),
          price: instance.donPrice,
          image: instance.donImage,
        };
      } else {
        return {
          balance: '0.0000',
          symbol: 'DON',
          name: 'Dondon Utility',
          price: instance.donPrice,
          image: instance.donImage,
        };
      }
    } catch (error: any) {
      return Error(error || 'balanceOfRepo error occurred.');
    }
  }

  static async totalSupplyRepo() {
    console.log('totalSupplyRepo function was called');
    const instance = new DONRepository();
    try {
      const assetInfo: any = await api.query.assets.asset(instance.assetId);
      if (assetInfo.toHuman() == null) {
        return Error('No corresponding asset found.');
      }
      const { supply } = assetInfo.toJSON();
      return {
        total_supply: supply,
      };
    } catch (error: any) {
      return Error(error || 'totalSupplyRepo error occurred.');
    }
  }

  static async getAssetMetadataRepo() {
    console.log('getAssetMetadataRepo function was called');
    const instance = new DONRepository();
    try {
      const metadata = await api.query.assets.metadata(instance.assetId);
      return {
        name: metadata.toHuman().name,
        symbol: metadata.toHuman().symbol,
        decimals: metadata.toHuman().decimals,
        image: instance.donImage,
        price: 0,
      };
    } catch (error: any) {
      return Error(error || 'getAssetMetadataRepo error occurred.');
    }
  }
}
