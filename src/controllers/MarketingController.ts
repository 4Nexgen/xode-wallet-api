import { FastifyReply, FastifyRequest } from 'fastify';
import WebsocketHeader from '../modules/WebsocketHeader';
import MarketingRepository from './../repositories/MarketingRepository'
import { getAccountData } from '../services/accountService';
import { marketingAuth } from '../services/authService';
import cron, { ScheduledTask } from 'node-cron';
import {
	IReadMarketingWalletsQuery,
	ISendTokenFeedbackBody
} from '../schemas/MarketingSchemas';

let job: ScheduledTask;
let isJobRunning: boolean = false;
let lastEndTimestamp: number = 1730181309000; // Tuesday, October 29, 2024 1:55:09

export const manualController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	try {
		const isValid = await marketingAuth(request);
		if (!isValid) return reply.unauthorized('Access unauthorized.');
		const token = (request.headers.authorization as string).slice(7);
		const query = request.query as { start: string, end: string };
		if (!query || !query.start || !query.end) return reply.badRequest('Missing or invalid query.');
		WebsocketHeader.handleWebsocket(request);
		let account = await getAccountData(token, Number(query.start), Number(query.end));
		if (account instanceof Error) throw account;
		account = Array.from(new Set(account));
		if (Array.isArray(account) && account.length <= 0) {
			return reply.send({ count: account.length });
		}
		const result = await MarketingRepository.sendTokenRepo(account, token);
		if (result instanceof Error) throw result;
		return reply.send({ count: account.length });
	} catch (error: any) {
		reply.status(500).send('Internal Server Error: ' + error);
	}
};

export const startController = async (
  	request: FastifyRequest,
  	reply: FastifyReply
) => {
	try {
		const isValid = await marketingAuth(request);
		if (!isValid) return reply.unauthorized('Access unauthorized.');
		const token = (request.headers.authorization as string).slice(7);
		WebsocketHeader.handleWebsocket(request);
		if (!job) {
			job = cron.schedule('* * * * *', async () => { // 0 * * * * call every hour
				const now = Date.now();
				const startTimestamp = lastEndTimestamp;
				let account = await getAccountData(token, startTimestamp, now);
				if (account instanceof Error) {
					job.stop();
					isJobRunning = false;
					throw account;
				}
				account = Array.from(new Set(account));
				if (account.length > 0) {
					const result = await MarketingRepository.sendTokenRepo(account, token);
					if (result instanceof Error) {
						job.stop();
						isJobRunning = false;
						throw result;
					}
					lastEndTimestamp = now;
					console.log(`${now}: List of wallets - ${account}`);
				} else {
					lastEndTimestamp = now;
					console.log(`${now}: No accounts`);
				}
			});
			job.start();
			isJobRunning = true;
			reply.send({ message: 'Scheduled job started successfully.' });
		} else if (!isJobRunning) {
            job.start();
            isJobRunning = true;
            reply.send({ message: 'Scheduled job resumed successfully.' });
        } else {
            reply.send({ message: 'Scheduled job is already running.' });
        }
	} catch (error: any) {
		if (job) job.stop();
		isJobRunning = false;
		reply.status(500).send('Internal Server Error: ' + error);
	}
};

export const pauseController = async (
	request: FastifyRequest,
	reply: FastifyReply
  ) => {
	try {
		const isValid = await marketingAuth(request);
		if (!isValid) return reply.unauthorized('Access unauthorized.');
		WebsocketHeader.handleWebsocket(request);
		if (job && isJobRunning) {
            job.stop();
            isJobRunning = false;
            reply.send({ message: 'Scheduled job paused successfully.' });
        } else {
            reply.send({ message: 'Scheduled job is not running or already paused.' });
        }
	} catch (error: any) {
	  	reply.status(500).send('Internal Server Error: ' + error);
	}
};

export const statusController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        return reply.send({ running: job !== undefined && isJobRunning });
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};

export const marketingWalletController = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const query = request.query as Partial<IReadMarketingWalletsQuery>;
		if (!query || 
			!query.page ||
			!query.entry
		) {
			return reply.badRequest("Missing or invalid required query: 'page', 'entry'.");
		}
        const result = await MarketingRepository.getMarketWallets(query);
        if (result instanceof Error) {
            throw result;
        }
        return reply.send({ data: result });
    } catch (error: any) {
        reply.status(500).send('Internal Server Error: ' + error);
    }
};


export const marketingFeedbackController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	try {
		const isValid = await marketingAuth(request);
		if (!isValid) return reply.unauthorized('Access unauthorized.');
		const body = request.body as ISendTokenFeedbackBody;
		if (!body || !body.address || !body.feedback_id) {
            return reply.badRequest("Invalid request body.");
        }
		WebsocketHeader.handleWebsocket(request);
		const token = (request.headers.authorization as string).slice(7);
		const result = await MarketingRepository.sendTokenByFeedbackRepo(body, token);
		if (result instanceof Error) throw result;
		return reply.send(result);
	} catch (error: any) {
		reply.status(500).send('Internal Server Error: ' + error);
	}
};