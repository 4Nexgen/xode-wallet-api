// Schema for getting user NFTs
export const user_token_balance = {
    summary: 'Get user balance on each token.',
    tags: ['Chain'],
    description: 'Schema for getting user token balances. ',
    // headers: {
    //     type: 'object',
    //     properties: {
    //       'Websocket': { 
    //         type: 'string',
    //         enum: [
    //             'wss://testrpcnodea01.xode.net/aRoyklGrhl9m2LlhX8NP/rpc',
    //             'wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc', 
    //         ]
    //       }
    //     },
    // },
    // Request body schema
    query: {
        type: 'object',
        properties: {
            currency: { type: 'string' },
        },
    },
    params: {
        type: 'object',
        properties: {
            wallet_address: { type: 'string' },
        },
        required: ['wallet_address'],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response getting balance of each tokens',
            type: 'object',
            properties: {
                tokens: { 
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            balance: { type: 'number' },
                            symbol: { type: 'string' },
                            name: {type: 'string' },
                            price: { type: 'string' },
                            image: { type: 'string' },
                        }
                    },
                },
                currency: { type: 'string' },
                rate: { type: 'string' },
                total: { type: 'string' },
            },
        },
        // Response schema for unspecified code
        default: {
            description: 'Default response',
            type: 'object',
            properties: {
                status: { type: 'number' },
                message: { type: 'string' },
            },
        }
    },
};
