#!/bin/bash
# Проверка готового APK: иконка, версия, виджеты, разрешения.
set -euo pipefail
APK=android/app/build/outputs/apk/debug/app-debug.apk
test -f "$APK"
AAPT=$(ls "$ANDROID_HOME"/build-tools/*/aapt2 | sort -V | tail -1)
"$AAPT" dump badging "$APK" | grep -E "^package|application-label:|versionName" | head -5
"$AAPT" dump badging "$APK" | grep -q "application-icon" || { echo "::error::нет иконки приложения в APK"; exit 1; }
unzip -l "$APK" | grep -q "ic_launcher" || { echo "::error::нет ресурсов ic_launcher в APK"; exit 1; }
"$AAPT" dump xmltree --file AndroidManifest.xml "$APK" > /tmp/manifest.txt
for w in ChatsWidget NotesWidget Notes2Widget Notes4Widget DeadlineWidget QuickWidget Quick2Widget Quick22Widget Quick33Widget PlusWidget ProgressWidget TodayWidget ChatsService NotesService DeadlinesService ToggleActivity WidgetConfigActivity MsgJobService BIND_JOB_SERVICE appwidget.provider POST_NOTIFICATIONS SCHEDULE_EXACT_ALARM RECEIVE_BOOT_COMPLETED; do
  grep -q "$w" /tmp/manifest.txt || { echo "::error::в манифесте APK нет $w"; exit 1; }
done
APKSIGNER=$(ls "$ANDROID_HOME"/build-tools/*/apksigner 2>/dev/null | sort -V | tail -1 || true)
if [ -n "$APKSIGNER" ]; then
  "$APKSIGNER" verify --print-certs "$APK" | tee /tmp/cert.txt || true
  EXP=10fa543fb5fe807eb5c623105edad7e2a2258a93d1b954bf55fd6dd161e0edbc
  grep -qi "$EXP" /tmp/cert.txt || echo "::warning::APK подписан НЕ ключом debug.keystore из проекта: поверх старой версии он может не установиться"
fi
echo "APK проверен: иконка, версия, 10 виджетов, настройка фона, разрешения"
