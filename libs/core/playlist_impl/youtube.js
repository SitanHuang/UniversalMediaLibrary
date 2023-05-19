const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const UniversalMediaDescriptor = require('../umd');

class YoutubePlaylistAdapter extends require('../playlist') {
  async populate(url) {
    try {
      const { stdout, stderr } = await execFile(
        CONTEXT.config.youtube.backend,
        [
          url, '--flat-playlist',
          '-j',
          '--no-warnings',
          // '--rm-cache-dir',
          '--no-cache-dir'
        ]
      );
      if (stderr?.length) {
        console.error(stderr);
        return false;
      }

      let newUMDs = [];
      
      const vids = stdout.split("\n").filter(x => x?.length).map(x => JSON.parse(x));
      for (let vid of vids) {
        let umd = CONTEXT.getUMD(vid.id);

        if (!umd) {
          umd = new UniversalMediaDescriptor(vid.id, vid.title, vid.uploader);
          newUMDs.push(umd);
        }

        umd.duration = vid.duration;

        let source = `https://www.youtube.com/watch?v=${vid.id}`;

        if (umd.sources.indexOf(source) < 0)
          umd.sources.unshift(`https://www.youtube.com/watch?v=${vid.id}`);

        this.setMedia(umd);
        CONTEXT.setUMD(umd);
      }

      return newUMDs;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = YoutubePlaylistAdapter;