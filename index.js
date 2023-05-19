#!/usr/bin/env node

require('./libs/core/common');
require('ini');

const term = require('terminal-kit').terminal;

const argsParser = require('./libs/cli/args');

const UMLContext = require('./libs/context');

global.CONTEXT = new UMLContext('./');

async function main() {
  CONTEXT.init();
  
  await require('./libs/cli/check_env')();

  argsParser.argv;
}

if (CONTEXT.isUMLDirectory()) {
  main();
} else {
  argsParser.showHelp();

  term('\n');

  console.error('Current directory is not a UML library.\n');
  console.log('Do you want to create one? [Y|n]');

  term.yesOrNo({ yes: ['y', 'ENTER'], no: ['n'] }, function (_, result) {
    if (result) {
      term('\n');
      main();
    } else
      process.exit(1);
  });
}