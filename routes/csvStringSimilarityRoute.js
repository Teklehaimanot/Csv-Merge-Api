const express = require("express");
const router = express.Router();
const multer = require("multer");
const csvSimilarityController = require("../controllers/csvStringSimilarityController");

const upload = multer({ dest: "uploads/" });

router.post(
  "/ColumnSimilarity",
  upload.single("file"),
  csvSimilarityController.ColumnSimilarity
);

module.exports = router;
