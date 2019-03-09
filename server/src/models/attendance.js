import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Attendance = new Schema({
	username: String,
	type: Number,
	in: String,
	out: String,
	created: { type: Date, default: Date.now }
});

export default mongoose.model('attendance', Attendance);
