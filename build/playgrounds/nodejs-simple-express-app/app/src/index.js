const express = require("express");
const app = express();
/** 5858 is an exposed port you can use */
const port = 5858;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Node Playground!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
