const term = require('terminal-kit').terminal;

const fs = require('fs');
const fse = require('fs-extra');

async function handle(yargs, argv) {
  let umds = Object.values(CONTEXT.umd).filter(x => x.exec_query(argv.query.toString()));

  let { resolved, excluded, unresolved, deleted, download } = await require('../common').gen_umd_table(umds);

  let table = [[' UID', ' Title', ' Author', 'Playlists']];

  table.push(['^+^G In Sync (' + resolved.length + ' Total):^', '', '', '']);
  for (let umd of resolved) {
    table.push(['^G ' + umd.uid + '^', '^G ' + umd.title + '^', '^G ' + umd.author + '^', umd.playlists.join(", ")]);
  }
  table.push(['^+^- Excluded (' + excluded.length + ' Total):^', '', '', '']);
  for (let umd of excluded) {
    table.push(['^- ' + umd.uid + '^', '^- ' + umd.title + '^', '^- ' + umd.author + '^', umd.playlists.join(", ")]);
  }
  table.push(['^+^r Unresolved (' + unresolved.length + ' Total): ^', '', '', '']);
  for (let umd of unresolved) {
    table.push(['^r ' + umd.uid + '^', '^r ' + umd.title + '^', '^r ' + umd.author + '^', umd.playlists.join(", ")]);
  }
  table.push(['^+^R Deleted (' + deleted.length + ' Total):^', '', '', '']);
  for (let umd of deleted) {
    table.push(['^R ' + umd.uid + '^', '^R ' + umd.title + '^', '^R ' + umd.author + '^', umd.playlists.join(", ")]);
  }
  table.push([' Not synced (' + download.length + ' Total)^:', '', '', '']);
  for (let adapted of download) {
    table.push([' ' + adapted.umd.uid, ' ' + adapted.umd.title, '' + adapted.umd.author, adapted.umd.playlists.join(", ")]);
  }

  term.table(table, { hasBorder: false, contentHasMarkup: true, fit: true });

  term.on('key', function (name) {
    if (name === 'CTRL_C') { process.exit(1); }
  });

  if (argv.remove || typeof argv['set-exclude'] != 'undefined') {
    term('\nTransaction resolved. (' + umds.length + ' UMDs to be ' + (argv.remove ? 'removed' : (argv['set-exclude'] ? 'excluded' : 'unexcluded')) + ')\n')

    term('Is this ok [y|N]: ');

    if (await term.yesOrNo({ yes: ['y'], no: ['n', 'ENTER'] }).promise) {
      term('\nWriting metadata...');

      if (argv.remove) {
        umds.forEach(x => CONTEXT.removeUMD(x));

        CONTEXT.savePlaylists();
      } else if (typeof argv['set-exclude'] != 'undefined') {
        umds.forEach(x => x.excluded = argv['set-exclude']);
      }

      CONTEXT.saveUMDs();
      term('\nTransaction complete.\n');

      process.exit();
    } else {
      term('\nOperation aborted.');
      process.exit(1);
    }
  }
  process.exit();
}

module.exports = handle;