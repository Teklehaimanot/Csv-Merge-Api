const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Define CORS options
const corsOptions = {
  origin: [
    "https://smartcsvtool.com",
    "https://www.smartcsvtool.com",
    "http://localhost:3000",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], // add any other headers your client sends
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Create a write stream (in append mode) for logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Setup morgan middleware to log incoming requests to 'access.log'
app.use(morgan("combined", { stream: accessLogStream }));

// For console logging as well, use 'tiny' or 'dev' preset
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("We are on the home page");
});

app.use("/api/v1/csv", require("./routes/csvStringSimilarityRoute"));
app.use("/api/v1/contact", require("./routes/emailHandlerRoute"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
