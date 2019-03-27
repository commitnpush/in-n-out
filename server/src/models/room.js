import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Member = new Schema({
  username: { type: String, required: true },
  status: { type: Boolean, default: false }
});

const Message = new Schema({
  writer: { type: String, required: true },
  content: { type: String, default: "" },
  created: { type: Date, default: Date.now }
});

const Room = new Schema({
  manager: { type: String, required: true },
  members: [Member],
  messages: [Message]
});

export default mongoose.model("room", Room);
