#!/system/bin/sh

cronDataDir='/data/adb/crond'
args="crond -b -c ${cronDataDir} -L ${cronDataDir}/run.log"
# check version
if [ "$KSU" = true ]; then
  echo "- kernelSU version: $KSU_VER ($KSU_VER_CODE)"
  /data/adb/ksu/bin/busybox  $args
elif [ "$APATCH" = true ]; then
  echo "- APatch version: $APATCH_VER ($APATCH_VER_CODE)"
  /data/adb/ap/bin/busybox $args
else
  echo "- Magisk version: $MAGISK_VER ($MAGISK_VER_CODE)"
  /data/adb/magisk/busybox $args
fi