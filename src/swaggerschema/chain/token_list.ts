// Schema for getting user NFTs
export const token_list = {
    summary: 'Get list of tokens integrated to XODE',
    tags: ['Chain'],
    description: 'Schema for getting list of tokens. ',
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
    // Response schema for success
    response: {
        200: {
            description: 'Succesful response getting list of tokens',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    symbol: { type: 'string' },
                    decimals: { type: 'string' },
                    image: { type: 'string' },
                    price: { type: 'string' },
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
