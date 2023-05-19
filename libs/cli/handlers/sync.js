const TaskPool = require('../../core/taskpool');

const term = require('terminal-kit').terminal;

async function handle(yargs, argv) {
  term('Finding adapters for Universal Media Descriptors...\n');

  // sort alphabetically
  let umds = Object.values(CONTEXT.umd).sort((a, b) => a?.title > b?.title ? 1 : -1);

  let { download, table, durationTotal } = await require('../common').gen_umd_table(umds);

  term.table(table, { hasBorder: false, contentHasMarkup: true, fit: true });

  term.on('key', function (name) {
    if (name === 'CTRL_C') { process.exit(1); }
  });

  term('\nTransaction resolved. (~' + durationTotal + ' vid-sec in total)\n');

  if (!download.length) {
    process.exit();
  }

  term('Is this ok [y|N]: ');

  if (await term.yesOrNo({ yes: ['y'], no: ['n', 'ENTER'] }).promise) {
    term('\n\n');

    let pool = new TaskPool(Math.ceil(argv.maxthread) || 24);
    let progressBar = term.progressBar({
      title: 'Downloading:',
      eta: true,
      percent: true
    });

    let success = 0;

    for (let adapted of download) {
      pool.addTask(async function () {
        if (await adapted.sync())
          success++;
      }, adapted.umd.duration || 120);
    }

    pool.onupdate = (progress, total) => {
      progressBar.update(progress / total);
    };

    await pool.execute();

    progressBar.update(1);

    term('\nTotal: ' + download.length + ', Success: ').green(success.toString())(', Failed: ').red((download.length - success).toString())('\n');
    term('Writing metadata...');

    CONTEXT.saveUMDs();
    term('\nTransaction complete.\n');

    process.exit();
  } else {
    term('\nOperation aborted.');
    process.exit(1);
  }
}

module.exports = handle;