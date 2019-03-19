import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import mongoose from "mongoose";
import api from "./routes";

const app = express();

/* SUPPORT CLIENT SIDE RENDERING */
app.use("/profile", express.static(path.join(__dirname, "../upload/profile")));
app.use(express.static(path.join(__dirname, "../../client/build")));

/* USE SESSION */
app.use(
  session({
    secret: "Pass$1$234",
    resave: false,
    saveUninitialized: true
  })
);

/* MONGODB CONNECTION */
const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => console.log("Connected to mongodb server"));
mongoose.connect("mongodb://localhost/in-n-out");

/* HTTP LOGGING */
app.use(morgan("dev"));

/* USER BODY PARSER*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* API ROUTING */
app.use("/api", api);

/* SUPPORT CLIENT SIDE RENDERING */
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/", "index.html"));
});

/* SERVER ERROR HANDLING */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "서버에러 - 잠시후 다시 시도해 주세요"
  });
});

/* SERVER START */
app.listen(3400, () => console.log("Server is listening on port 3400)"));

module.exports = app;
