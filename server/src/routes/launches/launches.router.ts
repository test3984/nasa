import { Router } from 'express';
import {
	httpGetAllLaunches,
	httpPostNewLaunch,
	httpAbortLaunch,
} from './launches.controller';

export const launchesRouter = Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpPostNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);
