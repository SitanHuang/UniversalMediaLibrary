const Media = require('../media');

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

class YouTubeAdapter extends Media {
  async search() {
    const umd = CONTEXT.getUMD(this.uid);
    const vid = umd.sources.map(x => YouTubeAdapter.extractVID(x)).filter(x => x)[0];

    if (!vid) return false;

    this.yt_vid = vid;

    this.fname = umd.gen_fname();

    return true;
  }

  async sync() {
    const umd = CONTEXT.getUMD(this.uid);
    const url = 'https://www.youtube.com/watch?v=' + this.yt_vid;

    const ext = CONTEXT.config.youtube.sourceFormat;

    const material = this.fname + '.' + ext;

    try {
      const { stdout, stderr } = await execFile(
        CONTEXT.config.youtube.backend,
        [
          url,
          '--merge-output-format', ext,
          '--recode-video', ext,
          '--add-metadata',
          '--xattrs',
          '--no-warnings',
          // '--rm-cache-dir',
          '--no-cache-dir',
          '-o',
          CONTEXT.path('media/' + material)
        ]
      );
      if (stderr?.length) {
        console.error(stderr);
        return false;
      }

      umd.materialized = material;
      CONTEXT.setUMD(umd);

      return true;
    } catch (e) {
      if (e?.stderr)
        console.error(e.stderr);
      console.error(e);
      return false;
    }
  }

  static extractVID(link) {
    const regex = /(v=|v\/|embed\/|youtu.be\/)([^&^\/^?]{11})/;
    const match = link.match(regex);
    return match ? match[2] : null;
  }
}

module.exports = YouTubeAdapter;