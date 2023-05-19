const fs = require('fs');
const fse = require('fs-extra');
const ini = require('ini');

const Playlist = require('./core/playlist');

const { globSync } = require('glob')

class UMLContext {
  constructor(path) {
    this.prefix = path;

    this.ums = {};
    this.playlists = {};


    this.media = [];

    this.config = {
      youtube: {
        backend: 'youtube-dl'
      }
    };
  }

  _init_dirs() {
    const that = this;

    [
      './data',
      './data/uml',
      './data/playlists',
      './media',
      './media/youtube',
      './media/spotify',
      './converted',
      './converted/mp3',
      './converted/wav'
    ].forEach(x => {
      x = that.path(x);
      if (!fs.existsSync(x))
        fs.mkdirSync(x);
    });
  }

  init() {
    this._read_config();
    this._init_dirs();

    this.reloadPlaylists();
    // init all UniversalMediaDescriptors
  }

  isUMLDirectory() {
    return fs.existsSync(this.path('uml.ini'));
  }

  _read_config() {
    const settings_path = this.path('uml.ini');

    if (!fs.existsSync(settings_path)) {
      fs.writeFileSync(settings_path, ini.stringify(this.config))
    }

    let config = ini.parse(fs.readFileSync(settings_path, 'utf-8'));
    mergeDeep(this.config, config);
  }

  path(x) {
    return this.prefix + '/' + x;
  }

  getUMD(uid) {
    return this.ums[uid];
  }

  setUMD(umd) {
    return this.ums[umd.uid] = umd;
  }

  removeUMD(umd) {
    delete this.ums[umd.uid];
  }

  reloadPlaylists() {
    this.playlists = {};

    const path = this.path('./data/playlists');

    const files = globSync(`${path}/*.json`);

    for (const file of files) {
      const playlist = Playlist.fromJSON(fs.readFileSync(file));

      if (!playlist.name?.length) {
        throw new Error(`${file}: Likely not a valid playlist object!`);
      }

      this.setPlaylist(playlist);
    }
  }

  savePlaylists() {
    const path = this.path('./data/playlists/');

    fse.emptyDirSync(path);

    for (const name in this.playlists) {
      const playlist = this.getPlaylist(name);

      if (playlist?.name)
        fs.writeFileSync(path + '/' + playlist.gen_fname() + '.json', playlist.toJSON(2));
    }
  }

  getPlaylist(name) {
    return this.playlists[name];
  }

  setPlaylist(playlist) {
    return this.playlists[playlist.name] = playlist;
  }

  removePlaylist(playlist) {
    delete this.playlists[playlist?.name || playlist];
  }
}

module.exports = UMLContext;