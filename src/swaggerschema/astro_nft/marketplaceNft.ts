export const schemaPostMarketplace = {
    summary: 'Get an NFT for marketplace',
    tags: ['AstroChibbi NFT'],
    description: 'Schema for getting NFTs for marketplace using collection ID.',
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
            collection_id: { type: 'string' },
        },
        required: ['collection_id'],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Get an NFTs from collection',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    nftTokenId: { type: 'number' },
                    imagePath: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    isForSale: { type: 'boolean' },
                    isEquipped: { type: 'boolean' },
                    category: { type: 'string' },
                    collection: { type: 'string' },
                    astroType: { type: 'string' },
                    rarity: { type: 'string' },
                    network: { type: 'string' },
                    blockchainId: { type: 'string' },
                    collectionId: { type: 'string' },
                    tokenOwner: { type: 'string' },
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
