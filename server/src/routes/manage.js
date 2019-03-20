import express from "express";
import Account from "../models/account";
import History from "../models/history";
import moment from "moment";
const router = express();

/**
 * GET EMPLOYEES INFORMATION + HISTROY BY MANAGERID
 * [GET] /api/manage
 */

router.get("/", async (req, res) => {
  const loginInfo = req.session.loginInfo;

  //세션 만료
  if (typeof loginInfo === "undefined") {
    res.status(401).json({
      msg: "로그인이 필요한 서비스 입니다"
    });
    return;
  }

  //관리자 계정이 아님
  if (!loginInfo.type) {
    res.status(403).json({
      msg: "관리자계정으로만 접근 가능한 페이지 입니다"
    });
    return;
  }

  let employees = await Account.find({
    "employee_info.manager": loginInfo.username
  });
  // employees = employees.map(async v => {
  //   v.histories = await History.find({
  //     username: v.username,
  //     created: { $gt: moment().startOf("month") }
  //   });
  //   return v;
  // });

  for (let employee of employees) {
    employee.histories = await History.find({
      username: employee.username,
      created: {
        $gte: moment()
          .startOf("month")
          .valueOf()
      }
    })
      .sort({ created: -1 })
      .exec();
  }
  console.log(employees);
  res.json({
    employees
  });
});

export default router;
