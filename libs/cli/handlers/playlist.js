const Playlist = require('../../core/playlist');
const term = require('terminal-kit').terminal;

function handle(yargs, argv) {
  if (argv.add) {
    let playlist = new Playlist(argv.add.trim());
    CONTEXT.setPlaylist(playlist);
    CONTEXT.savePlaylists();
  } else if (argv.remove) {
    CONTEXT.removePlaylist(argv.remove);
    CONTEXT.savePlaylists();
  } else if (argv.list) {
    let table = [['Name', '# of Media']];

    Object.values(CONTEXT.playlists).forEach(pl => {
      table.push([pl.name, pl.length]);
    });

    term.table(table, { hasBorder: true, contentHasMarkup: false });
  } else {
    yargs.showHelp();
  }
}

module.exports = handle;