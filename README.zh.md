# 通用媒体库

## 依赖项

- yt-dlp
- ffmpeg

## 术语

**UMD (通用媒体描述符)**：描述了媒体的标题，作者，时长，一个媒体的多个在线来源，以及是否应在整个**库**中同步时排除UMD。库维护了UMD的列表，而每个播放列表都从库中引用UMD。

**媒体**：媒体是通过适配器（例如YouTube/YouTube音乐/Spotify）**实体化**到磁盘上的物理源文件；媒体可以被转换为诸如仅音频文件等期望的格式。

## 途径

```bash
# 安装
npm install
ln -s abs_path_to/index.js /usr/bin/uml

# 在当前目录创建一个库
uml

# 编辑 uml.ini 以验证设置

# 创建新的播放列表
uml playlist --add "名称"

# 将UMDs添加到库和播放列表中
# (使用 --help 查看高级选项)
uml playlist --populate "名称" --query "youtube播放列表的url" --method "youtube"

# 将库中的所有UMD实体化到磁盘上
uml sync

# 将媒体文件转换为所需格式
# (使用 --help 查看高级选项，例如，要转换为仅音频，设置 --video=false)
uml convert --video=false --ext "mp3"
```
