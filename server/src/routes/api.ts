import { Router } from 'express';
import { launchesRouter } from './launches/launches.router';
import { planetsRouter } from './planets/planets.router';

const api = Router();

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

export default api;
