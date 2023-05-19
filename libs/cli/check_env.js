const commandExists = require('command-exists');
const term = require('terminal-kit').terminal;

async function check_env() {
  const commands = ['ffmpeg', CONTEXT.config.youtube.backend];

  for (let command of commands) {
    if (!commandExists.sync(command)) {
      term.red(command + ' not in path!\n');
  
      process.exit(1);
    }
  }
}

module.exports = check_env;