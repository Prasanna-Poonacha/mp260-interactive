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
        if (row[colorList].split(',').length !== 1) {
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


    console.log(chalk.yellow("4. Creating unique rows..."));
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

    console.log(chalk.yellow("5. Writing to sheet..."));
    fs.writeFileSync(path.resolve(data.destination, 'data-' + data.mediatype + '-' + new Date().toJSON() + '.xlsx'), xls, 'binary');
}

//function for comparing reports
const compare = (data) => {
    // if (data.confirmation.toLowerCase() !== "y") {
    //     return;
    // }
    data.source = "Cheat_Sheet.xlsx";
    const result = excelToJson({
        sourceFile: path.resolve(data.source),
        sheets: [
            {
                name: "Cheat Sheet"
            }
        ]
    });

    //console.log(JSON.stringify(result));
    var newObject = formatJSON(result, "Cheat Sheet");
    console.log(newObject);
    setTimeout(() => { console.log("Report generated!") }, 1000)
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

const formatJSON = (resultObject, sheetName) => {
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

// Export all methods
module.exports = { generate, compare };


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