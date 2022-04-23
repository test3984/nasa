import axios, { AxiosResponse } from 'axios';
import launchesDb from './launches.mongo';
import planets from './planets.mongo';
import { HydratedDocument } from 'mongoose';

interface LaunchInfo {
	flightNumber: number;
	launchDate: Date;
	mission: string;
	rocket: string;
	target?: string;
	customers: string[];
	upcoming: boolean;
	success: boolean;
}

type PartialLaunchInfo = Omit<
	LaunchInfo,
	'flightNumber' | 'customers' | 'upcoming' | 'success'
>;

interface SpaceXApiLaunch {
	name: string;
	rocket: {
		name: string;
	};
	flight_number: number;
	date_local: string;
	upcoming: boolean;
	success: boolean;
	payloads: {
		customers: string[];
	}[];
}

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_APU_URL = 'https://api.spacexdata.com/v4/launches/query';

async function pupulateLaunches(): Promise<void> {
	const response: AxiosResponse<{ docs: SpaceXApiLaunch[] }> = await axios.post(
		SPACEX_APU_URL,
		{
			query: {},
			options: {
				pagination: false,
				populate: [
					{
						path: 'rocket',
						select: {
							name: 1,
						},
					},
					{
						path: 'payloads',
						select: {
							customers: 1,
						},
					},
				],
			},
		}
	);

	if (response.status !== 200) {
		throw new Error('Failed to fetch SpaceX data');
	}

	const mappedLaunchData: LaunchInfo[] = response.data.docs.map((apiLaunch) => ({
		flightNumber: apiLaunch.flight_number,
		mission: apiLaunch.name,
		rocket: apiLaunch.rocket.name,
		customers: apiLaunch.payloads.map((payload) => payload.customers).flat(),
		launchDate: new Date(apiLaunch.date_local),
		upcoming: apiLaunch.upcoming,
		success: apiLaunch.success,
	}));

	mappedLaunchData.forEach(async (launch) => {
		await saveLaunch(launch);
	});
}

export async function loadLaunchData(): Promise<void> {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat',
	});

	if (firstLaunch) {
		console.log('Launch data already loaded');
	} else {
		await pupulateLaunches();
	}
}

export async function abortLaunchById(id: number): Promise<LaunchInfo | null> {
	const launchToBeAborted = await findLaunch({ flightNumber: id });

	if (!launchToBeAborted) {
		return null;
	}

	launchToBeAborted.upcoming = false;
	launchToBeAborted.success = false;

	await launchToBeAborted.save();
	return launchToBeAborted;
}

async function findLaunch(filter: {
	[key: string]: any;
}): Promise<HydratedDocument<LaunchInfo> | null> {
	return await launchesDb.findOne(filter);
}

async function getLatestFlightNumber(): Promise<number> {
	const latestLaunch = await launchesDb.findOne().sort('-flightNumber');
	return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
}

export async function getAllLaunches(skip: number, limit: number): Promise<LaunchInfo[]> {
	return await launchesDb
		.find({}, { _id: 0, __v: 0 })
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit);
}

async function saveLaunch(launch: LaunchInfo) {
	await launchesDb.findOneAndUpdate(
		{
			flightNumber: launch.flightNumber,
		},
		launch,
		{ upsert: true }
	);
}

export async function scheduleNewLaunch(launch: PartialLaunchInfo): Promise<LaunchInfo> {
	const planet = await planets.findOne({ keplerName: launch.target });

	if (!planet) {
		throw new Error('Planet not found');
	}

	const newLanch: LaunchInfo = {
		...launch,
		flightNumber: (await getLatestFlightNumber()) + 1,
		customers: ['NASA'],
		upcoming: true,
		success: true,
	};

	await saveLaunch(newLanch);
	return newLanch;
}
