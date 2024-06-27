// Schema for getting NFTs
export const burn = {
    summary: 'Burn XAV token',
    tags: ['Xaver Utility Token'],
    description: 'Schema for burning XAV token.',
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
            value: { type: 'number' },
        },
        required: [
            'from',
            'value',
        ],
    },
    // Response
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