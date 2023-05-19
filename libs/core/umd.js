class UniversalMediaDescriptor extends Serializable {
  constructor(uid, title, author) {
    super();
    // uid should be populated by playlistsource impls
    this.uid = uid;
    this.title = title;
    this.author = author;
    // strings for which the media adapters can identify
    // ex. the YouTube adapter will self-select for any youtube links
    this.sources = [];

    // stops materialization of Media object
    this.excluded = false;

    // whether at any point in time the physical media
    // is present on disc from one source
    //
    // updated by implementations of Media
    this.materialized = null;
  }

  gen_fname() {
    return sanitize_fname(`${this.title} - ${this.author} - ${this.uid}`);
  }
}

module.exports = UniversalMediaDescriptor;