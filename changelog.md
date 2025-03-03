# 版本 1.0.3

- 安装时通过创建文件 `/sdcard/crond4android.setup` 或者音量键来控制是否安装命令行
- 修改crontab命令的安装路径到`/system/bin/`

> 通常用于解决环境检测时，非必要不推荐安装crontab命令，且安装后会和lsposed内测版冲突，导致lsposed失效，原因未知。建议使用别名方式。
