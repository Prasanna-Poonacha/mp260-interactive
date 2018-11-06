#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { generate, compare, compareMP260s, compareCheatsheets, compareMP260Diva } = require("../index");
const chalk = require("chalk");
const generateDesc = chalk.cyan("Generate report from MP260");
const compareDesc = chalk.cyan("Compare generated MP260 & cheatsheet");
const compareMP260sDesc = chalk.cyan("Compare two MP260s");
const compareCheatsheetsDesc = chalk.cyan("Compare two Cheatsheets");
const compareMP260DivaDesc = chalk.cyan("MP260 to Diva Extract Comparison");
const programDesc = chalk.yellow("Digital Commerce Services - Operations Automation");

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

const compareCheatsheetQuestions = [
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
        message: 'Key in previous cheatsheet filename ...',
        default: 'Cheatsheet_old.xlsx'
    },
    {
        type: 'input',
        name: 'filename2',
        message: 'Key in current cheatsheet filename ...',
        default: 'Cheatsheet_new.xlsx'
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

const generateQuestionscompareMP260Diva = [
    {
        type: 'input',
        name: 'mediatype',
        message: 'Key in media type ...',
        default: 'EF-2018'
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
        name: 'filename1',
        message: 'Key in filename(eg: MP260_VSL.xlsx) ...',
        default: 'MP260_VSL.xlsx'
    },
    {
        type: 'input',
        name: 'filename2',
        message: 'Key in filename(eg: DIVA_extract.xlsx) ...',
        default: 'DIVA_extract.xlsx'
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
    .description(programDesc);

program
    .command("generate")
    .alias("g")
    .description(generateDesc)
    .action(() => {
        prompt(generateQuestions).then(answers => {
            generate(answers);
        })
    });

program
    .command("compare")
    .alias("c")
    .description(compareDesc)
    .action(() => {
        prompt(compareQuestions).then(answers => {
            compare(answers);
        })
    });

program
    .command("compareMP260s")
    .alias("cmp260")
    .description(compareMP260sDesc)
    .action(() => {
        prompt(compareMP260Questions).then(answers => {
            compareMP260s(answers);
        })
    });

program
    .command("compareCheatsheets")
    .alias("ccs")
    .description(compareCheatsheetsDesc)
    .action(() => {
        prompt(compareCheatsheetQuestions).then(answers => {
            compareCheatsheets(answers);
        })
    });

program
    .command("compareMP260Diva")
    .alias("cmdi")
    .description(compareMP260DivaDesc)
    .action(() => {
        prompt(generateQuestionscompareMP260Diva).then(answers => {
            compareMP260Diva(answers);
        })
    });



program.parse(process.argv);

// Assert that a VALID command is provided 
// if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
//     program.outputHelp();
//     process.exit();
// }

//compareMP260s({source:'.',destination:'.',filename1:'MP260_first.xlsx',filename2:'MP260_second.xlsx',confirmation:'y'});
//compareCheatsheets({source:'.',destination:'.',filename1:'cheatsheet_old.xlsx',filename2:'cheatsheet_new.xlsx',confirmation:'y'});
//compareMP260Diva({ mediatype: 'EF-2018', source: '.', destination: '.', filename1: 'MP260_VSL.xlsx', filename2: 'DIVA_extract.xlsx', confirmation: 'y' });
