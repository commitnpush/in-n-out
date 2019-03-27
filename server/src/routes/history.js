import express from "express";
import History from "../models/history";
import moment from "moment";
const router = express.Router();

router.get("/", async (req, res) => {
  //세션 만료
  if (typeof req.session.loginInfo === "undefined") {
    return res.status(401).json({
      msg: "세션 만료 - 로그인 후 이용 가능."
    });
  }

  let historys = null;
  try {
    historys = await History.find({
      username: req.session.loginInfo.username
    })
      .sort({ created: -1 })
      .exec();
  } catch (error) {
    throw error;
  }

  //처음 로그인 하거나 최근 히스토리가 오늘날짜가 아닐경우

  if (
    historys.length === 0 ||
    moment(historys[0].created) < moment().startOf("day")
  ) {
    const newHistory = new History({
      username: req.session.loginInfo.username,
      in: "",
      out: ""
    });
    try {
      await newHistory.save();
    } catch (error) {
      throw error;
    }
    historys.unshift({
      username: req.session.loginInfo.username,
      in: "",
      out: "",
      created: new Date()
    });
  }
  res.json(historys);
});

router.put("/in", async (req, res) => {
  if (typeof req.session.loginInfo === "undefined") {
    return res.status(401).json({
      msg: "세션 만료 - 로그인 후 이용 가능."
    });
  }
  const inTime = moment().format("HH:mm");
  await History.updateOne(
    {
      username: req.session.loginInfo.username,
      created: {
        $gt: moment()
          .startOf("day")
          .valueOf()
      }
    },
    { in: inTime }
  );
  return res.json({
    in: inTime
  });
});

router.put("/out", async (req, res) => {
  if (typeof req.session.loginInfo === "undefined") {
    return res.status(401).json({
      msg: "세션 만료 - 로그인 후 이용 가능."
    });
  }
  const outTime = moment().format("HH:mm");
  await History.updateOne(
    {
      username: req.session.loginInfo.username,
      created: {
        $gt: moment()
          .startOf("day")
          .valueOf()
      }
    },
    { out: outTime }
  );
  return res.json({
    out: outTime
  });
});

export default router;
