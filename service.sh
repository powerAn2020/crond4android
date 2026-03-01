#!/system/bin/sh

cronDataDir='/data/adb/crond'
args="crond -b -c ${cronDataDir} -L ${cronDataDir}/run.log"
# 检查是否为 KernelSU
if [ "$KSU" = "true" ] || [ -f "/data/adb/ksu" ]; then
    BUSYBOX="/data/adb/ksu/bin/busybox"
# 检查是否为 Magisk
elif [ "$MAGISK_VER" != "" ] || [ -d "/data/adb/magisk" ]; then
    BUSYBOX="/data/adb/magisk/busybox"
# 检查是否为 APatch (额外补充)
elif [ "$APATCH" = "true" ] || [ -d "/data/adb/ap" ]; then
    BUSYBOX="/data/adb/ap/bin/busybox"
else
    echo "⚠ 未检测到 Magisk、KernelSU 或 APatch"
    exit 1
fi

$BUSYBOX ${args}
