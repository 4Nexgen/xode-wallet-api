// Schema for getting user NFTs
export const circulating_supply = {
    summary: 'Get circulating supply.',
    tags: ['Chain'],
    description: 'Schema for getting circulating supply of tokens. ',
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
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response getting circulating supply of tokens',
            type: 'object',
            properties: {
                circulatingSupply: { type: 'number' },
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
