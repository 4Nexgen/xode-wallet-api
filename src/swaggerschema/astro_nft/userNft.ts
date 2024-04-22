// Schema for getting user NFTs
export const schemaGetUserNft = {
    summary: 'Get user NFTs',
    tags: ['AstroChibbi NFT'],
    description: 'Schema for getting user NFTs by wallet address. ',
    // Request body schema
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
            description: 'Succesful response getting NFTs from player',
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
