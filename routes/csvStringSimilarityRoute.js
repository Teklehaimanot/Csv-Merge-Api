const express = require("express");
const router = express.Router();
const csvSimilarityController = require("../controllers/csvStringSimilarityController");

router.post("/ColumnSimilarity", csvSimilarityController.ColumnSimilarity);

router.post("/replaceStrings", csvSimilarityController.replaceColumnStrings);
router.post("/csvMerge", csvSimilarityController.mergeCsv);

module.exports = router;
