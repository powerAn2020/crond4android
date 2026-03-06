#!/system/bin/sh

cronDataDir='/data/adb/crond'
MODDIR="${0%/*}"
args="crond -b -c ${cronDataDir} -L ${cronDataDir}/run.log"
# 检测 busybox 路径
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

# 检查 crond 是否正在运行
is_running() {
  $BUSYBOX pgrep -f "${args}"
}

if is_running; then
  # 正在运行 → 停止
  pgrep -f "${args}" |xargs kill
  sleep 0.5
  if is_running; then
    echo "⚠ crond 停止失败"
  else
    echo "⏹ crond 已停止"
    sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $(date +"%Y-%m-%d %H:%M:%S") | ❌ Stopped ] /g" $MODDIR/module.prop
  fi
else
  # 未运行 → 启动
  $BUSYBOX ${args} -l 8
  sleep 0.5
  if is_running; then
    sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $(date +"%Y-%m-%d %H:%M:%S") | ✔️ Running ] /g" $MODDIR/module.prop
    echo "▶ crond 已启动"
  else
    echo "⚠ crond 启动失败"
  fi
fi
