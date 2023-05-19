# Universal Media Library

[中文](README.zh.md)

## Dependencies

- yt-dlp
- ffmpeg

## Terminology

**UMD (Universal Media Descriptor)**: This term refers to the metadata
associated with each media file, including title, author, duration, and a number
of online sources for the media. The UMD also indicates whether it should be
excluded from library-wide syncing. The **library** maintains a list of all
UMDs, while individual playlists reference UMDs from this library.

**Media**: Media refers to the source file which is **materialized** onto the
disk through an adapter (e.g., YouTube/YouTube Music/Spotify). A media file can
be converted into desired formats, such as audio-only files.

## Pipeline

```bash
# Installation
ln -s abs_path_to/index.js /usr/bin/ulm-manager

# Create a library at current directory
ulm-manager

# Edit uml.ini to verify settings

# Create Playlist
ulm-manager playlist --add "name"
# Populate library and playlist with UMDs
# (use --help for advanced options)
ulm-manager playlist --populate "name" --query "youtube playlist url" --method "youtube"

# Materialize all UMDs in the library onto disk
ulm-manager sync

# Convert media
# (use --help for advanced options)
ulm-manager convert --video=false --ext "mp3"
```