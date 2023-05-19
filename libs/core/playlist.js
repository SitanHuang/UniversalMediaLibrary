class Playlist extends Serializable {
  constructor(name) {
    super();
    this.name = name;
    this.mediaList = {};
  }

  get length() {
    return Object.getOwnPropertyNames(this.mediaList).length;
  }

  // minus excluded ones
  get effectiveLength() {
    return Object.getOwnPropertyNames(this.mediaList).filter(x => !CONTEXT.getUMD(x).excluded).length;
  }

  // minus excluded ones
  get excludedLength() {
    return Object.getOwnPropertyNames(this.mediaList).filter(x => CONTEXT.getUMD(x).excluded).length;
  }

  // returns list of newly added UMDs
  async populate(query) {
    throw new Error("Not Implemented");
  }

  setMedia(umd) {
    this.mediaList[umd.uid] = 1;
  }

  removeMedia(umd) {
    delete this.mediaList[umd?.uid];
  }

  gen_fname() {
    return sanitize_fname(`${this.name}`);
  }
}

module.exports = Playlist;