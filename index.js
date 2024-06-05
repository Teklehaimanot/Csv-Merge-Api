const mfrData = require("./mfr.json");
const csvSimilarityRoute = require("./routes/csvColumnSimilarityRoutes");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("We are on the home page");
});

app.use("/api/v1/csvSimilarity", csvSimilarityRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
