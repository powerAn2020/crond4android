
if [ "$BOOTMODE" != true ]; then
  ui_print "-----------------------------------------------------------"
  ui_print "! Please install in Magisk Manager or KernelSU Manager or APatch Manager"
  ui_print "! Install from recovery is NOT supported"
  abort "-----------------------------------------------------------"
fi

cronDataDir='/data/adb/crond'
crontabCmd="${MODPATH}/system/xbin/crontab"

if [ ! -d ${cronDataDir} ];then
  ui_print "mkdir ${cronDataDir}"
  mkdir -p ${cronDataDir}
  touch ${cronDataDir}/root
fi

ui_print "- Installed crontab cmd to ${crontabCmd}"
echo '#!/system/bin/sh' >${crontabCmd}

if [ "$KSU" = true ]; then
  ui_print "- kernelSU version: $KSU_VER ($KSU_VER_CODE)"
  echo '/data/adb/ksu/bin/busybox crontab -c '${cronDataDir}' $@' >> ${crontabCmd}
elif [ "$APATCH" = true ]; then
  ui_print "- APatch version: $APATCH_VER ($APATCH_VER_CODE)"
  echo '/data/adb/ap/bin/busybox crontab -c '${cronDataDir}' $@' >> ${crontabCmd}
else
  ui_print "- Magisk version: $MAGISK_VER ($MAGISK_VER_CODE)"
  echo '/data/adb/magisk/bin/busybox crontab -c '${cronDataDir}' $@' >> ${crontabCmd}
fi

ui_print "set_perm"

set_perm  ${crontabCmd}    0  0  0755
set_perm  $MODPATH/service.sh    0  0  0755
set_perm  $MODPATH/uninstall.sh    0  0  0755

ui_print "done"
