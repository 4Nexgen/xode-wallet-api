// Schema for getting user NFTs
export const token_prices = {
    summary: 'Get token prices.',
    tags: ['Chain'],
    description: 'Schema for token prices using currency. ',
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
    // Request params schema
    params: {
        type: 'object',
        properties: {
            currency: { type: 'string' },
        },
        required: [
            'currency',
        ],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response token prices',
            type: 'object',
            properties: {
                currency: { type: 'string' },
                prices: { 
                    type: 'object',
                    properties: {
                        XON: { type: 'number' },
                        AZK: { type: 'number' },
                        XAV: { type: 'number' },
                        XGM: { type: 'number' },
                        IXON: { type: 'number' },
                        IXAV: { type: 'number' },
                        IDON: { type: 'number' },
                        MPC: { type: 'number' },
                        IMPC: { type: 'number' },
                        DON: { type: 'number' },
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
                message: { type: 'string' },
            },
        }
    },
};
