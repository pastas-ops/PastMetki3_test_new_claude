# Устанавливает нативные виджеты в сгенерированный Android-проект.
import glob, os, shutil

A = 'android/app/src/main'
J = A + '/java/com/pastmetki/app'
os.makedirs(J, exist_ok=True)
for f in glob.glob('native/java/*.java'):
    shutil.copy(f, J)
shutil.copytree('native/res', A + '/res', dirs_exist_ok=True)
m = A + '/AndroidManifest.xml'
s = open(m, encoding='utf8').read()
if 'ChatsWidget' not in s:
    add = open('native/manifest_add.xml', encoding='utf8').read()
    s = s.replace('</application>', add + '\n    </application>')
    open(m, 'w', encoding='utf8').write(s)
print('widgets installed')
