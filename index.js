const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Define CORS options
const corsOptions = {
  origin: ["https://smartcsvtool.com", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

app.get("/", (req, res) => {
  res.send("We are on the home page");
});
app.get("/", (req, res) => {
  res.send("We are on the home page");
});

app.use("/api/v1/csv", require("./routes/csvStringSimilarityRoute"));
app.use("/api/v1/contact", require("./routes/emailHandlerRoute"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
