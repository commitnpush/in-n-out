import mongoose from "mongoose";
const Schema = mongoose.Schema;

const History = new Schema({
  username: String,
  in: String,
  out: String,
  created: { type: Date, default: Date.now }
});

export default mongoose.model("history", History);
