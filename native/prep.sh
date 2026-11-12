#!/bin/bash
# Общая подготовка Android-проекта. Любая ошибка останавливает сборку (set -e).
set -euo pipefail
npx cap add android
ICON=android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
test -f "$ICON"
H1=$(sha256sum "$ICON" | cut -d' ' -f1)
npx @capacitor/assets@3.0.5 generate --android --iconBackgroundColor '#0E0C16' --iconBackgroundColorDark '#0E0C16'
H2=$(sha256sum "$ICON" | cut -d' ' -f1)
if [ "$H1" = "$H2" ]; then echo "::error::Иконка запуска не была заменена на PastMetki"; exit 1; fi
find android/app/src/main/res -name 'ic_launcher_foreground.png' | grep -q . || { echo "::error::нет adaptive foreground"; exit 1; }
echo "Иконка PastMetki установлена"
npx cap sync android
mkdir -p ~/.android && cp debug.keystore ~/.android/debug.keystore
sed -i "s/versionCode 1/versionCode ${GITHUB_RUN_NUMBER:-1}/" android/app/build.gradle
sed -i 's/versionName "1.0"/versionName "1.0.10"/' android/app/build.gradle
grep -q 'versionName "1.0.10"' android/app/build.gradle
sed -i 's#</manifest>#<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/><uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/><uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/></manifest>#' android/app/src/main/AndroidManifest.xml
grep -q 'android:icon="@mipmap/ic_launcher"' android/app/src/main/AndroidManifest.xml
chmod +x android/gradlew
