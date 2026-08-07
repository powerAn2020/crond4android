#!/system/bin/sh

if [ ! -f "/data/adb/crond/conf/KEEP_ON_UNINSTALL" ]; then
  rm -rf /data/adb/crond
fi
