const yargs = require('yargs')(process.argv.slice(2));

yargs
  .scriptName("ulm-manager")
  .usage('$0 <cmd> [args]')
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
      }
    },
    handler: (argv) => require('./handlers/playlist')(yargs, argv)
  })
  .conflicts('add', 'remove')
  .conflicts('add', 'list')
  .conflicts('remove', 'list')
  .demandCommand()
  .version('0.1')
  .help();

module.exports = yargs;