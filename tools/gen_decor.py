#!/usr/bin/env python3
# PastMetki: генератор графики для магазина украшений (фоны-сцены и узоры, кольца рамок аватарки).
# Запуск:  python3 tools/gen_decor.py            (из корня проекта)
# Что делает: рисует SVG, кодирует их в data-URI и записывает в www/index.html между маркерами
#   /*DECOR-START*/ ... /*DECOR-END*/  как CSS-переменные  --b-ИМЯ (фоны, 400x560)  и  --f-ИМЯ (кольца рамок, 100x100).
# В JS (index.html) таблицы BGS/FRS ссылаются на них:  'var(--b-night)'  и  FRS[..][5]='beads'.
# Все анимации внутри SVG (SMIL), поэтому работают как CSS-фон без JS.
import random, math, re, sys, os

def enc(s):
    s = re.sub(r'\s+', ' ', s.strip())
    s = re.sub(r'> <', '><', s)
    return s.replace('%', '%25').replace('#', '%23').replace('<', '%3C').replace('>', '%3E').replace('"', "'")

NS = "xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'"

def bg(inner, defs=''):
    return f"<svg {NS} viewBox='0 0 400 560' preserveAspectRatio='xMidYMid slice'><defs>{defs}</defs>{inner}</svg>"

def ring(inner, spin=0):
    g = inner
    if spin:
        g = f"<g>{inner}<animateTransform attributeName='transform' type='rotate' from='0 50 50' to='{360 if spin > 0 else -360} 50 50' dur='{abs(spin)}s' repeatCount='indefinite'/></g>"
    return f"<svg {NS} viewBox='0 0 100 100'>{g}</svg>"

def lg(id, stops, x2=0, y2=1):
    s = ''.join(f"<stop offset='{o}' stop-color='{c}'/>" for o, c in stops)
    return f"<linearGradient id='{id}' x1='0' y1='0' x2='{x2}' y2='{y2}'>{s}</linearGradient>"

def twinkle(R, n, tw, ymax=560, rmax=1.7, colors=('#fff',), xmin=0, xmax=400):
    out = ''
    for i in range(n):
        x, y = R.randint(xmin, xmax), R.randint(0, ymax)
        r = round(R.uniform(.5, rmax), 1)
        c = colors[i % len(colors)]
        if i < tw:
            out += f"<circle cx='{x}' cy='{y}' r='{r}' fill='{c}'><animate attributeName='opacity' values='1;.15;1' dur='{R.randint(2,5)}s' begin='-{R.randint(0,4)}s' repeatCount='indefinite'/></circle>"
        else:
            out += f"<circle cx='{x}' cy='{y}' r='{r}' fill='{c}' opacity='.8'/>"
    return out

def drift(tile_w, tile_h, dx, dy, dur):
    return f"<animateTransform attributeName='patternTransform' type='translate' from='0 0' to='{dx} {dy}' dur='{dur}s' repeatCount='indefinite'/>"

B = {}   # фоны
F = {}   # кольца рамок

# ---------------------------------------------------------------- ФОНЫ
def b_night():
    R = random.Random(11)
    s = "<rect width='400' height='560' fill='url(#s)'/>" + twinkle(R, 46, 14, 330)
    s += "<circle cx='312' cy='104' r='34' fill='#fff4cf'/><circle cx='326' cy='96' r='30' fill='#2b2570' opacity='.55'/>"
    s += "<ellipse cx='312' cy='104' rx='60' ry='60' fill='url(#mg)'/>"
    # дома: три ряда
    for col, base, hmax in [('#1a1442', 330, 120), ('#120d33', 380, 100), ('#0a0720', 430, 90)]:
        x = -10
        while x < 410:
            w = R.randint(28, 52)
            h = R.randint(int(hmax * .45), hmax)
            top = base - h + 60
            s += f"<rect x='{x}' y='{top}' width='{w}' height='{560 - top}' fill='{col}'/>"
            if col != '#1a1442':
                for wy in range(top + 8, 548, 14):
                    for wx in range(x + 5, x + w - 6, 11):
                        if R.random() < .2:
                            fill = '#ffd166' if R.random() < .7 else '#8be9ff'
                            if R.random() < .12:
                                s += f"<rect x='{wx}' y='{wy}' width='5' height='7' fill='{fill}'><animate attributeName='opacity' values='1;.2;1' dur='{R.randint(3,7)}s' begin='-{R.randint(0,5)}s' repeatCount='indefinite'/></rect>"
                            else:
                                s += f"<rect x='{wx}' y='{wy}' width='5' height='7' fill='{fill}'/>"
            x += w + R.randint(0, 3)
    s += "<rect y='520' width='400' height='40' fill='#05030f'/>"
    # самолётик-огонёк
    s += "<g><circle r='2.4' fill='#ff5252'><animate attributeName='opacity' values='1;0;1' dur='1.2s' repeatCount='indefinite'/></circle><animateMotion dur='22s' repeatCount='indefinite' path='M-20 90 C 120 40, 260 160, 430 60'/></g>"
    d = lg('s', [(0, '#0b1038'), (.55, '#3a2a7a'), (.85, '#c2457a'), (1, '#ff8a5c')]) + "<radialGradient id='mg'><stop offset='.4' stop-color='#fff4cf' stop-opacity='.35'/><stop offset='1' stop-color='#fff4cf' stop-opacity='0'/></radialGradient>"
    return bg(s, d)

def ghost(x, y, sc, fill, dur, delay):
    return (f"<g transform='translate({x} {y}) scale({sc})'><g><animateTransform attributeName='transform' type='translate' values='0 0;0 -7;0 0' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>"
            f"<path d='M-14 0a14 14 0 0 1 28 0v24l-4.7-4-4.6 4-4.7-4-4.6 4-4.7-4-4.7 4z' fill='{fill}'/>"
            f"<ellipse cx='-5' cy='-1' rx='2.2' ry='3' fill='#2a1a55'/><ellipse cx='5' cy='-1' rx='2.2' ry='3' fill='#2a1a55'/>"
            f"<ellipse cx='-9' cy='5' rx='2.6' ry='1.6' fill='#ff80ab' opacity='.55'/><ellipse cx='9' cy='5' rx='2.6' ry='1.6' fill='#ff80ab' opacity='.55'/>"
            f"<ellipse cx='0' cy='6' rx='2' ry='2.6' fill='#2a1a55'/></g></g>")

def b_ghosts():
    pat = ("<pattern id='p' width='140' height='140' patternUnits='userSpaceOnUse'>" + drift(140, 140, 0, -140, 24)
           + ghost(30, 36, 1.0, '#f4eeff', 3.2, 0) + ghost(100, 70, .7, '#bfe9ff', 2.6, 1) + ghost(62, 112, .55, '#ffd1ec', 3.6, 2)
           + "<circle cx='120' cy='20' r='2' fill='#fff' opacity='.7'/><circle cx='8' cy='90' r='1.6' fill='#fff' opacity='.6'/></pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)'/><rect width='400' height='560' fill='url(#v)'/>"
    d = lg('g', [(0, '#1b1040'), (1, '#4b2c92')]) + pat + "<radialGradient id='v' cx='.5' cy='.45' r='.75'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.45'/></radialGradient>"
    return bg(s, d)

def cat(x, y, sc, fur, ear, dur, delay):
    return (f"<g transform='translate({x} {y}) scale({sc})'><g><animateTransform attributeName='transform' type='rotate' values='-5;5;-5' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>"
            f"<path d='M-17 -4L-16 -22 -5 -14zM17 -4L16 -22 5 -14z' fill='{fur}'/><path d='M-14.5 -9L-14 -17 -8.5 -13zM14.5 -9L14 -17 8.5 -13z' fill='{ear}'/>"
            f"<ellipse cx='0' cy='0' rx='18' ry='15' fill='{fur}'/>"
            f"<ellipse cx='-6.5' cy='-1' rx='2.2' ry='3' fill='#1d1d2b'/><ellipse cx='6.5' cy='-1' rx='2.2' ry='3' fill='#1d1d2b'/>"
            f"<circle cx='-5.8' cy='-2' r='.8' fill='#fff'/><circle cx='7.2' cy='-2' r='.8' fill='#fff'/>"
            f"<path d='M-2 5h4l-2 2.4z' fill='{ear}'/><path d='M0 7.4q-3 3-5.5 1M0 7.4q3 3 5.5 1' stroke='#1d1d2b' stroke-width='1' fill='none' stroke-linecap='round'/>"
            f"<path d='M-20 3l-9-2M-20 6l-9 3M20 3l9-2M20 6l9 3' stroke='#fff' stroke-width='1' opacity='.7'/></g></g>")

def b_cats():
    pat = ("<pattern id='p' width='150' height='150' patternUnits='userSpaceOnUse'>" + drift(150, 150, 150, 150, 40)
           + cat(36, 40, 1.0, '#ffb74d', '#ff8a80', 3, 0) + cat(112, 78, .8, '#cfd8dc', '#f48fb1', 3.6, 1) + cat(54, 118, .62, '#8d6e63', '#ffab91', 2.8, 2)
           + "<path d='M122 24l2 5 5 .5-4 3.5 1.2 5-4.2-2.7-4.2 2.7 1.2-5-4-3.5 5-.5z' fill='#ffe082' opacity='.9'/></pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)'/>"
    return bg(s, lg('g', [(0, '#12304a'), (1, '#1d5a73')]) + pat)

def mini_fire(x, y, sc, col, dur, delay, travel):
    return (f"<g color='{col}'><animateTransform attributeName='transform' type='translate' values='{x} {y};{x + 14} {y - travel * .5};{x - 6} {y - travel}' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>"
            f"<use href='#f' transform='scale({sc})'/><animate attributeName='opacity' values='0;1;1;0' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/></g>")

def b_embers():
    R = random.Random(5)
    s = "<rect width='400' height='560' fill='url(#g)'/><ellipse cx='200' cy='600' rx='300' ry='160' fill='url(#h)'/>"
    cols = ['#ffb300', '#ff7043', '#ffd54f']
    for i in range(14):
        s += mini_fire(R.randint(20, 380), 620, round(R.uniform(1.1, 2.1), 2), cols[i % 3], R.randint(9, 17), R.randint(0, 16), 700)
    s += twinkle(R, 20, 6, 560, 1.3, ('#ffb74d', '#ffe082'))
    d = (lg('g', [(0, '#14070a'), (1, '#3b1208')]) + "<radialGradient id='h'><stop offset='0' stop-color='#ff6d00' stop-opacity='.55'/><stop offset='1' stop-color='#ff6d00' stop-opacity='0'/></radialGradient>"
         + "<g id='f'><path d='M0 -17c1.4 5 7 7 7 14a7 7 0 0 1-14 0c0-3.4 2.2-4.6 3.4-8 1.2 1.2 2.2 2.2 2.2 3.6 1.2-2.2 1.2-5.8 1.4-9.6z' fill='currentColor'/>"
         "<ellipse cx='-2.6' cy='-1' rx='1.8' ry='2.4' fill='#fff'/><ellipse cx='2.8' cy='-1' rx='1.8' ry='2.4' fill='#fff'/><circle cx='-2.2' cy='-.6' r='1' fill='#222'/><circle cx='3.2' cy='-.6' r='1' fill='#222'/>"
         "<path d='M-1.8 3q1.8 1.8 3.6 0' stroke='#6a2a00' stroke-width='.9' fill='none'/></g>")
    return bg(s, d)

def b_stars():
    R = random.Random(21)
    s = "<rect width='400' height='560' fill='url(#g)'/>" + twinkle(R, 50, 18, 560, 1.6, ('#fff', '#cfe3ff', '#ffe9b0'))
    for i in range(9):
        x, y = R.randint(60, 460), R.randint(-80, 300)
        dur = R.randint(3, 7)
        s += (f"<g><g transform='rotate(-35)'><rect x='0' y='-1' width='{R.randint(50,90)}' height='2' rx='1' fill='url(#t)'/><circle cx='0' cy='0' r='2.2' fill='#fff'/></g>"
              f"<animateTransform attributeName='transform' type='translate' values='{x} {y};{x - 260} {y + 190}' dur='{dur}s' begin='-{R.randint(0,7)}s' repeatCount='indefinite'/>"
              f"<animate attributeName='opacity' values='0;1;1;0' dur='{dur}s' begin='-{R.randint(0,7)}s' repeatCount='indefinite'/></g>")
    d = lg('g', [(0, '#050a24'), (.6, '#10265e'), (1, '#27408f')]) + "<linearGradient id='t' x1='1' y1='0' x2='0' y2='0'><stop offset='0' stop-color='#fff'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient>"
    return bg(s, d)

def wave_path(y, amp, wl=200, n=4):
    d = f"M0 {y}"
    for i in range(n):
        d += f"q{wl/4} {-amp} {wl/2} 0 t{wl/2} 0"
    return d + f"V560H0z"

def b_waves():
    s = "<rect width='400' height='560' fill='url(#g)'/><circle cx='320' cy='120' r='46' fill='#fff2b8' opacity='.85'/>"
    for i, (y, a, col, dur, op) in enumerate([(300, 16, '#4dd0e1', 14, .45), (350, 20, '#26a6c4', 10, .6), (405, 24, '#1478a8', 7, .8), (465, 22, '#0b4c80', 5, 1)]):
        s += f"<path d='{wave_path(y, a, 200, 6)}' fill='{col}' opacity='{op}'><animateTransform attributeName='transform' type='translate' from='{0 if i % 2 == 0 else -200}' to='{-200 if i % 2 == 0 else 0}' dur='{dur}s' repeatCount='indefinite'/></path>"
    s += "<g fill='#fff' opacity='.55'><circle cx='60' cy='430' r='3'><animate attributeName='cy' values='430;300' dur='6s' repeatCount='indefinite'/><animate attributeName='opacity' values='.6;0' dur='6s' repeatCount='indefinite'/></circle><circle cx='90' cy='480' r='2'><animate attributeName='cy' values='480;350' dur='5s' repeatCount='indefinite'/><animate attributeName='opacity' values='.6;0' dur='5s' repeatCount='indefinite'/></circle></g>"
    return bg(s, lg('g', [(0, '#ff9d6c'), (.5, '#ffd9a0'), (1, '#6fd3e8')]))

def hexpath(r):
    pts = [(r * math.cos(math.radians(60 * i + 30)), r * math.sin(math.radians(60 * i + 30))) for i in range(6)]
    return 'M' + 'L'.join(f"{x:.1f} {y:.1f}" for x, y in pts) + 'z'

def b_hex():
    r = 26
    w = round(r * math.sqrt(3), 1)
    h = r * 3
    pat = (f"<pattern id='p' width='{w}' height='{h}' patternUnits='userSpaceOnUse' patternTransform='scale(1)'>" + drift(w, h, 0, h, 14)
           + f"<path d='{hexpath(r - 1.5)}' transform='translate({w/2} {r})' fill='none' stroke='#26d9e8' stroke-width='1.4' opacity='.55'/>"
           + f"<path d='{hexpath(r - 1.5)}' transform='translate(0 {r * 2.5})' fill='none' stroke='#26d9e8' stroke-width='1.4' opacity='.55'/>"
           + f"<path d='{hexpath(r - 1.5)}' transform='translate({w} {r * 2.5})' fill='none' stroke='#26d9e8' stroke-width='1.4' opacity='.55'/></pattern>")
    R = random.Random(3)
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)'/>"
    for i in range(7):
        x = R.randint(0, 7) * w + (w / 2 if R.random() < .5 else 0)
        y = R.randint(0, 11) * r * 1.5
        s += f"<path d='{hexpath(r - 3)}' transform='translate({x:.1f} {y:.1f})' fill='#26d9e8'><animate attributeName='opacity' values='0;.5;0' dur='{R.randint(3,6)}s' begin='-{R.randint(0,5)}s' repeatCount='indefinite'/></path>"
    return bg(s, lg('g', [(0, '#061a2b'), (1, '#0b3b55')]) + pat)

def b_mount():
    R = random.Random(9)
    s = "<rect width='400' height='560' fill='url(#g)'/>" + twinkle(R, 34, 10, 260, 1.4)
    s += "<circle cx='96' cy='120' r='40' fill='#fff7da'/><circle cx='96' cy='120' r='62' fill='url(#m)'/>"
    for y, dur, a in [(150, 40, .5), (210, 30, .35)]:
        s += f"<g opacity='{a}' fill='#fff'><ellipse cx='60' cy='{y}' rx='60' ry='10'/><ellipse cx='110' cy='{y - 6}' rx='34' ry='9'/><ellipse cx='30' cy='{y - 3}' rx='30' ry='8'/><animateTransform attributeName='transform' type='translate' values='-120 0;520 0' dur='{dur}s' repeatCount='indefinite'/></g>"
    def mt(pts, col):
        return f"<path d='M-10 560L{pts}L410 560z' fill='{col}'/>"
    s += mt("-10 330 70 250 120 300 190 200 260 290 310 240 410 320", '#5a3f8f')
    s += mt("-10 400 50 340 110 390 170 320 240 400 300 350 410 410", '#3a2a6b')
    s += mt("-10 470 60 420 130 470 210 410 290 480 350 440 410 480", '#231a47')
    for x, y, sc in [(40, 505, 1), (80, 520, .8), (330, 498, 1.1), (365, 515, .8), (290, 525, .7)]:
        s += f"<path d='M{x} {y}l-9 22h18zM{x} {y - 14}l-8 18h16zM{x} {y - 26}l-6 16h12z' fill='#120c2a'/>"
    s += "<rect y='540' width='400' height='20' fill='#120c2a'/>"
    return bg(s, lg('g', [(0, '#1b1450'), (.55, '#6b3fa0'), (1, '#f08a8a')]) + "<radialGradient id='m'><stop offset='.4' stop-color='#fff7da' stop-opacity='.3'/><stop offset='1' stop-color='#fff7da' stop-opacity='0'/></radialGradient>")

def b_petals():
    R = random.Random(13)
    s = "<rect width='400' height='560' fill='url(#g)'/>"
    cols = ['#fff', '#ffe0ec', '#ffc2d9', '#ff9ec4']
    for i in range(18):
        x, dur, dl = R.randint(-10, 410), R.randint(8, 16), R.randint(0, 16)
        sc = round(R.uniform(.7, 1.6), 2)
        sw = R.randint(20, 60)
        s += (f"<g><g transform='scale({sc})'><g><animateTransform attributeName='transform' type='rotate' values='0;360' dur='{R.randint(4,9)}s' repeatCount='indefinite'/>"
              f"<path d='M0 -7C6 -6 7 3 0 8C-7 3 -6 -6 0 -7z' fill='{cols[i % 4]}'/><path d='M0 -7L0 5' stroke='#ff80ab' stroke-width='.6' opacity='.5'/></g></g>"
              f"<animateTransform attributeName='transform' type='translate' values='{x} -30;{x + sw} 300;{x - sw} 600' dur='{dur}s' begin='-{dl}s' repeatCount='indefinite'/></g>")
    s += "<path d='M0 520C60 500 120 540 200 515S340 500 400 525V560H0z' fill='#a8325f' opacity='.5'/>"
    return bg(s, lg('g', [(0, '#8e2a62'), (.6, '#c2457a'), (1, '#f58aa6')]))

def b_memphis():
    pat = ("<pattern id='p' width='120' height='120' patternUnits='userSpaceOnUse'>" + drift(120, 120, 120, 120, 18)
           + "<path d='M10 20q8-12 16 0t16 0t16 0' stroke='#ffd600' stroke-width='4' fill='none' stroke-linecap='round'/>"
           + "<path d='M80 18l14 24H66z' fill='#00e5ff'/><circle cx='92' cy='88' r='9' fill='#ff4081'/><circle cx='28' cy='84' r='6' fill='none' stroke='#fff' stroke-width='3'/>"
           + "<path d='M54 62h16M62 54v16' stroke='#69f0ae' stroke-width='4' stroke-linecap='round'/><rect x='46' y='96' width='16' height='6' rx='3' fill='#fff' transform='rotate(-30 54 99)'/></pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)' opacity='.95'/><rect width='400' height='560' fill='#2a1070' opacity='.18'/>"
    return bg(s, lg('g', [(0, '#5b3df5'), (1, '#8a2be2')], 1, 1) + pat)

# --- фоны сетов
def b_yin():
    R = random.Random(2)
    yy = "<g><circle r='100' fill='#fff'/><path d='M0 -100A100 100 0 0 1 0 100A50 50 0 0 0 0 0A50 50 0 0 1 0 -100z' fill='#000'/><circle cy='-50' r='14' fill='#fff'/><circle cy='50' r='14' fill='#000'/></g>"
    s = "<rect width='400' height='560' fill='#0b0b0b'/>"
    s += f"<g opacity='.3'><g transform='translate(330 470)'><g><animateTransform attributeName='transform' type='rotate' from='0' to='360' dur='60s' repeatCount='indefinite'/>{yy}</g></g></g>"
    s += f"<g opacity='.22'><g transform='translate(40 70) scale(.5)'><g><animateTransform attributeName='transform' type='rotate' from='360' to='0' dur='40s' repeatCount='indefinite'/>{yy}</g></g></g>"
    for i in range(34):
        x, y = R.randint(0, 400), R.randint(0, 560)
        col = '#fff' if i % 2 else '#555'
        s += f"<circle cx='{x}' cy='{y}' r='{R.randint(1,3)}' fill='{col}' opacity='.6'><animate attributeName='opacity' values='.6;.1;.6' dur='{R.randint(3,7)}s' begin='-{R.randint(0,6)}s' repeatCount='indefinite'/></circle>"
    s += "<path d='M-10 200C80 150 120 260 220 210S340 120 410 170' stroke='#fff' stroke-width='1.2' fill='none' opacity='.25'/><path d='M-10 330C90 280 150 380 250 330S350 260 410 300' stroke='#fff' stroke-width='1.2' fill='none' opacity='.18'/>"
    return bg(s)

def b_ball():
    s = "<rect width='400' height='560' fill='#2e7d32'/>"
    for i in range(8):
        s += f"<rect x='{i * 50}' width='50' height='560' fill='{'#388e3c' if i % 2 else '#2e7d32'}'/>"
    ln = "stroke='#fff' stroke-width='2.5' fill='none' opacity='.55'"
    s += f"<rect x='16' y='16' width='368' height='528' {ln}/><path d='M16 280H384' {ln}/><circle cx='200' cy='280' r='52' {ln}/><circle cx='200' cy='280' r='3' fill='#fff' opacity='.6'/>"
    s += f"<rect x='96' y='16' width='208' height='86' {ln}/><rect x='96' y='458' width='208' height='86' {ln}/><rect x='150' y='16' width='100' height='34' {ln}/><rect x='150' y='510' width='100' height='34' {ln}/>"
    ball = "<circle r='13' fill='#fff' stroke='#222' stroke-width='1.4'/><path d='M0 -6l5.7 4.1-2.2 6.7h-7l-2.2-6.7z' fill='#222'/><path d='M0 -6V-13M5.7 -1.9L12 -4M3.5 4.8L7.5 10.5M-3.5 4.8L-7.5 10.5M-5.7 -1.9L-12 -4' stroke='#222' stroke-width='1.2'/>"
    s += ("<g><g><animateTransform attributeName='transform' type='rotate' from='0' to='720' dur='9s' repeatCount='indefinite'/>" + ball + "</g>"
          "<animateTransform attributeName='transform' type='translate' values='40 470;360 380;70 300;350 170;60 90;40 470' dur='9s' repeatCount='indefinite'/></g>")
    s += "<rect width='400' height='560' fill='#000' opacity='.12'/>"
    return bg(s)

def b_planet():
    R = random.Random(8)
    s = "<rect width='400' height='560' fill='url(#g)'/><ellipse cx='90' cy='420' rx='190' ry='110' fill='url(#n1)'/><ellipse cx='330' cy='90' rx='170' ry='100' fill='url(#n2)'/>" + twinkle(R, 56, 20, 560, 1.6, ('#fff', '#ffe9b0', '#cfe3ff'))
    s += ("<g transform='translate(300 150)'><g transform='rotate(-22)'><path d='M-110 0A110 28 0 0 1 110 0' fill='none' stroke='#d7b3ff' stroke-width='9' opacity='.55'/>"
          "<circle r='52' fill='url(#pl)'/><path d='M-40 -22q40 14 80 0M-50 4q50 16 100 0M-44 28q44 10 88 0' stroke='#fff' stroke-opacity='.18' stroke-width='6' fill='none'/>"
          "<path d='M-110 0A110 28 0 0 0 110 0' fill='none' stroke='#d7b3ff' stroke-width='9' opacity='.9'/>"
          "<g><animateTransform attributeName='transform' type='rotate' from='0' to='360' dur='14s' repeatCount='indefinite'/><circle cx='84' cy='0' r='7' fill='#e0e0e0'/><circle cx='86' cy='-2' r='2' fill='#9e9e9e'/></g></g></g>")
    s += "<g transform='translate(70 460)'><circle r='22' fill='#4dd0e1'/><circle cx='-6' cy='-5' r='8' fill='#26a69a' opacity='.7'/><circle cx='8' cy='8' r='5' fill='#fff' opacity='.3'/></g>"
    return bg(s, lg('g', [(0, '#05021a'), (1, '#1b0f4a')]) + "<radialGradient id='n1'><stop offset='0' stop-color='#7c4dff' stop-opacity='.35'/><stop offset='1' stop-color='#7c4dff' stop-opacity='0'/></radialGradient><radialGradient id='n2'><stop offset='0' stop-color='#ff4081' stop-opacity='.3'/><stop offset='1' stop-color='#ff4081' stop-opacity='0'/></radialGradient><radialGradient id='pl' cx='.35' cy='.3'><stop offset='0' stop-color='#ffb74d'/><stop offset='1' stop-color='#c2185b'/></radialGradient>")

def donut_svg(x, y, sc, glaze, dur, delay):
    spr = ''
    cols = ['#fff', '#ffeb3b', '#69f0ae', '#40c4ff', '#ff5252', '#fff']
    for i in range(10):
        a = i * 36 + 10
        rr = 19 + (i % 2) * 5
        spr += f"<rect x='{round(rr*math.cos(math.radians(a)),1)-2.2}' y='{round(rr*math.sin(math.radians(a)),1)-.8}' width='4.4' height='1.6' rx='.8' fill='{cols[i % 6]}' transform='rotate({a * 3 % 180} {round(rr*math.cos(math.radians(a)),1)} {round(rr*math.sin(math.radians(a)),1)})'/>"
    return (f"<g transform='translate({x} {y}) scale({sc})'><g><animateTransform attributeName='transform' type='rotate' values='0;360' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>"
            f"<circle r='30' fill='#e0a458'/><circle r='27' fill='{glaze}'/><circle r='9' fill='url(#hole)'/>{spr}</g></g>")

def b_donut():
    pat = ("<pattern id='p' width='160' height='160' patternUnits='userSpaceOnUse'>" + drift(160, 160, 160, -160, 34)
           + donut_svg(40, 42, .9, '#ff80ab', 14, 0) + donut_svg(120, 80, .75, '#80deea', 18, 3) + donut_svg(56, 128, .6, '#fff59d', 12, 5) + "</pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)' opacity='.85'/>"
    return bg(s, lg('g', [(0, '#a3225f'), (1, '#6a2aa8')], 1, 1) + "<radialGradient id='hole'><stop offset='.6' stop-color='#7a2a70'/><stop offset='1' stop-color='#b4408a'/></radialGradient>" + pat)

def paw(x, y, sc, col, rot):
    return (f"<g transform='translate({x} {y}) rotate({rot}) scale({sc})' fill='{col}'><ellipse cx='0' cy='6' rx='9' ry='7.5'/><ellipse cx='-10' cy='-5' rx='3.6' ry='4.6' transform='rotate(-20 -10 -5)'/>"
            "<ellipse cx='-3.6' cy='-10' rx='3.6' ry='4.8'/><ellipse cx='3.6' cy='-10' rx='3.6' ry='4.8'/><ellipse cx='10' cy='-5' rx='3.6' ry='4.6' transform='rotate(20 10 -5)'/></g>")

def b_cat():
    pat = ("<pattern id='p' width='170' height='170' patternUnits='userSpaceOnUse'>" + drift(170, 170, 170, 170, 36)
           + paw(36, 40, 1.0, '#ffffff33', -20) + paw(120, 70, .8, '#ffffff2e', 25) + paw(72, 132, .9, '#ffffff33', -8) + paw(150, 150, .6, '#ffffff22', 30) + "</pattern>")
    stripes = ''.join(f"<rect x='{-200 + i * 90}' y='-40' width='36' height='700' fill='#7a3300' opacity='.12' transform='rotate(18 200 280)'/>" for i in range(8))
    s = "<rect width='400' height='560' fill='url(#g)'/>" + stripes + "<rect width='400' height='560' fill='url(#p)'/>"
    s += cat(330, 495, 1.8, '#3d2a1f', '#ff8a80', 3.4, 0)
    return bg(s, lg('g', [(0, '#ef6c00'), (1, '#ffa726')]) + pat)

B.update(night=b_night(), ghosts=b_ghosts(), cats=b_cats(), embers=b_embers(), stars=b_stars(), waves=b_waves(), hex=b_hex(),
         mount=b_mount(), petals=b_petals(), memphis=b_memphis(), s_yin=b_yin(), s_ball=b_ball(), s_planet=b_planet(), s_donut=b_donut(), s_cat=b_cat())

# ---------------------------------------------------------------- РАМКИ (кольца 100x100, рабочая зона r 43..50)
def pt(r, a):
    return 50 + r * math.cos(math.radians(a)), 50 + r * math.sin(math.radians(a))

def star5(cx, cy, r):
    p = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * .45
        a = -90 + i * 36
        p.append(f"{cx + rr * math.cos(math.radians(a)):.1f},{cy + rr * math.sin(math.radians(a)):.1f}")
    return ' '.join(p)

def f_beads():
    return ring("<circle cx='50' cy='50' r='46.5' fill='none' stroke='#7a5200' stroke-width='7.4'/><circle cx='50' cy='50' r='46.5' fill='none' stroke='#ffd54f' stroke-width='6.2' stroke-dasharray='0.01 9.74' stroke-linecap='round'/><circle cx='50' cy='50' r='46.5' fill='none' stroke='#fff8d0' stroke-width='2' stroke-dasharray='0.01 9.74' stroke-dashoffset='-0.3' stroke-linecap='round'/>", 60)

def f_laurel():
    s = "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#14532d' stroke-width='6.6'/>"
    for i in range(22):
        a = i * 360 / 22
        x, y = pt(46.4, a)
        col = '#43a047' if i % 2 else '#81c784'
        s += f"<ellipse cx='{x:.1f}' cy='{y:.1f}' rx='5.6' ry='2.3' fill='{col}' transform='rotate({a + 90 + (32 if i % 2 else -32):.1f} {x:.1f} {y:.1f})'/>"
    for i in range(11):
        x, y = pt(46.4, i * 360 / 11 + 8)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='1.7' fill='#e53935'/>"
    return ring(s)

def f_lace():
    s = "<circle cx='50' cy='50' r='47' fill='none' stroke='#fff' stroke-width='1.2'/><circle cx='50' cy='50' r='43.6' fill='none' stroke='#fff' stroke-width='1' stroke-dasharray='1.2 1.6'/>"
    for i in range(26):
        x, y = pt(46.2, i * 360 / 26)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='3.3' fill='#ffffff22' stroke='#fff' stroke-width='1.1'/><circle cx='{x:.1f}' cy='{y:.1f}' r='1' fill='#fff'/>"
    return ring(s, 90)

def f_stars():
    s = "<circle cx='50' cy='50' r='46.8' fill='none' stroke='#4527a0' stroke-width='6.4'/><circle cx='50' cy='50' r='46.8' fill='none' stroke='#9575cd' stroke-width='.8'/>"
    for i in range(12):
        x, y = pt(46.8, i * 30)
        s += f"<polygon points='{star5(x, y, 4.6 if i % 2 else 3.4)}' fill='{'#ffd54f' if i % 2 else '#fff'}'><animate attributeName='opacity' values='1;.35;1' dur='{2 + i % 3}s' begin='-{i % 4}s' repeatCount='indefinite'/></polygon>"
    return ring(s, 50)

def f_chain():
    s = "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#37474f' stroke-width='6.6'/>"
    for i in range(18):
        a = i * 20
        x, y = pt(46.6, a)
        rot = a + (90 if i % 2 else 0)
        s += f"<rect x='{x-5.2:.1f}' y='{y-2.6:.1f}' width='10.4' height='5.2' rx='2.6' fill='none' stroke='{'#eceff1' if i % 2 else '#b0bec5'}' stroke-width='1.7' transform='rotate({rot} {x:.1f} {y:.1f})'/>"
    return ring(s, 80)

def f_sun():
    s = "<circle cx='50' cy='50' r='44.6' fill='none' stroke='#ef6c00' stroke-width='3.6'/>"
    for i in range(24):
        a = i * 15
        r2 = 50 if i % 2 == 0 else 47.2
        x1, y1 = pt(44, a - 5.5)
        x2, y2 = pt(44, a + 5.5)
        x3, y3 = pt(r2, a)
        s += f"<polygon points='{x1:.1f},{y1:.1f} {x2:.1f},{y2:.1f} {x3:.1f},{y3:.1f}' fill='{'#ffd54f' if i % 2 == 0 else '#ffab00'}'/>"
    return ring(s, 40)

def f_flower():
    s = "<circle cx='50' cy='50' r='45.6' fill='none' stroke='#2e7d32' stroke-width='3'/>"
    for i in range(14):
        a = i * 360 / 14
        x, y = pt(46, a)
        s += f"<ellipse cx='{x:.1f}' cy='{y:.1f}' rx='4.8' ry='2.6' fill='{'#ff80ab' if i % 2 else '#f8bbd0'}' transform='rotate({a:.1f} {x:.1f} {y:.1f})'/>"
    for i in range(7):
        x, y = pt(46, i * 360 / 7 + 12.8)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='2' fill='#ffd54f'/>"
    return ring(s, 70)

def f_zigzag():
    def zz(r1, r2, n, ph):
        pts = []
        for i in range(n * 2):
            r = r1 if i % 2 == 0 else r2
            x, y = pt(r, i * 180 / n + ph)
            pts.append(f"{x:.1f},{y:.1f}")
        return ' '.join(pts)
    return ring(f"<polygon points='{zz(43.4, 49.4, 24, 0)}' fill='none' stroke='#ff4081' stroke-width='2.2' stroke-linejoin='round'/><polygon points='{zz(43.4, 49.4, 24, 7.5)}' fill='none' stroke='#18ffff' stroke-width='1.6' stroke-linejoin='round'/>", 36)

def f_tech():
    return ring("<circle cx='50' cy='50' r='47' fill='none' stroke='#00e5ff' stroke-width='2.4' stroke-dasharray='14 4 3 4'/><circle cx='50' cy='50' r='43.6' fill='none' stroke='#ff00e5' stroke-width='1.8' stroke-dasharray='3 5'><animateTransform attributeName='transform' type='rotate' from='360 50 50' to='0 50 50' dur='9s' repeatCount='indefinite'/></circle>", 12)

def f_yin():
    return ring("<path d='M50 3.5A46.5 46.5 0 0 0 50 96.5' fill='none' stroke='#f5f5f5' stroke-width='7'/><path d='M50 3.5A46.5 46.5 0 0 1 50 96.5' fill='none' stroke='#111' stroke-width='7'/><circle cx='50' cy='3.5' r='3.2' fill='#111'/><circle cx='50' cy='96.5' r='3.2' fill='#f5f5f5'/><circle cx='50' cy='50' r='43' fill='none' stroke='#888' stroke-width='.7'/>", 18)

def f_ball():
    s = "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#fff' stroke-width='7.2'/><circle cx='50' cy='50' r='50' fill='none' stroke='#222' stroke-width='.8'/><circle cx='50' cy='50' r='43' fill='none' stroke='#222' stroke-width='.8'/>"
    for i in range(5):
        a = i * 72 - 90
        x, y = pt(46.6, a)
        s += f"<polygon points='{' '.join('%.1f,%.1f' % (x + 5.4 * math.cos(math.radians(a + 90 + k * 72 - 90)), y + 5.4 * math.sin(math.radians(a + 90 + k * 72 - 90))) for k in range(5))}' fill='#222'/>"
        for k in (-1, 1):
            x2, y2 = pt(46.6, a + k * 36)
            s += f"<path d='M{x:.1f} {y:.1f}L{x2:.1f} {y2:.1f}' stroke='#222' stroke-width='1.2'/>"
    return ring(s, 25)

def f_planet():
    s = "<circle cx='50' cy='50' r='47' fill='none' stroke='#7c4dff' stroke-width='1.2' stroke-dasharray='2 2.4'/><circle cx='50' cy='50' r='44' fill='none' stroke='#b388ff' stroke-width='.8'/>"
    for a, r, c in [(20, 46, '#ffb74d'), (140, 46, '#4dd0e1'), (250, 46, '#ff80ab')]:
        x, y = pt(r, a)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='3.6' fill='{c}'/>"
    x, y = pt(46, 140)
    s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='5.6' fill='none' stroke='#4dd0e1' stroke-width='.8' opacity='.7'/>"
    return ring(s, 28)

def f_donut():
    s = "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#c2185b' stroke-width='7.4'/><circle cx='50' cy='50' r='46.6' fill='none' stroke='#ff80ab' stroke-width='6.2'/><circle cx='50' cy='50' r='44.6' fill='none' stroke='#fff' stroke-width='.8' opacity='.5'/>"
    cols = ['#fff', '#ffeb3b', '#69f0ae', '#40c4ff', '#ff5252']
    for i in range(24):
        a = i * 15
        x, y = pt(46.6, a + (i % 3) * 3)
        s += f"<rect x='{x-2.4:.1f}' y='{y-.8:.1f}' width='4.8' height='1.6' rx='.8' fill='{cols[i % 5]}' transform='rotate({a * 7 % 180} {x:.1f} {y:.1f})'/>"
    return ring(s, 120)

def f_cat():
    s = "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#ef6c00' stroke-width='7.4'/><circle cx='50' cy='50' r='46.6' fill='none' stroke='#ffb74d' stroke-width='5'/>"
    for i in range(20):
        x1, y1 = pt(43, i * 18)
        x2, y2 = pt(50, i * 18 + 4)
        s += f"<path d='M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}' stroke='#5d2e00' stroke-width='2' stroke-linecap='round' opacity='.75'/>"
    return ring(s, 150)

F.update(beads=f_beads(), laurel=f_laurel(), lace=f_lace(), stars=f_stars(), chain=f_chain(), sun=f_sun(), flower=f_flower(),
         zigzag=f_zigzag(), tech=f_tech(), s_yin=f_yin(), s_ball=f_ball(), s_planet=f_planet(), s_donut=f_donut(), s_cat=f_cat())

# ---------------------------------------------------------------- 1.1.1 часть 2: дополнительные файлы генератора
# decor_bg1.py (помощники + обычные фоны), decor_bg2.py (фоны сетов), decor_rings.py (кольца рамок сетов).
# Они выполняются в этом же пространстве имён и дописывают B / F (одноимённые ключи заменяют старые версии выше).
for _f in ('decor_bg1.py', 'decor_bg2.py', 'decor_rings.py'):
    _p = os.path.join(os.path.dirname(os.path.abspath(__file__)), _f)
    if os.path.exists(_p):
        exec(compile(open(_p, encoding='utf-8').read(), _p, 'exec'))

# ---------------------------------------------------------------- запись
def build():
    out = ['/*DECOR-START*/:root{']
    for k, v in B.items():
        out.append(f"--b-{k}:url(\"data:image/svg+xml,{enc(v)}\") center/cover no-repeat;")
    for k, v in F.items():
        out.append(f"--f-{k}:url(\"data:image/svg+xml,{enc(v)}\") center/100% 100% no-repeat;")
    out.append('}/*DECOR-END*/')
    return '\n'.join(out)

if __name__ == '__main__':
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    css = build()
    if len(sys.argv) > 1 and sys.argv[1] == 'dump':
        os.makedirs('/home/claude/prev', exist_ok=True)
        for k, v in B.items():
            open(f'/home/claude/prev/b_{k}.svg', 'w').write(v)
        for k, v in F.items():
            open(f'/home/claude/prev/f_{k}.svg', 'w').write(v)
        print('dumped', len(B), len(F), 'size', len(css))
        sys.exit()
    p = os.path.join(root, 'www', 'index.html')
    t = open(p, encoding='utf-8').read()
    if '/*DECOR-START*/' in t:
        t = re.sub(r'/\*DECOR-START\*/.*?/\*DECOR-END\*/', lambda m: css, t, flags=re.S)
    else:
        assert t.count('</style></head>') == 1
        t = t.replace('</style></head>', css + '\n</style></head>')
    open(p, 'w', encoding='utf-8').write(t)
    print('written', len(css), 'bytes of decor css')
