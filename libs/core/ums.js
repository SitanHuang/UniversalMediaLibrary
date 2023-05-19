class UniversalMediaDescriptor extends Serializable {
  constructor(uid, title, author) {
    // uid should be populated by playlistsource impls
    this.uid = uid;
    this.title = title;
    this.author = author;
    // strings for which the media adapters can identify
    // ex. the YouTube adapter will self-select for any youtube links
    this.sources = [];

    // stops materialization of Media object
    this.excluded = false;
  }

  gen_fname() {
    return sanitize_fname(`${this.title} - ${this.author}`);
  }
}

module.exports = UniversalMediaDescriptor;