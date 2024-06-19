const csv = require("csv-parser");
const stringSimilarity = require("string-similarity");
const { Readable } = require("stream");
const _ = require("lodash");

const ColumnSimilarity = (req, res) => {
  try {
    const {
      csvContent,
      targetString,
      columnName,
      similarityThreshold = 0.3,
    } = req.body;

    if (!csvContent || !targetString || !columnName) {
      return res
        .status(400)
        .send("CSV content, target string, and column name are required.");
    }

    const results = [];
    const stream = Readable.from(csvContent);

    stream
      .pipe(csv())
      .on("data", (data) => {
        // Create a new object with trimmed and cleaned keys
        const cleanedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            let cleanedKey = key.trim();
            // Remove surrounding quotes if present
            cleanedKey = cleanedKey.replace(/^["']|["']$/g, "");
            cleanedData[cleanedKey] = data[key];
          }
        }

        if (cleanedData.hasOwnProperty(columnName)) {
          const similarity = stringSimilarity.compareTwoStrings(
            targetString.toLowerCase(),
            cleanedData[columnName].toLowerCase()
          );

          if (similarity > similarityThreshold) {
            // You can adjust the similarity threshold here
            results.push(cleanedData);
          }
        }
      })
      .on("end", () => {
        console.log(results[0]);
        res.json(results);
      })
      .on("error", (err) => {
        res.status(500).send("Error processing CSV content.");
      });
  } catch (error) {
    console.log(error);
  }
};

const replaceColumnStrings = (req, res) => {
  try {
    const { csvResults, columnName, replacingString } = req.body;

    if (!csvResults || !replacingString || !columnName) {
      return res
        .status(400)
        .send("CSV result, replacing string, and column name are required.");
    }
    const results = [];
    const stream = Readable.from(csvResults);

    stream
      .pipe(csv())
      .on("data", (data) => {
        const cleanedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            let cleanedKey = key.trim();
            cleanedKey = cleanedKey.replace(/^["']|["']$/g, "");
            cleanedData[cleanedKey] = data[key];
          }
        }
        if (cleanedData.hasOwnProperty(columnName)) {
          cleanedData[columnName] = replacingString;
          results.push(cleanedData);
        }
      })
      .on("end", () => {
        res.json(results);
      })
      .on("error", (err) => {
        res.status(500).send("Error processing CSV content.");
      });
  } catch (error) {
    console.log(error);
  }
};

const mergeCsv = async (req, res) => {
  try {
    const { csvFilteredResult, csvOriginal, csvToBeReplaced } = req.body;
    const csvFilteredResultData = await parseCsv(csvFilteredResult);
    const csvOriginalData = await parseCsv(csvOriginal);
    const csvToBeReplacedData = await parseCsv(csvToBeReplaced);

    if (!csvFilteredResult || !csvOriginal || !csvToBeReplaced) {
      return res
        .status(400)
        .send("All csv files are required including the origional csv content");
    }

    const mergedData = mergeCsvData(
      csvOriginalData,
      csvToBeReplacedData,
      csvFilteredResultData
    );

    // console.log(mergedData);
    res.status(200).json(mergedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during processing.");
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

function mergeCsvData(original, toBeReplaced, filteredResult) {
  const mergedResult = [];

  console.log(_.isEqual(original[0], filteredResult[0]));

  for (let i = 0; i < filteredResult.length; i++) {
    for (let j = 0; j < original.length; j++) {
      if (_.isEqual(filteredResult[i], original[j])) {
        console.log(filteredResult[i]);
        mergedResult.push(toBeReplaced[i]);
      } else mergedResult.push(original[j]);
    }
  }

  return mergedResult;
}

module.exports = {
  ColumnSimilarity,
  replaceColumnStrings,
  mergeCsv,
};
