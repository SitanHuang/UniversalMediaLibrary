const yargs = require('yargs')(process.argv.slice(2));

yargs
  .scriptName("uml")
  .usage('$0 <cmd> [args]')
  // ==================  convert   ==================
  .command({
    command: 'convert',
    describe: 'Convert UMD materials to other formats',
    builder: {
      playlist: {
        describe: 'Regex to select playlists to convert',
        type: 'string',
        default: '.+'
      },
      maxthread: {
        describe: 'Maximum concurrent ffmpeg instances',
        type: 'number',
        default: 6
      },
      audio: {
        describe: 'Whether to copy audio stream',
        type: 'boolean',
        default: true
      },
      video: {
        describe: 'Whether to copy video stream',
        type: 'boolean',
        default: false
      },
      ext: {
        decribe: 'Extension of converted media file',
        type: 'string',
        required: true
      },
      overwrite: {
        decribe: 'Overwrite existing files',
        type: 'boolean',
        required: true,
        default: false
      }
    },
    handler: (argv) => require('./handlers/convert')(yargs, argv)
  })
  // ==================    sync    ==================
  .command({
    command: 'sync',
    describe: 'Materialize all UMDs',
    builder: {
      maxthread: {
        describe: 'Maximum concurrent backend (ex. yt-dlp) instances',
        type: 'number',
        default: 24
      }
    },
    handler: (argv) => require('./handlers/sync')(yargs, argv)
  })
  // ================== playlists ===================
  .command({
    command: 'playlist',
    describe: 'Manage playlists',
    builder: {
      add: {
        describe: 'Add new playlist with name',
        type: 'string',
      },
      remove: {
        describe: 'Add new playlist with name',
        type: 'string',
      },
      list: {
        describe: 'List playlists',
        type: 'boolean',
      },
      populate: {
        describe: 'Populate playlist with name from external source; does NOT delete old UMDs',
        type: 'string',
        implies: ['method', 'query']
      },
      method: {
        describe: 'Specify backend of playlist populator',
        choices: ['youtube'],
        default: 'youtube'
      },
      query: {
        describe: 'Populator-specific query',
        type: 'string'
      },
      maxlen: {
        describe: 'Exclude media more than such seconds; 0 for no restriction',
        type: 'number',
        default: '0'
      }
    },
    handler: (argv) => require('./handlers/playlist')(yargs, argv)
  })
  .conflicts('add', 'remove')
  .conflicts('add', 'list')
  .conflicts('remove', 'list')
  .conflicts('add', 'populate')
  .conflicts('remove', 'populate')
  .conflicts('list', 'populateW')
  .demandCommand()
  .version('0.1')
  .help();

module.exports = yargs;