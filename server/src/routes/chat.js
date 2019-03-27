import express from "express";
import Account from "../models/account";
import Room from "../models/room";

const router = express.Router();

router.get("/room", async (req, res) => {
  const loginInfo = req.session.loginInfo;
  if (typeof loginInfo === "undefined") {
    res.status(401).json({
      msg: "로그인 후 이용가능"
    });
  }

  let managerName = "";
  if (loginInfo.type) {
    managerName = loginInfo.username;
  } else {
    const account = await Account.findOne({ username: loginInfo.username });
    managerName = account.employee_info.manager;
  }

  const room = await Room.findOne({ manager: managerName });

  res.json({
    success: true,
    room
  });
});

export default router;
