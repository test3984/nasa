import http from 'http';
import 'dotenv/config';
import { connect } from './services/mongo';
import expressApp from './app';
import { loadPlanets } from './models/planets.model';
import { loadLaunchData } from './models/launches.model';

const PORT = process.env.PORT || 8000;

(async () => {
	await connect();
	await loadPlanets();
	await loadLaunchData();

	const server = http.createServer(expressApp);
	server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
})();
