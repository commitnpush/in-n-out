import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path'
const app = express();

app.use(express.static(path.join(__dirname,'../../client/build')));

/*use session */
app.use(session({
  secret: "Pass$1$234",
  resave: false,
  saveUninitialized:true
}));

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api', (req,res)=>{
  res.json({"success":true});
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/', "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

app.listen(3400,() => console.log(`Server is listening on port 3400)`));

module.exports = app;