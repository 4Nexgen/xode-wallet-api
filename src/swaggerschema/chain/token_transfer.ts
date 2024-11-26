// Schema for getting user NFTs
export const token_transfer = {
    summary: 'Transfer an XON token that returns TX',
    tags: ['Chain'],
    description: 'Schema for transferring token and return tx to be signed. ',
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
    body: {
        type: 'object',
        properties: {
            target: { type: 'string' },
            value: { type: 'number' },
        },
        required: ['target', 'value'],
    },
    // Response schema
    response: {
        200: {
            description: 'Returns hash to be signed and submitted on /chain/extrinsic/submit.',
            type: 'object',
            properties: {
                hash: { type: 'string' },
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
