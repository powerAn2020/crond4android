#!/system/bin/sh

cronDataDir='/data/adb/crond'
args="crond -b -c ${cronDataDir} -L ${cronDataDir}/run.log"
# 判断是否为 KernelSU
if [ "$KSU" = "true" ] || [ -d "/data/adb/ksu" ]; then
    BUSYBOX="/data/adb/ksu/bin/busybox"
# 判断是否为 Magisk
elif [ "$MAGISK_VER" != "" ] || [ -d "/data/adb/magisk" ]; then
    BUSYBOX="/data/adb/magisk/busybox"
# 判断是否为 APatch
elif [ "$APATCH" = "true" ] || [ -d "/data/adb/ap" ]; then
    BUSYBOX="/data/adb/ap/bin/busybox"
else
    echo "⚠ 未检测到 Magisk、KernelSU 或 APatch"
    exit 1
fi

$BUSYBOX ${args}
sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $(date +"%Y-%m-%d %H:%M:%S") | ✔️ Running ] /g" $MODDIR/module.prop
