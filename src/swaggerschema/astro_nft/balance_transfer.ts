export const schemaBalanceTransfer = {
    summary: 'Transfer balance from one account to another',
    tags: ['AstroChibbi NFT'],
    description: 'Schema for transferring balance of one account to another.',
    headers: {
        type: 'object',
        properties: {
          'Websocket': { 
            type: 'string',
            enum: [
                'wss://testrpcnodea01.xode.net/aRoyklGrhl9m2LlhX8NP/rpc',
                'wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc', 
            ]
          }
        },
    },
    // Request body schema
    body: {
        type: 'object',
        properties: {
            from: { type: 'string' },
            amount: { type: 'number' }
        },
        required: [
            'from',
            'amount'
        ],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response after transferring balance.',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        isFinalized: { type: 'boolean' },
                        blockHash: { type: 'string' },
                    },
                },
            },
        },
        // Response schema for unspecified code
        default: {
            description: 'Default response',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' }
            },
        }
    },
    security: [
        {
          "apiKey": []
        }
    ]
};

export const schemaReadGasFee = {
    summary: 'Read gas fee of transaction',
    tags: ['NFT: Query Transaction'],
    description: 'Schema for reading gas fee of the transaction.',
    // Request body schema
    body: {
        type: 'object',
        properties: {
            recepient: { type: 'string' },
            sender: { type: 'string' },
            method: { type: 'string' },
            token_id: { type: 'number' }
        },
        required: [
            'recepient',
            'sender',
            'method',
            'token_id'
        ],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response after reading gas fee.',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' },
            },
        },
        // Response schema for unspecified code
        default: {
            description: 'Default response',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' }
            },
        }
    },
    security: [
        {
          "apiKey": []
        }
    ]
};

export const schemaExample = {
    summary: 'Transfer balance from one account to another',
    tags: ['NFT'],
    description: 'Schema for transferring balance of one account to another.',
    // Request body schema
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response after transferring balance.',
            type: 'object',
            properties: {
                block: { 
                    type: 'object',
                    properties: {
                        header: { 
                            type: 'object',
                            properties: {
                                parentHash: { type: 'string' },
                                number: { type: 'string' },
                                stateRoot: { type: 'string' },
                                extrinsicsRoot: { type: 'string' },
                            },
                        },
                        extrinsics: { type: 'string' },
                    },
                },
                blockHasPrev: { type: 'string' },
                blockHash: { type: 'string' },
                blockHeadNumber: { type: 'string' },
                blockNum: { type: 'string' },
                genesisHash: { type: 'string' },
                specN1: { 
                    type: 'object',
                    properties: {
                        specName:  { type: 'string' },
                        implName: { type: 'string' },
                        authoringVersion: { type: 'string' },
                        specVersion: { type: 'string' },
                        implVersion: { type: 'string' },
                        transactionVersion: { type: 'string' },
                        stateVersion: { type: 'string' },
                    },
                },
                specName: { type: 'string' },
                specVersion: { type: 'number' },
                transactionVersion: { type: 'number' },
                decodedTransaction: { 
                    type: 'object',
                    properties: {
                        To:  { type: 'string' },
                        Amount:  { type: 'string' },
                    },
                },
                payloadToSign: { type: 'string' },
                transactionToSubmit: { type: 'string' },
                expectedTxHas: { type: 'string' },
            },
        },
        // Response schema for unspecified code
        default: {
            description: 'Default response',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' }
            },
        }
    },
    security: [
        {
          "apiKey": []
        }
    ]
};

