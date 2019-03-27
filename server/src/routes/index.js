import express from "express";
import account from "./account";
import history from "./history";
import manage from "./manage";
import chat from "./chat";

const router = express.Router();

router.use("/account", account);
router.use("/history", history);
router.use("/manage", manage);
router.use("/chat", chat);

export default router;
