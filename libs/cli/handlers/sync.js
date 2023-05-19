const TaskPool = require('../../core/taskpool');

const Media = require('../../core/media');

const term = require('terminal-kit').terminal;

async function handle(yargs, argv) {
  term('Finding adapters for Universal Media Descriptors...\n');

  let download = [];

  let resolved = [];
  let unresolved = [];
  let excluded = [];

  let deleted = [];

  let durationTotal = 0;

  // sort alphabetically
  let umids = Object.values(CONTEXT.umd).sort((a, b) => a?.title > b?.title ? 1 : -1);

  for (let umd of umids) {
    if (!umd?.uid) continue;

    if (umd.verifyMaterial())
      deleted.push(umd);

    if (umd.excluded) {
      excluded.push(umd);
      continue;
    }

    let adapted;
    for (const adapter of CONTEXT.MEDIA_ADAPTERS) {
      let media = new Media(umd.uid).toType(adapter);
      if (await media.search()) {
        adapted = media;
        break;
      }
    }

    if (adapted) {
      if (umd.materialized)
        resolved.push(umd);
      else {
        download.push(adapted)
        durationTotal += umd.duration || 120;
      }
    } else {
      unresolved.push(umd);
    }
  }

  let table = [];
  table.push([['^+^G In Sync (' + resolved.length + ' Total):^', '']]);
  for (let umd of resolved) {
    table.push(['^G    ' + umd.title + '^', '^G' + umd.author + '^']);
  }
  table.push([['^+^- Excluded (' + excluded.length + ' Total):', '']]);
  for (let umd of excluded) {
    table.push(['^-    ' + umd.title + '^', '^-' + umd.author + '^']);
  }
  table.push([['^+^r Unresolved (' + unresolved.length + ' Total):^', '']]);
  for (let umd of unresolved) {
    table.push(['^r    ' + umd.title + '^', '^r' + umd.author + '^']);
  }
  table.push([['^+^R Deleted (' + deleted.length + ' Total):^', '']]);
  for (let umd of deleted) {
    table.push(['^R    ' + umd.title + '^', '^R' + umd.author + '^']);
  }
  table.push([[' To be downloaded (' + download.length + ' Total):^', '']]);
  for (let adapted of download) {
    table.push(['    ' + adapted.umd.title + '', '' + adapted.umd.author + '']);
  }

  term.table(table, { hasBorder: false, contentHasMarkup: true, fit: true });

  term.on('key', function (name) {
    if (name === 'CTRL_C') { process.exit(1); }
  });

  term('\nTransaction resolved. (~' + durationTotal + ' vid-sec in total)\n')

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