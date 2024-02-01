// Schema for updating NFT
export const schemaPutUpdate = {
    summary: 'Update an NFT',
    tags: ['AstroChibbi NFT: Send Transaction'],
    description: 'Schema for updating NFT.',
    // Request parameters schema
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' },
        },
        required: ['id'],
    },
    // Request body schema
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            collection: { type: 'string' },
            description: { type: 'string' },
            image_path: { type: 'string' },
            price: { type: 'number' },
            is_for_sale: { type: 'boolean' },
            astro_type: { type: 'string' }
        },
        required: [
            'name',
            'category',
            'collection',
            'description',
            'image_path',
            'price',
            'is_for_sale',
            'astro_type',
        ],
    },
    // Response schema for success
    response: {
        200: {
            description: 'Successful response after updating NFT',
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
