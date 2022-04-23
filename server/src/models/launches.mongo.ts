import { Schema, model } from 'mongoose';

interface LaunchInfo {
	flightNumber: number;
	launchDate: Date;
	mission: string;
	rocket: string;
	target: string;
	customers: string[];
	upcoming: boolean;
	success: boolean;
}
const launchesSchema = new Schema<LaunchInfo>({
	flightNumber: { type: Number, required: true },
	launchDate: { type: Date, required: true },
	mission: { type: String, required: true },
	rocket: { type: String, required: true },
	target: { type: String, required: false },
	customers: [String],
	upcoming: { type: Boolean, required: true },
	success: { type: Boolean, default: true, required: true },
});

export default model('Launch', launchesSchema);
