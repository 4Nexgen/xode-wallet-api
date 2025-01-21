// Schema for getting NFTs
export const totalSupply = {
    summary: 'Get total supply of MPC token',
    tags: ['Manny Pacquiao Coin'],
    description: 'Schema for getting total supply of MPC token.',
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
        properties: {},
        required: [],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Success response after getting total supply.',
            type: 'object',
            properties: {
                total_supply: { type: 'number' },
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