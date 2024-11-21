import { ContractPromise } from '@polkadot/api-contract';
import { api } from './InitializeAPI';
import '@polkadot/api-augment';

export default class TXRepository {
    static getContract = (abi: any, contractAddress: string) => {
        try {
            const contract = new ContractPromise(api, abi, contractAddress);
            return contract;
        } catch (error: any) {
            console.error(error);
            return undefined;
        }
    }
    
    static sendApiTransaction = async (
        pallet: any,
        method: any,
        owner: any,
        params: any,
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                const txResult = this.constructChainExtrinsicTransaction(pallet, method, params);
                if (txResult instanceof Error) {
                    return reject(txResult);
                }
                const dryRunResult = await this.dryRunTransaction(txResult, owner);
                if (!dryRunResult || dryRunResult instanceof Error) {
                    return reject(dryRunResult);
                }
                const tx = api.tx[pallet][method](
                ...params
                )
                await tx.signAndSend(owner, { nonce: -1 }, async (result: any) => {
                    if (result.dispatchError) {
                        if (result.dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                            const { docs, name, section } = decoded;
                            reject(`${section}.${name}: ${docs.join(' ')}`);
                        } else {
                            console.log(result.dispatchError.toString());
                            reject(result.dispatchError.toString());
                        }
                    } else if (result.status.isInBlock) {
                        resolve({
                            status: 200,
                            message: `${method} in block`,
                            data: {
                                isFinalized: result.status.isFinalized,
                                blockHash: result.status.asInBlock.toHex(),
                            },
                        });
                    }
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }
    
    static sendContractTransaction = async (
        contract: any,
        method: any,
        owner: any,
        params: any,
        instance: any,
        storageDepositLimit = null
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dryRunResult = await this.dryRunContract(contract, method, owner, params, instance, storageDepositLimit);
                let tx: any;
                if (dryRunResult instanceof Error) {
                    return reject(dryRunResult);
                } else {
                    tx =  contract.tx[method](
                        {
                            storageDepositLimit,
                            gasLimit: api?.registry.createType('WeightV2', {
                                refTime: parseInt(dryRunResult.gasRequired.refTime.replace(/,/g, ''), 10),
                                proofSize: parseInt(dryRunResult.gasRequired.proofSize.replace(/,/g, ''), 10),
                            }),
                        },
                        ...params
                    );
                }
                await tx.signAndSend(owner, { nonce: -1 }, async (result: any) => {
                    if (result.dispatchError) {
                        if (result.dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                            const { docs, name, section } = decoded;
                            console.log(`${section}.${name}: ${docs.join(' ')}`);
                            reject(`${section}.${name}: ${docs.join(' ')}`);
                        } else {
                            console.log(result.dispatchError.toString());
                            reject(result.dispatchError.toString());
                        }
                    } else if (result.status.isInBlock) {
                        resolve({
                            status: 200,
                            message: `${method} in block`,
                            data: {
                                isFinalized: result.status.isFinalized,
                                blockHash: result.status.asInBlock.toHex(),
                            },
                        });
                    } 
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    static executeExtrinsic = async (
        executeExtrinsic: any,
        rawExtrinsic: any,
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dryRunResult = await this.dryRunExtrinsic(rawExtrinsic);
                if (dryRunResult instanceof Error) {
                    return reject(dryRunResult);
                } else if (!dryRunResult || dryRunResult.isErr) {
					return reject(dryRunResult instanceof Object ? dryRunResult.toHuman() : dryRunResult);
				}
                await executeExtrinsic.send(async (result: any) => {
                    if (result.dispatchError) {
                        if (result.dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                            const { docs, name, section } = decoded;
                            reject(`${section}.${name}: ${docs.join(' ')}`);
                        } else {
                            console.log(result.dispatchError.toString());
                            reject(result.dispatchError.toString());
                        }
                    } else if (result.status.isInBlock) {
                        resolve({
                            status: 200,
                            message: `Transaction in block`,
                            data: {
                                isFinalized: result.status.isFinalized,
                                blockHash: result.status.asInBlock.toHex(),
                            },
                        });
                    }
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }
    
    static sendContractQuery = async (
        contract: any,
        method: any,
        params: any,
        instance: any
    ) => {
        try {
            const gasLimit = api.registry.createType(
                'WeightV2',
                api.consts.system.blockWeights['maxBlock']
            );
            const { output } = await contract.query[method](
                instance.contractAddress,
                { gasLimit: gasLimit },
                ...params
            );
            return output?.toJSON();
        } catch (error) {
            return error;
        }
    }

    static dryRunContract = async (
        contract: any,
        method: any,
        owner: any,
        params: any,
        instance: any,
        storageDepositLimit: any
    ) => {
        try {
            const { gasRequired, storageDeposit, result, output } = await contract.query[method](
                owner.address,
                {
                    gasLimit: api?.registry.createType('WeightV2', {
                        refTime: instance.REFTIME,
                        proofSize: instance.PROOFSIZE,
                    }),
                    storageDepositLimit,
                },
                ...params
            );
            if (result.isErr) {
                let error: any;
                if (result.asErr.isModule) {
                    const dispatchError = api.registry.findMetaError(result.asErr.asModule)
                    error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
                } else {
                    error = result.asErr.toString()
                }
                return Error(error);
            }
            if (result.isOk) {
                const flags = result.asOk.flags.toHuman()
                if (flags.includes('Revert')) {
                    const type = contract.abi.messages[5].returnType
                    const typeName = type?.lookupName || type?.type || ''
                    const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()
                    return Error(error ? (error as any).Err : 'Revert')
                }
            }
            return { 
                gasRequired: gasRequired.toHuman(), 
                storageDeposit: storageDeposit.toHuman(), 
                result: result.toHuman(),
                output: output.toHuman(),
            };
        } catch (error: any) {
            return Error(error);
        }
    }

    static constructContractExtrinsicTransaction = async (
        contract: any,
        method: any,
        params: any,
        option: any,
    ) => {
        try {
            const options: any = {
                storageDepositLimit: null,
                gasLimit: api.registry.createType('WeightV2', {
                  refTime: parseInt(option.gasRequired.refTime.replace(/,/g, ''), 10),
                  proofSize: parseInt(option.gasRequired.proofSize.replace(/,/g, ''), 10),
                }),
            };
            const tx = contract.tx[method](
                options,
                ...params
            )
            return tx;
        } catch (error: any) {
            return Error(error);
        }
    }

    static constructChainExtrinsicTransaction = (
        pallet: any,
        method: any,
        params: any,
    ) => {
        try {
            const tx = api.tx[pallet][method](
                ...params
            )
            return tx;
        } catch (error: any) {
            return Error(error);
        }
    }

    static dryRunTransaction = async (
        tx: any,
        owner: any
    ) => {
        try {
            const result = await tx.dryRun(owner);
            return result;
        } catch (error: any) {
            return Error(error);
        }
    }

    static dryRunExtrinsic = async (
        rawExtrinsic: any,
    ) => {
        try {
            const result = await api.rpc.system.dryRun(rawExtrinsic);
            return result;
        } catch (error: any) {
            return Error(error);
        }
    }
}