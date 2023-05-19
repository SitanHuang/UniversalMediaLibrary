// manages physical copies of media
class Media extends Serializable {
  constructor(uid) {
    super();
    // UniversalMediaDescriptor ID
    this.uid = uid;
    this.fname = null;
  }

  // attempts to materialize Media object with implementation adapter
  // returns true/false
  search() {
    throw new Error("Not Implemented");
  }

  // actually downloads media
  sync() {
    throw new Error("Not Implemented");
  }
}

module.exports = Media;