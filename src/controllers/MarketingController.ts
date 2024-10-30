import { FastifyReply, FastifyRequest } from 'fastify';
import WebsocketHeader from '../modules/WebsocketHeader';
import MarketingRepository from './../repositories/MarketingRepository'
import { getAccountData } from '../services/accountService';
import cron, { ScheduledTask } from 'node-cron';

let job: ScheduledTask;
let isJobRunning: boolean = false;
let lastEndTimestamp: number = 1730181309000; // Tuesday, October 29, 2024 1:55:09

export const manualController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	try {
		const query = request.query as { start: string, end: string };
		if (!query || !query.start || !query.end) return reply.badRequest('Missing or invalid query.');
		WebsocketHeader.handleWebsocket(request);
		let account = await getAccountData(Number(query.start), Number(query.end));
		if (account instanceof Error) throw account;
		account = Array.from(new Set(account));
		if (Array.isArray(account) && account.length <= 0) {
			return reply.status(204).send();
		}
		const result = await MarketingRepository.sendTokenRepo(account);
		if (result instanceof Error) throw result;
		return await reply.send(result);
	} catch (error: any) {
		reply.status(500).send('Internal Server Error: ' + error);
	}
};

export const startController = async (
  	request: FastifyRequest,
  	reply: FastifyReply
) => {
	try {
		WebsocketHeader.handleWebsocket(request);
		if (!job) {
			job = cron.schedule('0 * * * *', async () => { // 0 * * * * call every hour
				const now = Date.now();
				console.log(`${now}: Running a task`)
				const startTimestamp = lastEndTimestamp;
				let account = await getAccountData(startTimestamp, now);
				if (account instanceof Error) {
					job.stop();
					isJobRunning = false;
					throw account;
				}
				account = Array.from(new Set(account));
				if (account.length > 0) {
					const result = await MarketingRepository.sendTokenRepo(account);
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