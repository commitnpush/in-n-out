import express from "express";
import multer from "multer";
import fs from "fs";
import Account from "../models/account";

const router = express.Router();

var upload = multer({ dest: "upload/profile" });

/**
 * Profile Image UPLOAD : POST /api/account/uplaod
 */

router.post("/upload", upload.single("profile_img"), (req, res) => {
  if (typeof req.file === "undefined") {
    fs.copyFile(
      "upload/profile/default.png",
      "upload/profile/" + req.body.username,
      error => {
        if (error) throw error;
        res.json({
          success: true
        });
      }
    );
    return;
  }
  fs.rename(
    "upload/profile/" + req.file.filename,
    "upload/profile/" + req.body.username,
    error => {
      if (error) throw error;
      res.json({
        success: true
      });
    }
  );
});

/*
  Account REGISTER : POST /api/account/register
*/

router.post("/register", async (req, res) => {
  console.log(req.body.account);
  req.body = req.body.account;

  //CHECK USERNAME FORMAT
  let re = /^[A-Za-z0-9]{4,15}$/;
  if (!re.test(req.body.username)) {
    return res.status(400).json({
      property: "username",
      msg: "올바르지 못한 아이디 형식 : 알파벳 + 숫자, 4글자 이상 15글자 이하"
    });
  }

  //CHECK USERNAME EXIST
  let account = null;
  try {
    account = await Account.findOne({ username: req.body.username });
  } catch (error) {
    throw error;
  }

  if (account) {
    return res.status(409).json({
      property: "username",
      msg: "이미 존재하는 아이디"
    });
  }

  //CHECK PASSWORD FORMAT
  if (
    typeof req.body.password !== "string" ||
    req.body.password.length < 4 ||
    req.body.password.length > 15
  ) {
    return res.status(400).json({
      property: "password",
      msg: "올바르지 못한 비밀번호 형식 : 4글자 이상 15글자 이하"
    });
  }

  if (req.body.password !== req.body.password_check) {
    return res.status(400).json({
      property: "password_check",
      msg: "비밀번호와 비밀번호 재입력이 다름"
    });
  }

  //CHECK TYPE FORMAT
  if (typeof req.body.type !== "boolean") {
    return res.status(400).json({
      property: "type",
      msg: "올바르지 못한 관리자/직원 구분"
    });
  }

  //IF MANAGER
  if (req.body.type) {
    //CHECK IP FORMAT
    const ipRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    if (typeof req.body.ip !== "string" || !ipRegex.test(req.body.ip)) {
      return res.status(400).json({
        property: "ip",
        msg: "올바르지 못한 아이피"
      });
    }

    //CREATE ACCOUNT
    const newAccount = new Account({
      username: req.body.username,
      password: req.body.password,
      type: req.body.type,
      ip: req.body.ip
    });

    newAccount.password = newAccount.generateHash(newAccount.password);

    //SAVE IN THE DATABASE
    newAccount.save(err => {
      if (err) throw err;
      return res.json({ success: true });
    });
    return;
  }

  //IF NOT MANAGER
  if (typeof req.body.employee_info === "undefined") {
    return res.status(400).json({
      property: "employee_info",
      msg: "올바르지 못한 요청"
    });
  }

  //CHECK MANAGER FORMAT
  if (typeof req.body.employee_info.manager !== "string") {
    return res.status(400).json({
      property: "manager",
      msg: "올바르지 못한 요청"
    });
  }

  //CHECK MANAGER EXIST
  let manager = null;
  try {
    manager = await Account.findOne({
      username: req.body.employee_info.manager
    });
  } catch (error) {
    throw error;
  }

  if (!manager || !manager.type) {
    return res.status(409).json({
      property: "manager",
      msg: "존재하지 않은 관리자 아이디"
    });
  }

  //CHECK employee_info.is_free FORMAT
  if (typeof req.body.employee_info.is_free !== "boolean") {
    return res.status(400).json({
      property: "is_free",
      msg: "올바르지 못한 요청"
    });
  }

  //IF NOT FREE ATTENDANCE
  if (!req.body.employee_info.is_free) {
    //CHECK employee_info.in FORMAT
    if (typeof req.body.employee_info.in !== "string") {
      return res.status(400).json({
        property: "in",
        msg: "올바르지 못한 요청"
      });
    }

    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(req.body.employee_info.in)) {
      return res.status(400).json({
        property: "in",
        msg: "올바르지 못한 출근시간"
      });
    }

    //CHECK employee_info.out FORMAT
    if (typeof req.body.employee_info.out !== "string") {
      return res.status(400).json({
        property: "out",
        msg: "올바르지 못한 요청"
      });
    }

    if (!timeRegex.test(req.body.employee_info.out)) {
      return res.status(400).json({
        property: "out",
        msg: "올바르지 못한 퇴근시간"
      });
    }
  } else {
    //CHECK TIME FORMAT
    if (
      typeof req.body.employee_info.duty !== "number" ||
      req.body.employee_info.duty < 10 ||
      req.body.employee_info.duty > 1200
    ) {
      return res.status(400).json({
        property: "duty",
        msg: "올바르지 못한 근무시간 : 30분 이상 1200분 이하"
      });
    }
  }

  //CREATE ACCOUNT
  const newAccount = new Account({
    username: req.body.username,
    password: req.body.password,
    type: req.body.type,
    employee_info: {
      is_free: req.body.employee_info.is_free,
      in: req.body.employee_info.in,
      out: req.body.employee_info.out,
      duty: req.body.employee_info.duty,
      manager: req.body.employee_info.manager
    },
    ip: manager.ip
  });

  newAccount.password = newAccount.generateHash(newAccount.password);

  //SAVE IN THE DATABASE
  newAccount.save(err => {
    if (err) throw err;
    return res.json({ success: true });
  });
});

router.post("/login", async (req, res) => {
  //CHECK USERNAME AND PASSWORD FORMAT
  if (
    typeof req.body.username !== "string" ||
    typeof req.body.password !== "string"
  ) {
    return res.status(400).json({
      msg: "올바르지 못한 요청"
    });
  }

  let account = null;
  try {
    account = await Account.findOne({ username: req.body.username });
  } catch (error) {
    throw error;
  }

  //CHECK USERNAME EXISIT
  if (!account) {
    return res.status(401).json({
      msg: "존재하지 않는 아이디",
      property: "username"
    });
  }

  //CHECK PASSWORD CORRECT

  if (!account.validateHash(req.body.password)) {
    return res.status(401).json({
      msg: "비밀번호 불일치",
      property: "password"
    });
  }

  //UPDATE SESSION
  req.session.loginInfo = {
    _id: account._id,
    username: account.username,
    type: account.type,
    employee_info: account.type ? undefined : account.employee_info
  };

  //RETURN SUCCESS
  return res.json({
    type: account.type,
    employee_info: account.type ? undefined : account.employee_info,
    success: true
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(error => {
    if (error) throw error;
    res.json({
      success: true
    });
  });
});

router.get("/info", (req, res) => {
  if (typeof req.session.loginInfo === "undefined") {
    return res.status(401).send();
  }

  res.json(req.session.loginInfo);
});

export default router;
