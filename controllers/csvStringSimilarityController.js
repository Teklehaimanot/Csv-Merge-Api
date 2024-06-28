const csv = require("csv-parser");
const stringSimilarity = require("string-similarity");
const { Readable } = require("stream");
const _ = require("lodash");
const Papa = require("papaparse");

const ColumnSimilarity = (req, res) => {
  try {
    const {
      csvContent,
      targetString,
      columnName,
      similarityThreshold = 0.5,
    } = req.body;

    if (!csvContent || !targetString || !columnName) {
      return res.status(400).json({
        error: "CSV content, target string, and column name are required.",
      });
    }

    // Parse the CSV content using PapaParse
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const filteredResults = data.filter((row) => {
          if (row.hasOwnProperty(columnName)) {
            const similarity = stringSimilarity.compareTwoStrings(
              targetString.toLowerCase(),
              row[columnName].toLowerCase()
            );
            return similarity > similarityThreshold;
          }
          return false;
        });
        if (filteredResults.length > 0) {
          return res.status(200).json(filteredResults);
        } else
          return res.status(400).json({
            error: "No Result Found. Please Adjust Your Percentage",
          });
      },
      error: (error) => {
        res.status(500).json({ error: "Error processing CSV content." });
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
};

const replaceColumnStrings = (req, res) => {
  try {
    const { csvResults, columnName, replacingString } = req.body;

    if (!csvResults || !replacingString || !columnName) {
      return res.status(400).json({
        error: "CSV result, replacing string, and column name are required.",
      });
    }

    Papa.parse(csvResults, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const modifiedData = data.map((row) => {
          if (row.hasOwnProperty(columnName)) {
            row[columnName] = replacingString;
          }
          return row;
        });
        res.status(200).json(modifiedData);
      },
      error: (error) => {
        res.status(500).json({ error: "Error processing CSV content." });
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
};

const parseCsv = (csvString) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(csvString);
    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

const mergeCsvData = (original, toBeReplaced, filteredResult) => {
  const mergedResult = [];
  const replacementMap = new Map();

  // Create a map of filtered results for quick lookup
  filteredResult.forEach((item, index) => {
    replacementMap.set(JSON.stringify(item), toBeReplaced[index]);
  });

  original.forEach((item) => {
    const itemStr = JSON.stringify(item);
    if (replacementMap.has(itemStr)) {
      mergedResult.push(replacementMap.get(itemStr));
    } else {
      mergedResult.push(item);
    }
  });

  return mergedResult;
};

const mergeCsv = async (req, res) => {
  try {
    const { csvFilteredResult, csvOriginal, csvToBeReplaced } = req.body;

    console.log(req.body);
    if (!csvFilteredResult || !csvOriginal || !csvToBeReplaced) {
      return res.status(400).json({
        error: "All CSV files are required including the original CSV content",
      });
    }

    const csvFilteredResultData = await parseCsv(csvFilteredResult);
    const csvOriginalData = await parseCsv(csvOriginal);
    const csvToBeReplacedData = await parseCsv(csvToBeReplaced);

    console.log("Original Data Length:", csvOriginalData.length);
    console.log("Filtered Result Data Length:", csvFilteredResultData.length);
    console.log("To Be Replaced Data Length:", csvToBeReplacedData.length);

    const mergedData = mergeCsvData(
      csvOriginalData,
      csvToBeReplacedData,
      csvFilteredResultData
    );

    console.log("Merged Data Length:", mergedData.length);

    // Check the size of mergedData before sending it
    const mergedDataString = JSON.stringify(mergedData);
    console.log("Merged Data Size:", mergedDataString.length);

    if (mergedDataString.length > 10000000) {
      // 1MB size limit as an example
      return res
        .status(400)
        .json({ error: "Merged data is too large to process" });
    }

    res.status(200).json(mergedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during processing." });
  }
};

module.exports = {
  ColumnSimilarity,
  replaceColumnStrings,
  mergeCsv,
};
