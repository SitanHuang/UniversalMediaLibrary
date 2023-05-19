const Playlist = require('../../core/playlist');
const term = require('terminal-kit').terminal;

async function handle(yargs, argv) {
  if (argv.add) {
    let playlist = new Playlist(argv.add.trim());
    CONTEXT.setPlaylist(playlist);
    CONTEXT.savePlaylists();
  } else if (argv.remove) {
    CONTEXT.removePlaylist(argv.remove);
    CONTEXT.savePlaylists();
  } else if (argv.list) {
    term(`Total unique UMDs: ${Object.values(CONTEXT.umd).filter(x => x?.uid).length}\n\n`);
    let table = [['Name', '# of Media', '# of Excluded', 'Effective #']];

    let tot = ['Total', 0, 0, 0];

    Object.values(CONTEXT.playlists).forEach(pl => {
      table.push([pl.name, pl.length, '^R'+pl.excludedLength.toString()+'^', '^G'+pl.effectiveLength.toString()+'^']);
      tot[1] += pl.length;
      tot[2] += pl.excludedLength;
      tot[3] += pl.effectiveLength;
    });

    tot[2] = '^R' + tot[2];
    tot[3] = '^G' + tot[3];

    table.push(tot.map(x => `^+${x}^`));

    term.table(table, { hasBorder: false, contentHasMarkup: true, fit: true });
  } else if (argv.populate) {
    // TODO: stub, provide other playlist populators than youtube
    let playlist = CONTEXT.getPlaylist(argv.populate);

    if (!playlist) {
      console.error("Playlist doesn't exist.");

      process.exit(1);
    }

    let spinner = await term.spinner();
    term(' Populating playlist... \n');

    playlist = playlist.toType(require('../../core/playlist_impl/youtube'));

    spinner.animate(false);

    let oldLength = playlist.length;

    let umds = await playlist.populate(argv.query);

    if (!umds) {
      term.red("Failed to populate playlist. Check if the playlist is set to public/unlisted.\n");

      process.exit(1);
    }

    term("Playlist size: ").red(oldLength + '')(" UMD -> ").green(playlist.length + '')(" UMD\n");
    term("======= Please select if these new UMDs should be excluded =======\n");

    term.on('key', function (name) {
      if (name === 'CTRL_C') { process.exit(1); }
    });

    let i = 1;
    for (let umd of umds) {
      term.bold(`${i++} / ${umds.length}: `);
      term('Keep (').bold(Math.round(umd.duration / 60 * 10) / 10)(' min) ').bold(umd.title)(' by ').bold(umd.author)('? [ENTER|n] ');

      let exclude = (argv.maxlen > 0 && umd.duration > argv.maxlen) || (await term.yesOrNo({yes: ['n', 'ESCAPE'], no: ['ENTER'] }).promise);

      if (exclude) {
        umd.excluded = true;
        term.red('EXCLUDED \n');
      } else {
        term('\n');
      }

      CONTEXT.setUMD(umd);
    }

    CONTEXT.saveUMDs();
    CONTEXT.savePlaylists();

    process.exit(1);

  } else {
    yargs.showHelp();
  }
}

module.exports = handle;