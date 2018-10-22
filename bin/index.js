#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { generate, compare, compareMP260s } = require("../index");

// Questions for generate function
const generateQuestions = [
    {
        type: 'input',
        name: 'mediatype',
        message: 'Key in media type ...',
        default: 'ED-2018'
    },
    {
        type: 'input',
        name: 'source',
        message: 'Key in source ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Key in destination ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'filename',
        message: 'Key in filename(eg: MP260.xlsx) ...',
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
        message: 'Key in source ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Key in destination ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'filename',
        message: 'Key in filename ...',
        default: 'Cheatsheet_new.xlsx'
    },
    {
        type: 'input',
        name: 'mp260',
        message: 'Key in generated MP260 filename ...',
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

// Questions for compare function
const compareMP260Questions = [
    {
        type: 'input',
        name: 'source',
        message: 'Key in source ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'destination',
        message: 'Key in destination ...',
        default: '.'
    },
    {
        type: 'input',
        name: 'filename1',
        message: 'Key in previous MP260 filename ...',
        default: 'generatedMP260_old.xlsx'
    },
    {
        type: 'input',
        name: 'filename2',
        message: 'Key in current MP260 filename ...',
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
    .description("Compare generated MP260 & cheatsheet")
    .action(() => {
        prompt(compareQuestions).then(answers => {
            compare(answers);
        })
    });

program
    .command("compareMP260")
    .alias("cMP260")
    .description("Compare two MP260s")
    .action(() => {
        prompt(compareMP260Questions).then(answers => {
            compareMP260s(answers);
        })
    });

// Assert that a VALID command is provided 
// if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
//     program.outputHelp();
//     process.exit();
// }

program.parse(process.argv);

//compareMP260s({source:'.',destination:'.',filename1:'MP260_first.xlsx',filename2:'MP260_second.xlsx',confirmation:'y'});
