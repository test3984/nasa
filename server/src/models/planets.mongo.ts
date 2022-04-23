import { Schema, model } from 'mongoose';

const planetsSchema = new Schema({
	keplerName: { type: String, required: true },
});

export default model('Planet', planetsSchema);
