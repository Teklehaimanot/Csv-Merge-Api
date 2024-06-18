const csv = require("csv-parser");
const stringSimilarity = require("string-similarity");
const { Readable } = require("stream");

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

    const mergedData = mergeCsvData(
      csvOriginalData,
      csvToBeReplacedData,
      csvFilteredResultData
    );

    console.log(mergedData);

    res.status(200).json();
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during processing.");
  }
};

const parseCsv = (csvString) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([csvString]);
    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

function mergeCsvData(original, toBeReplaced, filteredResult) {
  const originalMap = new Map();
  original.forEach((row, index) => {
    originalMap.set(JSON.stringify(row), index);
  });

  filteredResult.forEach((filteredRow, index) => {
    const originalIndex = originalMap.get(JSON.stringify(filteredRow));
    if (originalIndex !== undefined) {
      original[originalIndex] = toBeReplaced[index];
    }
  });

  return original;
}

module.exports = {
  ColumnSimilarity,
  replaceColumnStrings,
  mergeCsv,
};
