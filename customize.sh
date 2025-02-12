#!/system/bin/sh
if [ "$BOOTMODE" != true ]; then
  ui_print "-----------------------------------------------------------"
  ui_print "! Please install in Magisk Manager or KernelSU Manager or APatch Manager"
  ui_print "! Install from recovery is NOT supported"
  abort "-----------------------------------------------------------"
fi

cronDataDir='/data/adb/crond'
if [ ! -d "${cronDataDir}" ]; then
  ui_print "- Creating ${cronDataDir}"
  mkdir -p "${cronDataDir}" && touch "${cronDataDir}/root"
fi

ui_print "- Installing crontab command"
crontabCmd='${MODPATH}/system/xbin/crontab'
mkdir -p "${MODPATH}/system/xbin"
{
  echo "#!/system/bin/sh"
  if [ "$KSU" = true ]; then
    echo "/data/adb/ksu/bin/busybox crontab -c '${cronDataDir}' \"\$@\""
  elif [ "$APATCH" = true ]; then
    echo "/data/adb/ap/bin/busybox crontab -c '${cronDataDir}' \"\$@\""
  else
    echo "/data/adb/magisk/busybox crontab -c '${cronDataDir}' \"\$@\""
  fi
} > "${crontabCmd}"

ui_print "- Setting permissions..."
set_perm "${crontabCmd}" 0 0 0755
set_perm "${MODPATH}/service.sh" 0 0 0755
set_perm "${MODPATH}/uninstall.sh" 0 0 0755
