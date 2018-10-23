'use strict';

const excelToJson = require('convert-excel-to-json');
const cmd = require("commander");
const chalk = require("chalk");
const fs = require('fs');
const json2xls = require('json2xls');
const colorList = "Color\r\nList";
const moment = require("moment");
const path = require("path");

//function for generating reports
const generate = (data) => {
    if (data.confirmation.toLowerCase() !== "y") {
        return;
    }
    if (!data.mediatype) {
        console.log(chalk.yellow("Provide the media type - eg : ED-2018"));
        return;
    }
    //validate source and destination
    console.log(chalk.yellow("1. Parsing MP260..."));
    const result = excelToJson({
        sourceFile: path.resolve(data.source, data.filename),
        sheets: [
            {
                name: "Other Retail",
                header: {
                    rows: 1
                },
                columnToKey: {
                    '*': '{{columnHeader}}'
                }
            }
        ]
    });

    let newRowsWithSplitColors = [];
    let rowsTobeDeleted = [];
    console.log(chalk.yellow("2. Filtering MP260 by media - " + chalk.blue(data.mediatype)));
    var filteredData = result["Other Retail"].filter(r => r.Media === data.mediatype);

    if (!filteredData.length) {
        console.log(chalk.white("No records found for media : " + chalk.blue(data.mediatype)));
        console.log(chalk.white("Try using a different media!"));
        return;
    }

    filteredData.map((row) => {
        if (row[colorList].split(',').length !== 0) {
            //console.log(chalk.blue("Number of values - " + row[colorList].split(',').length + " -->" + JSON.stringify(row[colorList])));
            row[colorList].split(',').map(cl => {
                //console.log(chalk.yellow("Copying rows--> " + cl));
                let rowCopy = Object.assign({}, row);
                rowCopy[colorList] = cl;
                rowCopy.RowStyleColorList = rowCopy["Selling\r\nStyle"] + rowCopy[colorList];
                newRowsWithSplitColors.push(rowCopy);
            })
        }

    });


    console.log(chalk.yellow("3. Creating unique rows..."));
    var uniqueDataWithOutDuplicates = [];
    var groupByConcatenatedColumn = groupBy(newRowsWithSplitColors, "RowStyleColorList");
    Object.keys(groupByConcatenatedColumn).map((key, index) => {
        if (groupByConcatenatedColumn[key].length > 1) {
            groupByConcatenatedColumn[key].sort(function (a, b) {
                return moment.max([moment(a["Start\r\nDate/Time"].split("US/Eastern")[0].trim(), "YYYY-MM-DD HH:mm Z"), moment(b["Start\r\nDate/Time"].split("US/Eastern")[0].trim(), "YYYY-MM-DD HH:mm Z")]);
            })
            uniqueDataWithOutDuplicates.push(groupByConcatenatedColumn[key][0]);
        } else {
            uniqueDataWithOutDuplicates.push(groupByConcatenatedColumn[key][0]);
        }
    })

    var xls = json2xls(uniqueDataWithOutDuplicates);

    console.log(chalk.yellow("4. Writing to sheet..."));
    fs.writeFileSync(path.resolve(data.destination, "generatedMP260.xlsx"), xls, 'binary');
}

//function for comparing reports
const compare = (data) => {
    if (data.confirmation.toLowerCase() !== "y") {
        return;
    }
    //data.source = "Cheatsheet_new.xlsx";
    const result = excelToJson({
        sourceFile: path.resolve(data.source, data.filename)
    });

    var sheetData = [];
    Object.keys(result).map((key, index) => {
        var sheet = formatJSON(result[key]).map(row => {
            row.RowStyleColorList = row["DIGITAL_SELLING_STYLE"] + row["DIGITAL_COLOR_CODE"];
            row.SheetName = key;
            return row;
        });

        sheetData.push(...sheet);
    });

    var requiredData = sheetData.map(row => {
        return {
            "CATEGORY_DESC": row.CATEGORY_DESC || "Description Not Available!",
            "DIGITAL_SELLING_STYLE": row.DIGITAL_SELLING_STYLE || "Selling Style Not Available",
            "DIGITAL_ROOT_STYLE": row.DIGITAL_ROOT_STYLE || "Root Style Not Available",
            "DIGITAL_COLOR_CODE": row.DIGITAL_COLOR_CODE || "Color Code Not Available",
            "DIGITAL_ON_FLOOR": row.DIGITAL_ON_FLOOR || "On Floor Not Available",
            "Grouping Direction": row["Grouping Direction"] || "Grouping Direction Not Available",
            "SheetName": row.SheetName,
            "RowStyleColorList": row.RowStyleColorList
        }
    });

    // Read generated MP260 file
    const generatedMP260 = excelToJson({
        sourceFile: path.resolve(data.source, data.mp260),
        sheets: [
            {
                name: "Sheet 1"
            }
        ]
    });

    var formattedMP260 = formatJSONBySheetName(generatedMP260, "Sheet 1");

    let cheatSheetMap = groupBy(requiredData, "RowStyleColorList");
    let MP260Map = groupBy(formattedMP260, "RowStyleColorList");
    compareAndUpdate(MP260Map, cheatSheetMap, "NEW", "CARRYOVER");
    compareAndUpdate(cheatSheetMap, MP260Map, "IN MP260", "NOT IN MP260");
    cheatSheetMap = convertMapToList(cheatSheetMap);
    MP260Map = convertMapToList(MP260Map);
    // write the data back to excel file
    writeJSONtoXL(cheatSheetMap, "cheatSheetWithComments.xlsx");
    writeJSONtoXL(MP260Map, "MP260WithComments.xlsx");
}

const writeJSONtoXL = (data, filePath) => {
    let xl = json2xls(data);
    fs.writeFileSync(filePath, xl, 'binary');
}

/**
 * Compares firstMap and secondMap, 
 * if entry is not in firstMap, adds valueIfNotPresent to comments
 * if entry is present, adds valueIfPresent
 * Does not return any new value and it alteres the original object
 */

const compareAndUpdate = (firstMap, secondMap, valueIfPresent, valueIfNotPresent) => {
    for (let row in firstMap) {
        if (secondMap[row]) {
            //firstMap[row][0]
            firstMap[row].map((r) => {
                r["Comments"] = valueIfPresent;
            })
            // add new field in row of firstMap with valuePresent
        } else {
            //firstMap[row][0]["Comments"] = valueIfNotPresent;
            firstMap[row].map((r) => {
                r["Comments"] = valueIfNotPresent;
            })
            // add new field in row of firstMap with valueNotPresent
        }
    }
}

const compareAndUpdate1 = (firstMap, secondMap, valueIfPresent, valueIfNotPresent) => {
    for (let row in firstMap) {
        if (secondMap[row]) {
            firstMap[row].map((r) => {
                r["Comments"] = valueIfNotPresent;
            })
        } else {
            firstMap[row].map((r) => {
                r["Comments"] = valueIfPresent;
            })
        }
    }
}
/** 
 * Removes the keys from the map and returns only the values as array to be written to excel file
*/
const convertMapToList = (map) => {
    var arrayList = [];
    Object.keys(map).map((key, index) => {
        arrayList.push(...map[key]);
    })
    return arrayList;
}

//function for groupBy functionality
const groupBy = (objectArray, property) => {
    return objectArray.reduce(function (acc, obj) {
        var key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

const formatJSONBySheetName = (resultObject, sheetName) => {
    return resultObject[sheetName].reduce((acc, obj, index, array) => {
        var newObj = {}
        if (index !== 0) {
            for (var key in obj) {
                newObj[array[0][key]] = obj[key];
            }
            acc.push(newObj);
        }
        return acc;
    }, []);
}

const formatJSON = (resultArray) => {
    return resultArray.reduce((acc, obj, index, array) => {
        var newObj = {}
        if (index !== 0) {
            for (var key in obj) {
                newObj[array[0][key]] = obj[key];
            }
            acc.push(newObj);
        }
        return acc;
    }, []);
}

const compareMP260s = (data) => {

    if (data.confirmation.toLowerCase() !== "y") {
        return;
    }

     // Read generated MP260 file
     const mp260file1 = excelToJson({
        sourceFile: path.resolve(data.source, data.filename1),
        sheets: [
            {
                name: "Sheet 1"
            }
        ]
    });

     // Read generated MP260 file
     const mp260file2 = excelToJson({
        sourceFile: path.resolve(data.source, data.filename2),
        sheets: [
            {
                name: "Sheet 1"
            }
        ]
    });

    var formattedmp260file1 = formatJSONBySheetName(mp260file1, "Sheet 1");
    var formattedmp260file2 = formatJSONBySheetName(mp260file2, "Sheet 1");
    let MP260Map1 = groupBy(formattedmp260file1, "RowStyleColorList");
    let MP260Map2 = groupBy(formattedmp260file2, "RowStyleColorList");

    compareAndUpdate1(MP260Map1, MP260Map2, "DELETED", "");
    compareAndUpdate1(MP260Map2, MP260Map1, "ADDED", "");

    MP260Map1 = convertMapToList(MP260Map1);
    MP260Map2 = convertMapToList(MP260Map2);

    writeJSONtoXL(MP260Map1, "generatedMP260_old_withComments.xlsx");
    writeJSONtoXL(MP260Map2, "generatedMP260_new_withComments.xlsx");

}

const compareCheatsheets = (data) => {
    // console.log(JSON.stringify(data));
    if (data.confirmation.toLowerCase() !== "y") {
        return;
    }

    const cheatSheet_old = excelToJson({
        sourceFile: path.resolve(data.source, data.filename1)
    });

    const cheatSheet_current = excelToJson({
        sourceFile: path.resolve(data.source, data.filename2)
    });

    var cheatsheetData_old = [];
    Object.keys(cheatSheet_old).map((key, index) => {
        var sheet = formatJSON(cheatSheet_old[key]).map(row => {
            row.RowStyleColorList = row["DIGITAL_SELLING_STYLE"] + row["DIGITAL_COLOR_CODE"];
            row.SheetName = key;
            return row;
        });

        cheatsheetData_old.push(...sheet);
    });

    var cheatsheetData_current = [];
    Object.keys(cheatSheet_current).map((key, index) => {
        var sheet = formatJSON(cheatSheet_current[key]).map(row => {
            row.RowStyleColorList = row["DIGITAL_SELLING_STYLE"] + row["DIGITAL_COLOR_CODE"];
            row.SheetName = key;
            return row;
        });

        cheatsheetData_current.push(...sheet);
    });

    var requiredData_old = cheatsheetData_old.map(row => {
        return {
            "CATEGORY_DESC": row.CATEGORY_DESC || "Description Not Available!",
            "DIGITAL_SELLING_STYLE": row.DIGITAL_SELLING_STYLE || "Selling Style Not Available",
            "DIGITAL_ROOT_STYLE": row.DIGITAL_ROOT_STYLE || "Root Style Not Available",
            "DIGITAL_COLOR_CODE": row.DIGITAL_COLOR_CODE || "Color Code Not Available",
            "DIGITAL_ON_FLOOR": row.DIGITAL_ON_FLOOR || "On Floor Not Available",
            "Grouping Direction": row["Grouping Direction"] || "Grouping Direction Not Available",
            "SheetName": row.SheetName,
            "RowStyleColorList": row.RowStyleColorList
        }
    });
    var requiredData_current = cheatsheetData_current.map(row => {
        return {
            "CATEGORY_DESC": row.CATEGORY_DESC || "Description Not Available!",
            "DIGITAL_SELLING_STYLE": row.DIGITAL_SELLING_STYLE || "Selling Style Not Available",
            "DIGITAL_ROOT_STYLE": row.DIGITAL_ROOT_STYLE || "Root Style Not Available",
            "DIGITAL_COLOR_CODE": row.DIGITAL_COLOR_CODE || "Color Code Not Available",
            "DIGITAL_ON_FLOOR": row.DIGITAL_ON_FLOOR || "On Floor Not Available",
            "Grouping Direction": row["Grouping Direction"] || "Grouping Direction Not Available",
            "SheetName": row.SheetName,
            "RowStyleColorList": row.RowStyleColorList
        }
    });

    let cheatSheetMap_old = groupBy(requiredData_old, "RowStyleColorList");
    let cheatSheetMap_current = groupBy(requiredData_current, "RowStyleColorList");

    compareAndUpdate1(cheatSheetMap_old, cheatSheetMap_current, "DELETED", "");
    compareAndUpdate1(cheatSheetMap_current, cheatSheetMap_old, "ADDED", "");

    cheatSheetMap_old = convertMapToList(cheatSheetMap_old);
    cheatSheetMap_current = convertMapToList(cheatSheetMap_current);

    writeJSONtoXL(cheatSheetMap_old, "cheatsheet_old_withComments.xlsx");
    writeJSONtoXL(cheatSheetMap_current, "cheatsheet_current_withComments.xlsx");

}

// Export all methods
module.exports = { generate, compare, compareMP260s, compareCheatsheets };


// header: {
                //     rows: 1
                // }
                // columnToKey:{
                //     '*':'{{columnHeader}}'
                // }
                // columnToKey: {
                //     A: "CATEGORY_DESC",
                //     B: "STORE_STATUS",
                //     C: "DIGITAL_STATUS",
                //     D: "SHARED_UNIQUE",
                //     E: "MASTER_STYLE_GROUPING",
                //     F: "FLEX_STYLE",
                //     G: "GENERIC",
                //     H: "MERCH_STYLE_DESC",
                //     I: "MERCH_COLOR_DESC",
                //     K: "FLEX_STYLE_DESC",
                //     L: "CHOICE_CODE",
                //     M: "NEW_CARRYOVER",
                //     N: "STORE_ON_FLOOR",
                //     O: "STORE_OFF_FLOOR",
                //     P: "Grouping Direction",
                //     Q: "DIGITAL_ROOT_STYLE",
                //     R: "DIGITAL_COLOR_CODE",
                //     S: "DIGITAL_MARKETING_NAME",
                //     T: "DIGITAL_ON_FLOOR",
                //     U: "Show on Site",
                //     V: "Show on Mobile",
                //     W: "New Flag",
                //     X: "Keyword Search",
                //     Y: "Certona",
                //     Z: "Editable",
                //     AA: "Color Swap",
                //     AB: "Display Swatch",
                //     AC: "Show Swatch",
                //     AD: "Pink Style",
                //     AE: "Pink Bra Style",
                //     AF: "Pink Bra Style",
                //     AG: "Roadmapping 1",
                //     AH: "Roadmapping 2",
                //     AI: "Roadmapping 3",
                //     AJ: "Bangalore's Comments",
                //     AK: "Kesha's Comments",
                //     AL: "FLEX_SILHOUETE",
                //     AM: "FLEX_COLLECTION",
                //     AN: "MERCHANT_SILHOUETTE",
                //     AO: "MAGTEMPLATES_ID",
                //     AP: "ROW_ID"
                //   }