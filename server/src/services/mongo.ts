import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/spacex';

mongoose.connection.once('open', () => {
	console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => console.error(err));

export async function connect(): Promise<void> {
	await mongoose.connect(MONGO_URL);
}

export async function disconnect(): Promise<void> {
	await mongoose.disconnect();
}
