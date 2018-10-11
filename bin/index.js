#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { generate, compare } = require("../index");

// Questions for generate function
const generateQuestions = [
    {
        type: 'input',
        name: 'mediatype',
        message: 'Enter media type ...',
        default: 'ED-2018'
    },
    {
        type: 'input',
        name: 'source',
        message: 'Enter source ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Enter destination ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'filename',
        message: 'Enter filename(eg: MP260.xlsx) ...',
        default: 'MP260.xlsx'
    },
    {
        type: 'list',
        name: 'confirmation',
        message: 'Do you want to continue generate the report?(y/n)',
        choices: [
            "y",
            "n"
        ],
        default: 'y'
    }
];


// Questions for compare function
const compareQuestions = [
    {
        type: 'input',
        name: 'source',
        message: 'Enter source ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Enter destination ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'filename',
        message: 'Enter filename ...',
        default: 'Cheatsheet_new.xlsx'
    },
    {
        type: 'input',
        name: 'mp260',
        message: 'Enter generated MP260 filename ...',
        default: 'generatedMP260.xlsx'
    },
    {
        type: 'list',
        name: 'confirmation',
        message: 'Do you want to continue generate the report?(y/n)',
        choices: [
            "y",
            "n"
        ],
        default: 'y'
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