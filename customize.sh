#!/system/bin/sh
if [ "$BOOTMODE" != true ]; then
  ui_print "------------------------------"
  ui_print "! Please install in Magisk Manager or KernelSU Manager or APatch Manager"
  ui_print "! Install from recovery is NOT supported"
  abort "------------------------------"
fi

cronDataDir='/data/adb/crond'
if [ ! -d "${cronDataDir}" ]; then
  ui_print "- Creating ${cronDataDir}"
  mkdir -p "${cronDataDir}" && touch "${cronDataDir}/root"
fi

install_crontab(){
  ui_print "- Installing crontab command"
  mkdir -p "${MODPATH}/system/bin"
  {
    echo "#!/system/bin/sh"
    if [ "$KSU" = true ]; then
      echo "/data/adb/ksu/bin/busybox crontab -c '${cronDataDir}'"' $@'
    elif [ "$APATCH" = true ]; then
      echo "/data/adb/ap/bin/busybox crontab -c '${cronDataDir}'"' $@'
    else
      echo "/data/adb/magisk/busybox crontab -c '${cronDataDir}'"' $@'
    fi
  } > "${MODPATH}/system/bin/crontab"
}

ui_print ""
ui_print "------------------------------"
ui_print "- Do you want install crontab command?"
ui_print "- This operation will not affect the operation of background services."
ui_print "- You can manage it through the UI or by setting up an alias to run it."
ui_print "- You can create the /sdcard/crond4android.setup file to automatically install the crontab command. Write 0 to skip installation, or write 1 to proceed with installation."
ui_print ""

if [ -f /sdcard/crond4android.setup ]; then
  ui_print "- Detected file /sdcard/crond4android.setup ."
  if [ "$(sed -n 1p /sdcard/crond4android.setup)" = "1" ]; then
    ui_print "- Auto install crontab command."
    install_crontab
  else
    ui_print "- Skip installation crontab command."
  fi
else
  ui_print "- Press Vol UP to install crontab command"
  ui_print "- Other: No"
  # 循环检测按键事件
  while true ; do
    getevent -lc 1 2>&1 | grep KEY_VOLUME > $TMPDIR/events
    sleep 1
    if $(cat $TMPDIR/events | grep -q KEY_VOLUMEUP) ; then
      install_crontab
      break
    else
      ui_print "- Skip installation crontab command."
      break
    fi
  done
fi


ui_print "- Setting permissions"
set_perm_recursive $MODPATH 0 0 0755 0755
ui_print "- The background service installation is complete."
