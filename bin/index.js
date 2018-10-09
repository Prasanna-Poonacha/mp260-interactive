#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { generate, compare } = require("../index");

// Questions for generate function
const generateQuestions = [
    {
        type: 'input',
        name: 'mediatype',
        message: 'Enter media type ...'
    },
    {
        type: 'input',
        name: 'source',
        message: 'Enter source ...'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Enter destination ...'
    },
    {
        type: 'input',
        name: 'confimation',
        message: 'Do you want to continue generate the report?(y/n)'
    }
];


// Questions for compare function
const compareQuestions = [
    {
        type: 'input',
        name: 'source',
        message: 'Enter source ...'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Enter destination ...'
    },
    {
        type: 'input',
        name: 'confimation',
        message: 'Do you want to continue comparing the reports?(y/n)'
    }
];

program
    .version("0.0.1")
    .description("Digital Commerce Services - Operations Automation");

program
    .command("generate")
    .alias("g")
    .description("Generate report from MP260")
    .action(() => {
        prompt(generateQuestions).then(answers => {
            generate(answers);
        })
    });

program
    .command("compare")
    .alias("c")
    .description("Compare reports")
    .action(() => {
        prompt(compareQuestions).then(answers => {
            compare(answers);
        })
    });

// Assert that a VALID command is provided 
// if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
//     program.outputHelp();
//     process.exit();
// }

program.parse(process.argv);