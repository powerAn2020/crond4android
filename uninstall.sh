#!/system/bin/sh

if [ ! -f "/data/adb/crond/KEEP_ON_UNINSTALL" ]; then
  rm -rf /data/adb/crond
fi
