import { Request, Response } from 'express';
import {
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById,
} from '../../models/launches.model';
import { getPagination } from '../../services/query';

interface LaunchInfo {
	mission: string;
	rocket: string;
	target: string;
	launchDate: string;
}

interface TypedRequest<T> extends Request {
	body: T;
}

export async function httpGetAllLaunches(
	req: Request<unknown, unknown, unknown, { page?: string; limit?: string }>,
	res: Response
) {
	const { skip, limit } = getPagination(req.query);

	res.json(await getAllLaunches(skip, limit));
}

export async function httpPostNewLaunch(
	req: TypedRequest<Partial<LaunchInfo>>,
	res: Response
) {
	const retrievedData = req.body;

	if (
		!retrievedData.target ||
		!retrievedData.launchDate ||
		!retrievedData.mission ||
		!retrievedData.rocket
	) {
		return res.status(400).json({ error: 'Missing one or more properties' });
	}

	const launch = retrievedData as LaunchInfo;
	const launchDate = new Date(launch.launchDate);

	if (!isNaN(launchDate.valueOf())) {
		const addedLaunch = await scheduleNewLaunch({
			...launch,
			launchDate: new Date(launch.launchDate),
		});
		return res.status(201).json(addedLaunch);
	}

	return res.status(400).json({ error: 'Invalid date given' });
}

export async function httpAbortLaunch(req: Request, res: Response) {
	const launchParam = req.params.id;
	const launchId = +launchParam;

	if (!launchId) {
		return res.status(400).json({ error: 'Invalid launch id' });
	}

	const aborted = await abortLaunchById(launchId);

	if (aborted) {
		return res.status(200).json(aborted);
	}

	return res.status(404).json({ error: 'Launch not found' });
}
