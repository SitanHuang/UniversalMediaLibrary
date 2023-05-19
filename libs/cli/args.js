const yargs = require('yargs')(process.argv.slice(2));

yargs
  .scriptName("ulm-manager")
  .usage('$0 <cmd> [args]')
  // ================== playlists ==================
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