// manages physical copies of media
class Media extends Serializable {
  constructor(uid) {
    super();
    // UniversalMediaDescriptor ID
    this.uid = uid;
    this.fname = null;
  }

  get umd() {
    return CONTEXT.getUMD(this.uid);
  }

  // attempts to materialize Media object with implementation adapter
  // returns true/false
  async search() {
    throw new Error("Not Implemented");
  }

  // actually downloads media
  async sync() {
    throw new Error("Not Implemented");
  }
}

module.exports = Media;