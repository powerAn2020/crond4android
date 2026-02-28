#!/system/bin/sh

cronDataDir='/data/adb/crond'
MODDIR="${0%/*}"

# 检测 busybox 路径
# 判断是否为 KernelSU
if [ "$KSU" = "true" ] || [ -f "/data/adb/ksu/bin/busybox" ]; then
    ENBUSYBOXV="KernelSU"
# 判断是否为 Magisk
elif [ "$MAGISK_VER" != "" ] || [ -d "/data/adb/magisk" ]; then
    BUSYBOX="Magisk"
# 判断是否为 APatch (额外补充)
elif [ "$APATCH" = "true" ]; then
    BUSYBOX="APatch"
else
    echo "⚠ 未检测到 Magisk、KernelSU 或 APatch"
    exit 1
fi

# 检查 crond 是否正在运行
is_running() {
  pgrep -f 'crond -b -c /data/adb/crond'
}

if is_running; then
  # 正在运行 → 停止
  killall crond 2>/dev/null
  sleep 0.5
  if is_running; then
    echo "⚠ crond 停止失败"
  else
    echo "⏹ crond 已停止"
  fi
else
  # 未运行 → 启动
  $BUSYBOX crond -b -c "${cronDataDir}" -L "${cronDataDir}/run.log"
  sleep 0.5
  if is_running; then
    echo "▶ crond 已启动"
  else
    echo "⚠ crond 启动失败"
  fi
fi
