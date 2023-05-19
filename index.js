#!/usr/bin/env node

require('./libs/core/common');
require('ini');

const term = require('terminal-kit').terminal;

const argsParser = require('./libs/cli/args');


const UMLContext = require('./libs/context');

global.CONTEXT = new UMLContext('./');

function main() {
  CONTEXT.init();
  argsParser.argv;
}

if (CONTEXT.isUMLDirectory()) {
  main();
} else {
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