import express from "express";
import Account from "../models/account";
import History from "../models/history";
import Room from "../models/room";
import moment from "moment";
const router = express();

/**
 * GET EMPLOYEES INFORMATION + HISTROY BY MANAGERID
 * [GET] /api/manage/employee
 */

router.get("/employee", async (req, res) => {
  const loginInfo = req.session.loginInfo;

  //세션 만료
  if (typeof loginInfo === "undefined") {
    res.status(401).json({
      msg: "로그인이 필요한 서비스"
    });
    return;
  }

  //관리자 계정이 아님
  if (!loginInfo.type) {
    res.status(403).json({
      msg: "관리자계정으로만 접근 가능한 페이지"
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
  res.json({
    employees
  });
});

/**
 * UPDATE EMPLOYEE INFORMATION
 * [PUT] /api/manage/employee
 */

router.put("/employee", async (req, res) => {
  const loginInfo = req.session.loginInfo;

  //세션 만료
  if (typeof loginInfo === "undefined") {
    res.status(401).json({
      msg: "로그인이 필요한 서비스"
    });
    return;
  }

  //관리자 계정이 아님
  if (!loginInfo.type) {
    res.status(403).json({
      msg: "관리자계정으로만 접근 가능한 페이지"
    });
    return;
  }
  const employee = req.body;

  //존재하지 않는 사원
  const account = await Account.findOne({ username: employee.username });
  if (!account) {
    res.status(404).json({
      msg: "존재하지 않는 사원"
    });
    return;
  }

  //사원이 아님
  if (account.type) {
    res.status(404).json({
      msg: "존재하지 않는 사원"
    });
    return;
  }

  //자신이 관리하는 계정이 아님
  if (account.employee_info.manager !== loginInfo.username) {
    res.status(403).json({
      msg: "관리할 수 없는 사원"
    });
    return;
  }

  //수정정보 이상 - 관리자
  if (typeof employee.employee_info.manager !== "string") {
    res.status(400).json({
      property: "manager",
      msg: "올바르지 않은 요청"
    });
    return;
  }
  const manager = await Account.findOne({
    username: employee.employee_info.manager
  });
  if (!manager || !manager.type) {
    res.status(400).json({
      property: "manager",
      msg: "존재하지 않는 관리자"
    });
    return;
  }

  let timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  //수정정보 이상 - 자율출퇴근제
  if (employee.employee_info.is_free) {
    //근무시간
    if (
      typeof employee.employee_info.duty !== "number" ||
      employee.employee_info.duty < 10 ||
      employee.employee_info.duty > 1200
    ) {
      res.status(400).json({
        property: "duty",
        msg: "올바르지 못한 근무시간 : 30분 이상 1200분 이하"
      });
      return;
    }
  } else {
    //수정정보 이상 - 일반출퇴근
    //출근시간

    if (
      typeof employee.employee_info.in !== "string" ||
      !timeRegex.test(employee.employee_info.in)
    ) {
      res.status(400).json({
        property: "in",
        msg: "올바르지 못한 출근시간"
      });
      return;
    }
    //퇴근시간
    if (
      typeof employee.employee_info.out !== "string" ||
      !timeRegex.test(employee.employee_info.out)
    ) {
      res.status(400).json({
        property: "in",
        msg: "올바르지 못한 퇴근시간"
      });
      return;
    }
  }
  const toHistory = employee.histories[0];
  //수정정보이상 - 오늘 출근시간
  if (
    typeof toHistory.in !== "string" ||
    (toHistory.in !== "" && !timeRegex.test(toHistory.in))
  ) {
    res.status(400).json({
      property: "inTime",
      msg: "올바르지 못한 출근한 시간"
    });
    return;
  }
  //수정정보이상 - 오늘 퇴근시간
  if (
    typeof toHistory.out !== "string" ||
    (toHistory.out !== "" && !timeRegex.test(toHistory.out))
  ) {
    res.status(400).json({
      property: "outTime",
      msg: "올바르지 못한 퇴근한 시간"
    });
    return;
  }

  //사원정보 수정
  await Account.updateOne(
    { username: employee.username },
    { $set: { employee_info: employee.employee_info, ip: manager.ip } }
  );

  //오늘날짜 히스토리
  const todayHistory = await History.findOne({
    username: employee.username,
    created: {
      $gt: moment()
        .startOf("day")
        .valueOf()
    }
  });
  //최근히스토리가 오늘만들어진경우 -> 수정
  if (todayHistory) {
    todayHistory.in = employee.histories[0].in;
    todayHistory.out = employee.histories[0].out;
    await todayHistory.save();
  } else {
    //아닌경우 -> 입력
    const newHistory = new History({
      username: employee.username,
      in: employee.histories[0].in,
      out: employee.histories[0].out
    });
    try {
      await newHistory.save();
    } catch (error) {
      throw error;
    }
  }

  //room 정보수정
  if (loginInfo.username !== employee.employee_info.manager) {
    const beforeRoom = await Room.findOne({ manager: loginInfo.username });
    const member = beforeRoom.members.find(
      e => e.username === employee.username
    );
    console.log(member.toString());
    //새로운 방에 추가
    const afterRoom = await Room.findOne({
      manager: employee.employee_info.manager
    });
    beforeRoom.members.pull({ _id: member._id });
    beforeRoom.save();
    afterRoom.members.push(member);
    afterRoom.save();
  }

  res.json({
    success: true,
    updateType: loginInfo.username === employee.employee_info.manager
  });
});
export default router;
