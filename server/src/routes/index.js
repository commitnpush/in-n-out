import express from "express";
import account from "./account";
import history from "./history";

const router = express.Router();

router.use("/account", account);
router.use("/history", history);

export default router;
