import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import planets from './planets.mongo';

interface PlanetData {
	kepid: string;
	kepoi_name: string;
	koi_disposition: string;
	koi_pdisposition: string;
	koi_insol: string;
	koi_prad: string;
	kepler_name: string;
}

export async function getAllPlanets(): Promise<PlanetData[]> {
	return await planets.find({}, { __v: 0, _id: 0 });
}

function isHabitatablePlanet(planet: PlanetData): boolean {
	return (
		planet.koi_disposition === 'CONFIRMED' &&
		+planet.koi_insol > 0.36 &&
		+planet.koi_insol < 1.11 &&
		+planet.koi_prad < 1.6
	);
}

export function loadPlanets(): Promise<void> {
	return new Promise((res, rej) => {
		createReadStream('kepler_data.csv')
			.pipe(parse({ comment: '#', columns: true }))
			.on('data', async (data: PlanetData) => {
				if (isHabitatablePlanet(data)) {
					savePlanet(data);
				}
			})
			.on('error', (_) => {
				rej();
			})
			.on('end', () => {
				res();
			});
	});
}

async function savePlanet(planet: PlanetData): Promise<void> {
	try {
		await planets.updateOne(
			{ keplerName: planet.kepler_name },
			{ keplerName: planet.kepler_name },
			{ upsert: true }
		);
	} catch (err) {
		console.error(err);
	}
}
