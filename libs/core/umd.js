const fs = require('fs');

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
    // relative path under media/
    this.materialized = null;
  }

  // 1. deletes material if excluded
  // 2. verifies if material exists
  // returns if deleted
  verifyMaterial() {
    if (!this.materialized) return;

    if (fs.existsSync(this.resolvedMaterial)) {
      if (this.excluded) {
        fs.unlinkSync(this.resolvedMaterial);
        this.materialized = null;
        return true;
      } else {
        return;
      }
    }
    
    this.materialized = null;
  }

  get resolvedMaterial() {
    return CONTEXT.path('media/' + this.materialized);
  }

  gen_fname() {
    return sanitize_fname(`${this.title} - ${this.author} - ${this.uid}`);
  }
}

module.exports = UniversalMediaDescriptor;