const Media = require('../media');

class YouTubeAdapter extends Media {
  search() {
    const umd = CONTEXT.getUMD(this.uid);
    const vid = umd.sources.map(x => this.extractVID(x)).filter(x => x)[0];

    if (!vid) return false;

    this.vid = vid;

    this.fname = umd.gen_fname();
  }

  static extractVID(link) {
    const regex = /(v=|v\/|embed\/|youtu.be\/)([^&^\/^?]{11})/;
    const match = link.match(regex);
    return match ? match[2] : null;
  }
}

module.exports = YouTubeAdapter;