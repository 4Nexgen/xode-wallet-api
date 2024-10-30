import {
	FastifyPluginAsync,
	FastifyReply,
	FastifyRequest
} from 'fastify';
import { 
	manualController,
	startController,
	pauseController,
	statusController,
	marketingWalletController,
} from '../../controllers/MarketingController';

const marketing: FastifyPluginAsync = async (fastify, opts) => {
	fastify.post<{
		Querystring: FastifyRequest;
		Reply: FastifyReply;
	}>(
		'/manual',
		manualController
	);

	fastify.post<{
		Querystring: FastifyRequest;
		Reply: FastifyReply;
	}>(
		'/start',
		startController
	);

	fastify.post<{
		Querystring: FastifyRequest;
		Reply: FastifyReply;
	}>(
		'/pause',
		pauseController
	);

	fastify.get<{
		Querystring: FastifyRequest;
		Reply: FastifyReply;
	}>(
		'/status',
		statusController
	);

	fastify.get<{
		Querystring: FastifyRequest;
		Reply: FastifyReply;
	}>(
		'/',
		marketingWalletController
	);
};

export default marketing;
