import InitializeAPI from './modules/InitializeAPI';
// import WebsocketHeader from './modules/WebsocketHeader';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import FastifyJwt from '@fastify/jwt';
import FastifyCors from '@fastify/cors';
import * as superagent from 'superagent';
export type AppOptions = {
  	// Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify: any,
	opts
): Promise<void> => {
  	// Place here your custom code!
	// require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
	const fs = require('fs');
	const dotenv = require('dotenv');
	dotenv.config({ path: '.env' });
	const envFile = `.env.${process.env.NODE_ENV || 'staging'}`;
	if (fs.existsSync(envFile)) {
		const envConfig = dotenv.parse(fs.readFileSync(envFile));
		for (const key in envConfig) {
			process.env[key] = envConfig[key];
		}
	}
	await cryptoWaitReady();
	const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS as string).split(',');
	fastify.register(FastifyCors, {
		origin: ALLOWED_DOMAINS,
	});

	fastify.register(FastifyJwt, {
		secret: process.env.APP_AUTH_SECRET_KEY as string,
	});

	fastify.decorate(
		'authenticate',
		async function (request: FastifyRequest, reply: FastifyReply) {
			if (request.headers.apikey !== process.env.APIKEY) {
				reply.code(401).send({
				code: 'UNAUTHORIZED',
				message: `Wrong API key or missing`
				})
				return null
			}

			const authHeader = request.headers.authorization;
			// endpoint = request.url;
			if (!authHeader) {
				reply.unauthorized("Missing header: 'Authorization'");
			}

			const res = await superagent
				.get(process.env.AUTH_SERVICE_ENDPOINT as string)
				.set('Authorization', authHeader as string);

			if (res.status === 500) {
				reply.internalServerError(
				'An error occurred while trying to contact the authentication server.'
				);
			}

			if (res.status === 400) {
				reply.badRequest(res.body.message);
			}

			if (res.status === 401) {
				reply.unauthorized('Access unauthorized.');
			}

			if (res.status === 403) {
				reply.forbidden('Access forbidden.');
			}
		}
	);

	// const sa = require('fastify')();
	// let endpoint = "";
	await fastify.register(require('@fastify/swagger'), {
		routePrefix: '/docs',
		exposeRoute: true,
		hideUntagged: true,
		swagger: {
			info: {
				title: 'XODE Wallet',
				description: 'Fastify swagger of XODE to smart contract.\n\n' +
				'\n' + 'AstroChibbi: ' + process.env.ASTROCHIBBI_ADDRESS as string +
				'\n' + 'Energy Capsule: ' + process.env.ASTRO_ECONOMY_ADDRESS as string +
				'\n' + 'Astro Economy: ' + process.env.ASTRO_ENERGY_ADDRESS as string +

				'\n\n' + 'Astro Economy: ' + process.env.WS_PROVIDER_ENDPOINT,
				
				version: '0.1.3'
			},
			externalDocs: {
				url: 'https://docs.google.com/document/d/1n-jd_0BXUCzcrUL9df1_uUgGUpkkDADLMRw_fgx41ko',
				description: 'Swagger Documentation'
			},
			host: String,
			schemes: [ String ],
			consumes: ['application/json'],
			produces: ['application/json'],
			tags: [
				{ name: 'AstroChibbi NFT', description: 'AstroChibbi NFT related end-points to transact and query on chain\'s smart contract' },
				{ name: 'Astro Economy Token', description: 'ASTRO related end-points to transact and query on chain\'s smart contract' },
				{ name: 'Azkal Meme Token', description: 'AZK related end-points to transact and query on chain\'s asset' },
				{ name: 'Xaver Utility Token', description: 'XAV related end-points to transact and query chain\'s asset' },
				{ name: 'XGame Utility Token', description: 'XGM related end-points to transact and query on chain\'s asset' },
				{ name: 'Chain', description: 'Polkadot JS related end-points to transact and query on blockchain' },
				{ name: 'Private XON Token', description: 'IXON related end-points to transact and query on chain\'s asset' },
				{ name: 'Private XAV Token', description: 'IXAV related end-points to transact and query on chain\'s asset' },
			],
			definitions: {},
			securityDefinitions: {
				apiKey: {
					type: 'apiKey',
					name: 'apiKey',
					in: 'header'
				}
			}
		}
	})

	await fastify.register(require('@fastify/swagger-ui'), {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'none',
			deepLinking: false
		},
		uiHooks: {
			onRequest: function (request: any, reply: any, next: () => void) { next() },
			preHandler: function (request: any, reply: any, next: () => void) { next() }
		},
		staticCSP: true,
		transformStaticCSP: (header: any) => header,
		transformSpecification: (
			swaggerObject: any, 
			request: any, 
			reply: any
		) => { return swaggerObject },
		transformSpecificationClone: true
	})
  
	fastify.addHook('onReady', () => {
		fastify.swagger()
		// console.log(fastify.swagger())
	})

	fastify.ready(async (err: any) => {
		if (err) throw err
		fastify.swagger()
	})

	fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
		// WebsocketHeader.handleWebsocket(request);
		const api = await InitializeAPI.apiInitialization();
		if (api instanceof Error) reply.internalServerError(String(api));
	})
  
	// Do not touch the following lines

	// This loads all plugins defined in plugins
	// those should be support plugins that are reused
	// through your application
	void fastify.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: opts,
	});

	// This loads all plugins defined in routes
	// define your routes in one of these
	void fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: opts,
	});
};
export default app;
export { app, options };
