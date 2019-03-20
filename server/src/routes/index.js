import express from "express";
import account from "./account";
import history from "./history";
import manage from "./manage";

const router = express.Router();

router.use("/account", account);
router.use("/history", history);
router.use("/manage", manage);

export default router;
