# crond4Android

支持 KernelSU、APatch、Magisk下运行。调用对应框架busybox实现crond定时。

从 `1.0.3` 版本开始支持安装时通过创建文件 `/sdcard/crond4android.setup` 或者音量键来控制是否安装命令行

`/sdcard/crond4android.setup` 文件内容为1则自动安装crontab命令，其他则不安装
> 通常用于解决环境检测时，非必要不推荐安装crontab命令，且安装后会和lsposed内测版冲突，导致lsposed失效，原因暂时未知。建议使用别名方式。

## 数据目录

日志: `/data/adb/crond/run.log`

任务数据: `/data/adb/crond/`

crontab: `/system/bin/crontab`
`注意：如果替换了root实现方案，记得修改这个脚本，或者重新安装一次，不然无法执行。`

创建`/data/adb/crond/KEEP_ON_UNINSTALL`可以在卸载模块时保留任务数据

## 使用样例

```shell
# 创建任务 (也可以直接编辑文件)
# alias crontab="root方案路径(参考customize.sh)/busybox crontab -c '/data/adb/crond'"
echo '30 4 * * * echo "" > /data/adb/crond/run.log' >> /data/adb/crond/root # for root user 
# 查看任务
crontab -l
```
