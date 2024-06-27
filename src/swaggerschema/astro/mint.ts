// Schema for getting NFTs
export const mint = {
    summary: 'Mint ASTRO token',
    tags: ['Astro Economy Token'],
    description: 'Schema for minting ASTRO token.',
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
            to: { type: 'string' },
            value: { type: 'number' },
        },
        required: [
            'to',
            'value',
        ],
    },
    // Response schema
    response: {
        200: {
            description: 'Success response after minting token.',
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