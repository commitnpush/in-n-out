import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

const Account = new Schema({
  username: String,
  password: String,
  type: Boolean,
  employee_info: {
    is_free: Boolean,
    in: String,
    out: String,
    duty: Number,
    manager: String
  },
  ip: String,
  created: { type: Date, default: Date.now },
  histories: []
});

//generate hash
Account.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, 8);
};

//compares the password
Account.methods.validateHash = function(password) {
  return bcrypt.compareSync(password, this.password);
};

export default mongoose.model("account", Account);
