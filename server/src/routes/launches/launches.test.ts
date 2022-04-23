import app from '../../app';
import { connect, disconnect } from '../../services/mongo';
import request from 'supertest';

beforeAll(async () => {
	await connect();
});

afterAll(async () => {
	await disconnect();
});

describe('Test GET /launches', () => {
	test('It should respond with 200 success', async () => {
		const response = await request(app)
			.get('/v1/launches')
			.expect('Content-Type', /json/)
			.expect(200);
	});
});

describe('Test POST /launch', () => {
	const completeLaunchData = {
		mission: 'USS Enterprise',
		rocket: 'NCC 1701-D',
		target: 'Kepler-62 f',
		launchDate: 'Janurary 4, 2028',
	};

	const launchDataWithoutDate = {
		mission: 'USS Enterprise',
		rocket: 'NCC 1701-D',
		target: 'Kepler-62 f',
	};

	test('It should respond with 201 created', async () => {
		const response = await request(app)
			.post('/v1/launches')
			.send(completeLaunchData)
			.expect('Content-Type', /json/)
			.expect(201);

		const requestDate = new Date(completeLaunchData.launchDate).valueOf();
		const responseDate = new Date(response.body.launchDate).valueOf();

		expect(responseDate).toBe(requestDate);

		expect(response.body).toMatchObject(launchDataWithoutDate);
	});

	test('It should catch missing required properties', async () => {
		const response = await request(app)
			.post('/v1/launches')
			.send(launchDataWithoutDate)
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toStrictEqual({ error: 'Missing one or more properties' });
	});

	test('It should catch invalid dates', async () => {
		const response = await request(app)
			.post('/v1/launches')
			.send({ ...completeLaunchData, launchDate: 'invalid date' })
			.expect('Content-Type', /json/)
			.expect(400);

		expect(response.body).toStrictEqual({ error: 'Invalid date given' });
	});
});
