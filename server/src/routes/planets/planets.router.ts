import { Router } from 'express';
import { httpGetAllPlanets } from './planets.controller';

export const planetsRouter = Router();

planetsRouter.get('/', httpGetAllPlanets);
