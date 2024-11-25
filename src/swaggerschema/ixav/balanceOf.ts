// Schema for getting NFTs
export const balanceOf = {
    summary: 'Get IXAV balance of the account',
    tags: ['Private XAV Token'],
    description: 'Schema for getting IXAV balance of the account.',
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
    params: {
        type: 'object',
        properties: {
            account: { type: 'string' }
        },
        required: [
            'account'
        ],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Success response after getting balance.',
            type: 'object',
            properties: {
                balance: { type: 'string' },
                symbol: { type: 'string' },
                name: {type: 'string' },
                price: { type: 'string' },
                image: { type: 'string' },
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
    security: [
        {
          "apiKey": []
        }
    ]
};