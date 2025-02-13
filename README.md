# crond4Android

支持 KernelSU、APatch、Magisk下运行。调用对应框架busybox实现crond定时。

## 数据目录

日志: `/data/adb/crond/run.log`

任务数据: `/data/adb/crond/`

crontab: `/system/xbin/crontab`
`注意：如果替换了root实现方案，记得修改这个脚本，或者重新安装一次，不然无法执行。`

创建`/data/adb/crond/KEEP_ON_UNINSTALL`可以在卸载模块时保留任务数据
## 使用样例

```shell
# 创建任务 (也可以直接编辑文件)
echo '30 4 * * * echo "" > /data/adb/crond/run.log' >> /data/adb/crond/root # for root user 
```
