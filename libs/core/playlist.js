class Playlist extends Serializable {
  constructor(name) {
    super();
    this.name = name;
    this.mediaList = {};
  }

  get length() {
    return Object.keys(this.mediaList).length;
  }

  setMedia(umd) {
    this.mediaList[umd.uid] = umd;
  }

  removeMedia(umd) {
    delete this.mediaList[umd?.uid];
  }

  gen_fname() {
    return sanitize_fname(`${this.name}`);
  }
}

module.exports = Playlist;