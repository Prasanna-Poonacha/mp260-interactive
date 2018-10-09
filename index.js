'use strict';

const excelToJson = require('convert-excel-to-json');
const cmd = require("commander");
const chalk = require("chalk");
const fs = require('fs');
const json2xls = require('json2xls');
const colorList = "Color\r\nList";
const moment = require("moment");

const generate = (data) => {
    if (!data.mediatype){
        console.log(chalk.yellow("Provide the media type - eg : ED-2018"));
        console.log(chalk.white("Use the following format : " + chalk.blue("mp-260 --media=<MediaType>")));
        return;
    }
    console.log(chalk.yellow("1. Parsing MP260..."));
    const result = excelToJson({
        sourceFile: 'MP260.xlsx',
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

    if(!filteredData.length){
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
    fs.writeFileSync('data-' + data.mediatype + '-' + new Date().toJSON() + '.xlsx', xls, 'binary');
}

const compare = (data) => {
    console.log("report compared!");
}

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

// Export all methods
module.exports = { generate, compare };