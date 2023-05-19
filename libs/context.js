const fs = require('fs');
const fse = require('fs-extra');
const ini = require('ini');

const UniversalMediaDescriptor = require('./core/umd');
const Playlist = require('./core/playlist');

const { globSync } = require('glob')

class UMLContext {
  constructor(path) {
    this.prefix = path;

    this.umd = {};
    this.playlists = {};

    this.MEDIA_ADAPTERS = [require('./core/impl/youtube')];

    this.media = [];

    this.config = {
      youtube: {
        backend: 'yt-dlp',
        sourceFormat: 'mkv'
      }
    };
  }

  _init_dirs() {
    const that = this;

    [
      './data',
      './data/umds',
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

    this.reloadUMDs();
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
    return this.umd[uid];
  }

  setUMD(umd) {
    return this.umd[umd.uid] = umd;
  }

  removeUMD(umd) {
    let playlists = umd.playlists;
    for (let name of playlists) {
      this.getPlaylist(name).removeMedia(umd);
    }
    delete this.umd[umd.uid];
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

  reloadUMDs() {
    this.umd = {};

    const path = this.path('./data/umds');

    const files = globSync(`${path}/*.json`);

    for (const file of files) {
      const umd = UniversalMediaDescriptor.fromJSON(fs.readFileSync(file));

      if (!umd.uid?.length) {
        throw new Error(`${file}: Likely not a valid UMD object!`);
      }

      this.setUMD(umd);
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

  saveUMDs() {
    const path = this.path('./data/umds/');

    fse.emptyDirSync(path);

    for (const id in this.umd) {
      const umd = this.getUMD(id);

      if (umd?.uid)
        fs.writeFileSync(path + '/' + umd.gen_fname() + '.json', umd.toJSON(2));
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