const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Trackify Backend Connected!");
});

app.listen(3000, () => console.log("Server running on port 3000"));