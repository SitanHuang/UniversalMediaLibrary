const TaskPool = require('../../core/taskpool');

const term = require('terminal-kit').terminal;

const fs = require('fs');
const fse = require('fs-extra');

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function convert(umd, out, argv) {
  let opts = [
    '-i',
    umd.resolvedMaterial,
    argv.overwrite ? '-y' : '-n',
    '-map_metadata', '0', // copy all global metadata
    '-hide_banner', '-loglevel', 'fatal', '-nostats'
  ];

  if (!argv.overwrite && fs.existsSync(out))
    return true;

  if (argv.audio === false)
    opts.push('-an');
  if (argv.video === false)
    opts.push('-vn');

  opts.push(out);

  try {
    const { stdout, stderr } = await execFile('ffmpeg', opts);
    if (stderr?.length) {
      console.error(stderr);
      return false;
    }
    return true;
  } catch (e) {
    if (e?.stderr)
      console.error(e.stderr);
    console.error(e);
    return false;
  }
}

async function handle(yargs, argv) {
  let playlists = Object.keys(CONTEXT.playlists)
                    .map(x => CONTEXT.getPlaylist(x))
                    .filter(x => x?.name?.match(argv.playlist));

  let pool = new TaskPool(Math.ceil(argv.maxthread) || 6);
  let progressBar = term.progressBar({
    title: 'Converting:',
    eta: true,
    percent: true
  });

  let success = 0;
  let total = 0;
  
  for (let playlist of playlists) {
    let dir = CONTEXT.path('./converted/' + argv.ext + '/' + playlist.name + '/');
    fse.ensureDirSync(dir);
    
    for (let uid in playlist.mediaList) {
      let umd = CONTEXT.getUMD(uid);

      if (umd.excluded)
        continue;

      umd.verifyMaterial();
      if (!umd.materialized) {
        term.red(`UMD ^+${umd.title}^:^r (UID: ^+${umd.uid}^:^r) is not materialized!\n`);
        continue;
      }

      total++;

      let out = CONTEXT.path(dir + umd.gen_fname() + '.' + argv.ext);

      pool.addTask(async function () {
        if (await convert(umd, out, argv))
          success++;
      }, fs.statSync(umd.resolvedMaterial).size);
    }
  }

  pool.onupdate = (progress, total) => {
    progressBar.update(progress / total);
  };

  await pool.execute();

  progressBar.update(1);

  term('\nTotal: ' + total + ', Success: ').green(success.toString())(', Failed: ').red((total - success).toString())('\n');

  term('\nConversion complete.\n');

  process.exit();
}

module.exports = handle;