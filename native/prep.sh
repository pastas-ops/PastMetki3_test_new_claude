#!/bin/bash
# Общая подготовка Android-проекта. Любая ошибка останавливает сборку (set -e).
set -euo pipefail
# Защита от поломки виджетов: RemoteViews не умеет простой View и Space
if grep -rnE '<(View|Space)([ />]|$)' native/res/layout; then echo "::error::В layout виджетов нельзя использовать View или Space (виджеты перестанут загружаться)"; exit 1; fi
VER=$(node -p "require('./package.json').version")
# versionCode = минуты с 1970 года: всегда растёт, даже если репозиторий новый (так обновление ставится поверх старой версии)
VC=$(( $(date +%s) / 60 ))
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
sed -i "s/versionCode 1/versionCode ${VC}/" android/app/build.gradle
sed -i "s/versionName \"1.0\"/versionName \"${VER}\"/" android/app/build.gradle
grep -q "versionCode ${VC}" android/app/build.gradle
grep -q "versionName \"${VER}\"" android/app/build.gradle
# Подпись ВСЕГДА ключом проекта (debug.keystore), а не тем, что окажется в ~/.android: иначе APK не ставится поверх старого
cat >> android/app/build.gradle <<EOF

android {
    signingConfigs {
        debug {
            storeFile file("$(pwd)/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
}
EOF
echo "Версия ${VER}, versionCode ${VC}"
sed -i 's#</manifest>#<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/><uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/><uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/></manifest>#' android/app/src/main/AndroidManifest.xml
grep -q 'android:icon="@mipmap/ic_launcher"' android/app/src/main/AndroidManifest.xml
chmod +x android/gradlew
