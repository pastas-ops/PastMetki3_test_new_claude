# PastMetki 1.1.1 (часть 2): общие помощники и тематические версии ОБЫЧНЫХ фонов магазина.
# Файл подключается из gen_decor.py (exec в общем пространстве имён), отдельно не запускается.
# Здесь: aurora, sunset, ocean, sakura, neon, forest, candy, space (раньше это были просто градиенты).

def R_(s):
    return random.Random(s)

def smooth(pts):
    d = f"M{pts[0][0]} {pts[0][1]}"
    for i in range(1, len(pts) - 1):
        mx = (pts[i][0] + pts[i + 1][0]) / 2
        my = (pts[i][1] + pts[i + 1][1]) / 2
        d += f"Q{pts[i][0]} {pts[i][1]} {mx:.1f} {my:.1f}"
    return d + f"L{pts[-1][0]} {pts[-1][1]}"

def hill(R, y, amp, col, op=1, n=7, x0=-30, x1=430, extra=''):
    pts = [(round(x0 + (x1 - x0) * i / (n - 1)), round(y + R.uniform(-amp, amp))) for i in range(n)]
    return f"<path d='{smooth(pts)}L{x1} 560L{x0} 560z' fill='{col}' opacity='{op}' {extra}/>"

def pine(x, y, s, col, layers=4):
    o = f"<rect x='{x - 2 * s:.1f}' y='{y - 8 * s:.1f}' width='{4 * s:.1f}' height='{8 * s:.1f}' fill='{col}'/>"
    for i in range(layers):
        by = y - 6 * s - i * 13 * s
        hw = (15 - i * 3) * s
        o += f"<path d='M{x - hw:.1f} {by:.1f}L{x:.1f} {by - 24 * s:.1f}L{x + hw:.1f} {by:.1f}z' fill='{col}'/>"
    return o

def cloud(x, y, s, col='#fff', op=.9):
    return (f"<g transform='translate({x} {y}) scale({s})' fill='{col}' opacity='{op}'><ellipse cx='0' cy='0' rx='34' ry='11'/>"
            f"<circle cx='-12' cy='-8' r='12'/><circle cx='8' cy='-12' r='15'/><circle cx='22' cy='-4' r='10'/></g>")

def drift_g(inner, a, b, dur, delay=0, y=0):
    return f"<g><animateTransform attributeName='transform' type='translate' values='{a} {y};{b} {y}' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>{inner}</g>"

def bob(inner, dy, dur, delay=0, dx=0):
    return f"<g><animateTransform attributeName='transform' type='translate' values='0 0;{dx} {-dy};0 0' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>{inner}</g>"

def sway(inner, cx, cy, deg, dur, delay=0):
    return f"<g><animateTransform attributeName='transform' type='rotate' values='{-deg} {cx} {cy};{deg} {cx} {cy};{-deg} {cx} {cy}' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>{inner}</g>"

def fall(inner, x, y0, y1, dur, delay, sx=0):
    return (f"<g><animateTransform attributeName='transform' type='translate' values='{x} {y0};{x + sx} {(y0 + y1) / 2};{x - sx / 2} {y1}' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>"
            f"<animate attributeName='opacity' values='0;1;1;0' keyTimes='0;.08;.85;1' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>{inner}</g>")

def rg(id, stops, cx='.5', cy='.5', r='.5'):
    s = ''.join(f"<stop offset='{o}' stop-color='{c}' stop-opacity='{a}'/>" for o, c, a in stops)
    return f"<radialGradient id='{id}' cx='{cx}' cy='{cy}' r='{r}'>{s}</radialGradient>"

def blossom(x, y, r, col, core='#ffd54f'):
    o = ''
    for i in range(5):
        a = math.radians(i * 72 - 90)
        o += f"<circle cx='{x + r * .62 * math.cos(a):.1f}' cy='{y + r * .62 * math.sin(a):.1f}' r='{r * .5:.1f}' fill='{col}'/>"
    return o + f"<circle cx='{x}' cy='{y}' r='{r * .22:.1f}' fill='{core}'/>"

def petal_sh(col, s=1):
    return f"<g transform='scale({s})'><path d='M0 -6C5 -5 6 3 0 7C-6 3 -5 -5 0 -6z' fill='{col}'/></g>"

def spin(inner, dur, delay=0, cx=0, cy=0, rev=False):
    a, b = (360, 0) if rev else (0, 360)
    return f"<g><animateTransform attributeName='transform' type='rotate' from='{a} {cx} {cy}' to='{b} {cx} {cy}' dur='{dur}s' begin='-{delay}s' repeatCount='indefinite'/>{inner}</g>"

def band(R, y, h, col_id, blur='bl', op=.6, dur=9):
    """волнистая лента (для сияния): два варианта пути одинаковой структуры, анимируется d"""
    def mk():
        j = lambda a: round(R.uniform(-a, a))
        return (f"M-20 {y + j(14)}C60 {y + j(40)} 140 {y + j(40)} 220 {y + j(14)}S380 {y + j(40)} 420 {y + j(14)}"
                f"L420 {y + h + j(14)}C340 {y + h + j(30)} 260 {y + h + j(30)} 180 {y + h + j(14)}S40 {y + h + j(30)} -20 {y + h + j(14)}z")
    a, b = mk(), mk()
    return f"<path d='{a}' fill='url(#{col_id})' filter='url(#{blur})' opacity='{op}'><animate attributeName='d' values='{a};{b};{a}' dur='{dur}s' repeatCount='indefinite'/></path>"

# ---------------------------------------------------------------- обычные фоны
def bb_aurora():
    R = R_(31)
    s = "<rect width='400' height='560' fill='url(#sky)'/>" + twinkle(R, 60, 24, 330, 1.5, ('#fff', '#cfe3ff'))
    s += band(R, 120, 120, 'a1', op=.75, dur=9) + band(R, 175, 100, 'a2', op=.55, dur=11) + band(R, 225, 90, 'a3', op=.45, dur=13)
    s += "<g stroke='#bff7e6' stroke-width='1.2' opacity='.35'>" + ''.join(f"<path d='M{x} 110V{R.randint(220, 300)}'><animate attributeName='opacity' values='.1;.6;.1' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></path>" for x in range(20, 400, 26)) + "</g>"
    s += hill(R, 420, 26, '#0d2236') + hill(R, 470, 20, '#08141f')
    s += ''.join(pine(R.randint(10, 390), R.randint(470, 520), R.uniform(.7, 1.2), '#050d14') for _ in range(9))
    s += "<rect y='520' width='400' height='40' fill='#050d14'/><rect y='520' width='400' height='2' fill='#6df0c8' opacity='.25'/>"
    d = (lg('sky', [(0, '#020812'), (.6, '#0a2440'), (1, '#12405a')]) + "<filter id='bl' x='-20%' y='-40%' width='140%' height='180%'><feGaussianBlur stdDeviation='9'/></filter>"
         + lg('a1', [(0, '#6df0c8'), (1, '#6df0c800')]) + lg('a2', [(0, '#7c4dff'), (1, '#7c4dff00')]) + lg('a3', [(0, '#ff80ab'), (1, '#ff80ab00')]))
    return bg(s, d)

def bb_sunset():
    R = R_(41)
    s = "<rect width='400' height='560' fill='url(#sky)'/>"
    s += "<circle cx='200' cy='340' r='140' fill='url(#sg)'/>"
    s += "<g transform='translate(200 340)'>" + spin("".join(f"<path d='M0 0L{190 * math.cos(math.radians(a - 4)):.0f} {190 * math.sin(math.radians(a - 4)):.0f}L{190 * math.cos(math.radians(a + 4)):.0f} {190 * math.sin(math.radians(a + 4)):.0f}z' fill='#fff3b0' opacity='.14'/>" for a in range(0, 360, 20)), 90) + "</g>"
    s += "<circle cx='200' cy='340' r='58' fill='url(#sun)'/>"
    for i, (x, y, sc, dur) in enumerate([(60, 120, 1.2, 70), (300, 180, .9, 55), (150, 250, .7, 80), (350, 90, .8, 90)]):
        s += drift_g(cloud(0, 0, sc, '#ffd6e0', .75), -80, 480, dur, i * 17, y)
    s += "<rect y='350' width='400' height='210' fill='url(#sea)'/>"
    for i in range(26):
        y = 358 + i * 7.5
        w = 120 - i * 3.2 if i < 20 else 50
        x = 200 - w / 2 + R.randint(-6, 6)
        s += f"<rect x='{x:.0f}' y='{y:.0f}' width='{max(w, 20):.0f}' height='2.2' rx='1.1' fill='#fff1b8' opacity='.55'><animate attributeName='opacity' values='.15;.7;.15' dur='{R.randint(2, 5)}s' begin='-{R.randint(0, 4)}s' repeatCount='indefinite'/></rect>"
    s += hill(R, 345, 8, '#4a1b5e', 1, 6, extra="transform='translate(0 0)'").replace('L430 560L-30 560z', 'L430 352L-30 352z')
    s += "<g transform='translate(110 428)'>" + bob("<path d='M0 0L0 -34L22 -4zM-8 0L28 0L20 7L-4 7z' fill='#2a0f3a'/>", 3, 5, 0, 4) + "</g>"
    for i in range(5):
        y = R.randint(60, 200)
        s += (f"<g><animateMotion dur='{R.randint(16, 26)}s' begin='-{R.randint(0, 20)}s' repeatCount='indefinite' path='M-20 {y}C120 {y - 40} 260 {y + 30} 430 {y - 20}'/>"
              "<path d='M0 0q4-5 8 0q4-5 8 0' stroke='#2a0f3a' stroke-width='1.8' fill='none' stroke-linecap='round'><animate attributeName='d' values='M0 0q4-5 8 0q4-5 8 0;M0 0q4 3 8 0q4 3 8 0;M0 0q4-5 8 0q4-5 8 0' dur='.7s' repeatCount='indefinite'/></path></g>")
    d = (lg('sky', [(0, '#2b1055'), (.45, '#c2457a'), (.7, '#ff8a5c'), (.9, '#ffd36b')]) + rg('sg', [(0, '#fff3b0', .55), (1, '#fff3b0', 0)])
         + rg('sun', [(0, '#fffbe0', 1), (.7, '#ffd54f', 1), (1, '#ff8f00', 1)]) + lg('sea', [(0, '#ff9a5c'), (.3, '#a23a7a'), (1, '#2a1255')]))
    return bg(s, d)

def fish(c1, c2, s=1):
    return (f"<g transform='scale({s})'><path d='M0 0q9-8 20 0q-11 8-20 0z' fill='{c1}'/><path d='M1 0l-9-6v12z' fill='{c2}'/>"
            "<circle cx='14' cy='-1.2' r='1.3' fill='#fff'/><circle cx='14.4' cy='-1.2' r='.6' fill='#123'/></g>")

def bb_ocean():
    R = R_(51)
    s = "<rect width='400' height='560' fill='url(#w)'/>"
    for i, x in enumerate([40, 130, 230, 330]):
        s += f"<path d='M{x} -10L{x + 50} -10L{x + 150} 400L{x - 30} 400z' fill='url(#ray)' opacity='.5'><animate attributeName='opacity' values='.15;.6;.15' dur='{6 + i * 2}s' begin='-{i * 2}s' repeatCount='indefinite'/></path>"
    cols = [('#ffb74d', '#ef6c00'), ('#4dd0e1', '#00838f'), ('#ff80ab', '#c2185b'), ('#fff176', '#f9a825')]
    for g in range(7):
        y = 150 + g * 48 + R.randint(-10, 10)
        c1, c2 = cols[g % 4]
        dur = R.randint(16, 28)
        ltr = g % 2 == 0
        for k in range(3):
            yy = y + k * 11 - 8
            off = k * 22
            if ltr:
                s += f"<g><animateMotion dur='{dur}s' begin='-{R.randint(0, dur)}s' repeatCount='indefinite' path='M-{40 + off} {yy}C100 {yy - 12} 260 {yy + 12} {440}  {yy - 4}'/>{fish(c1, c2, .9 - k * .12)}</g>"
            else:
                s += f"<g><animateMotion dur='{dur}s' begin='-{R.randint(0, dur)}s' repeatCount='indefinite' path='M{440 + off} {yy}C260 {yy + 12} 100 {yy - 12} -40 {yy - 4}'/><g transform='scale(-1 1)'>{fish(c1, c2, .9 - k * .12)}</g></g>"
    for x, y, sc, col in [(70, 240, 1.1, '#f48fb1'), (310, 330, 1.4, '#b39ddb'), (190, 170, .8, '#80deea')]:
        jf = (f"<path d='M-16 0a16 14 0 0 1 32 0z' fill='{col}' opacity='.85'/><path d='M-12 0q-3 12 0 22M-4 0q3 14 0 26M4 0q-3 14 0 26M12 0q3 12 0 22' stroke='{col}' stroke-width='2' fill='none' opacity='.7'/>")
        s += f"<g transform='translate({x} {y}) scale({sc})'>" + bob(jf, 22, R.randint(5, 8), R.randint(0, 5), 6) + "</g>"
    for i in range(16):
        x, y = R.randint(10, 390), R.randint(260, 560)
        r = R.uniform(1.5, 4.5)
        s += f"<circle cx='{x}' cy='{y}' r='{r:.1f}' fill='none' stroke='#cdefff' stroke-width='1' opacity='.7'><animate attributeName='cy' values='{y};{y - 280}' dur='{R.randint(6, 12)}s' begin='-{R.randint(0, 10)}s' repeatCount='indefinite'/><animate attributeName='opacity' values='.7;0' dur='{R.randint(6, 12)}s' begin='-{R.randint(0, 10)}s' repeatCount='indefinite'/></circle>"
    s += "<path d='M-10 520C60 500 120 530 200 515S340 505 410 525V560H-10z' fill='#d9b27a'/><path d='M-10 540C80 528 160 548 250 536S360 530 410 542V560H-10z' fill='#c19a63'/>"
    for x, h, col in [(30, 70, '#2e9b5a'), (60, 52, '#38b36a'), (330, 66, '#2e9b5a'), (360, 48, '#38b36a'), (200, 40, '#2e9b5a')]:
        s += f"<g transform='translate({x} 530)'>" + sway(f"<path d='M0 0C-8 -{h * .3:.0f} 8 -{h * .6:.0f} 0 -{h}' stroke='{col}' stroke-width='5' fill='none' stroke-linecap='round'/>", 0, 0, 5, R.randint(3, 5), R.randint(0, 3)) + "</g>"
    s += "<g transform='translate(120 528)'><path d='M0 0q-6-18 0-26q6 8 0 26M-4 0q-14-10-12-22q10 4 12 22M4 0q14-10 12-22q-10 4-12 22' fill='#ff6f91'/></g>"
    s += "<g transform='translate(270 538) rotate(-12)'><path d='M0 -9L2.6 -3 9 -2.8 4 1.5 5.6 8 0 4.5-5.6 8-4 1.5-9-2.8-2.6-3z' fill='#ffab40'/></g>"
    d = lg('w', [(0, '#1b7fc2'), (.45, '#0a4a82'), (1, '#031c3d')]) + lg('ray', [(0, '#ffffff'), (1, '#ffffff00')])
    return bg(s, d)

def bb_sakura():
    R = R_(61)
    s = "<rect width='400' height='560' fill='url(#sky)'/><circle cx='95' cy='130' r='46' fill='#fffaf0' opacity='.8'/><circle cx='95' cy='130' r='78' fill='url(#sg)'/>"
    s += hill(R, 400, 22, '#f2a8c4', .55, 6) + hill(R, 445, 18, '#e98db3', .8, 6)
    # ствол и ветки
    br = [("M338 580C336 500 318 440 304 380C296 340 280 318 252 300", 15), ("M252 300C220 280 180 262 132 252C110 247 92 236 70 214", 8), ("M262 310C300 292 340 270 392 262", 7), ("M304 388C340 370 372 352 400 336", 7), ("M170 262C160 232 150 208 148 176", 5), ("M300 340C284 300 290 262 278 232", 5), ("M132 252C118 280 96 296 62 304", 5)]
    for d_, w in br:
        s += f"<path d='{d_}' stroke='#4a2c2a' stroke-width='{w}' fill='none' stroke-linecap='round'/><path d='{d_}' stroke='#6d4340' stroke-width='{w * .35:.1f}' fill='none' stroke-linecap='round' transform='translate(-1.5 0)' opacity='.8'/>"
    cols = ['#ffffff', '#ffe0ec', '#ffc2d9', '#ff9ec4', '#ff80ab']
    pts = [(252, 300), (200, 270), (150, 250), (100, 232), (70, 214), (150, 200), (148, 176), (290, 262), (278, 232), (330, 276), (380, 262), (360, 345), (396, 336), (120, 276), (70, 304), (230, 226), (190, 190), (310, 214), (350, 230), (105, 190), (60, 250)]
    for (x, y) in pts:
        for k in range(2):
            bx, by = x + R.randint(-26, 26), y + R.randint(-24, 24)
            s += blossom(bx, by, R.uniform(6, 11), cols[R.randint(0, 4)])
    for k in range(10):
        x, y = R.randint(40, 380), R.randint(160, 340)
        s += f"<g transform='translate({x} {y})'><g fill='#fff' opacity='.0'><animate attributeName='opacity' values='0;.9;0' dur='{R.randint(3, 6)}s' begin='-{R.randint(0, 5)}s' repeatCount='indefinite'/><path d='M0 -5L1.2 -1.2 5 0 1.2 1.2 0 5-1.2 1.2-5 0-1.2-1.2z'/></g></g>"
    for i in range(22):
        x, dur, dl = R.randint(-10, 410), R.randint(8, 15), R.randint(0, 15)
        s += fall(spin(petal_sh(cols[i % 5], R.uniform(.8, 1.5)), R.randint(3, 8)), x, -20, 580, dur, dl, R.randint(30, 70))
    for i in range(14):
        s += f"<g transform='translate({R.randint(0, 400)} {R.randint(500, 556)}) rotate({R.randint(0, 360)})'>{petal_sh(cols[i % 5], .9)}</g>"
    d = lg('sky', [(0, '#ffe9f1'), (.55, '#ffd0e0'), (1, '#f7a8c4')]) + rg('sg', [(0, '#fffaf0', .6), (1, '#fffaf0', 0)])
    return bg(s, d)

def bb_neon():
    R = R_(71)
    s = "<rect width='400' height='560' fill='url(#sky)'/>" + twinkle(R, 40, 12, 230, 1.3, ('#fff', '#ff9dff', '#9de7ff'))
    s += "<circle cx='200' cy='270' r='96' fill='url(#sun)'/>"
    for i in range(7):
        y = 290 + i * 11
        s += f"<rect x='90' y='{y}' width='220' height='{2 + i * .9:.1f}' fill='#2a0a4f'/>"
    x = -10
    while x < 410:
        w, h = R.randint(26, 44), R.randint(40, 120)
        top = 340 - h
        col = '#1a0b3d' if R.random() < .5 else '#241052'
        s += f"<rect x='{x}' y='{top}' width='{w}' height='{560 - top}' fill='{col}'/><rect x='{x}' y='{top}' width='{w}' height='2' fill='{'#00e5ff' if R.random() < .5 else '#ff2bd6'}'/>"
        for wy in range(top + 8, 332, 12):
            for wx in range(x + 4, x + w - 5, 8):
                if R.random() < .28:
                    s += f"<rect x='{wx}' y='{wy}' width='4' height='6' fill='{R.choice(['#ff2bd6', '#00e5ff', '#ffe066'])}' opacity='.9'/>"
        x += w + R.randint(0, 3)
    s += "<rect y='340' width='400' height='220' fill='url(#fl)'/>"
    vx = ''.join(f"<path d='M200 340L{200 + (i - 8) * 90} 560' stroke='#ff2bd6' stroke-width='1.3' opacity='.7'/>" for i in range(17))
    s += vx
    s += "<g stroke='#00e5ff' stroke-width='1.4' opacity='.75'>" + ''.join(f"<path d='M0 {y}H400'><animate attributeName='opacity' values='.8;.2;.8' dur='3s' begin='-{i * .3:.1f}s' repeatCount='indefinite'/></path>" for i, y in enumerate([356, 376, 402, 436, 480, 536])) + "</g>"
    s += "<g><animateMotion dur='9s' repeatCount='indefinite' path='M-30 120C100 90 260 150 430 100'/><path d='M0 0h18l4 3h-22z' fill='#ff2bd6'/><circle cx='4' cy='3' r='2' fill='#00e5ff'/></g>"
    d = (lg('sky', [(0, '#0d0030'), (.5, '#3a0f78'), (.8, '#b3249b'), (1, '#ff6a9a')]) + lg('sun', [(0, '#ffe66d'), (.55, '#ff5ea8'), (1, '#8a2be2')])
         + lg('fl', [(0, '#1d0a3e'), (1, '#0a0420')]))
    return bg(s, d)

def bb_forest():
    R = R_(81)
    s = "<rect width='400' height='560' fill='url(#sky)'/><circle cx='300' cy='120' r='70' fill='url(#sg)'/>"
    s += "<g opacity='.18' fill='#fff'>" + ''.join(f"<path d='M{x} -10L{x + 38} -10L{x + 110} 560L{x - 20} 560z'/>" for x in (60, 170, 250)) + "</g>"
    layers = [('#2f8550', 300, 1.5, 'a'), ('#1f6a3f', 360, 2.0, 'b'), ('#155a33', 440, 2.7, 'c'), ('#0c3f24', 540, 3.5, 'd')]
    for col, base, sc, tag in layers:
        s += hill(R, base - 30, 12, col, 1, 6)
        n = int(430 / (30 * sc))
        for i in range(n + 1):
            s += pine(i * 30 * sc + R.randint(-8, 8), base + R.randint(-8, 8), sc, col, 4)
        if tag != 'd':
            s += drift_g(f"<ellipse cx='0' cy='0' rx='160' ry='14' fill='#fff' opacity='.2'/>", -150, 560, 36 + len(tag) * 5, R.randint(0, 30), base - 22)
    for i in range(18):
        x, y = R.randint(10, 390), R.randint(200, 520)
        s += f"<circle r='2' fill='#e8ff7a'><animateMotion dur='{R.randint(8, 16)}s' begin='-{R.randint(0, 12)}s' repeatCount='indefinite' path='M{x} {y}q{R.randint(-30, 30)} {R.randint(-40, 10)} {R.randint(-20, 40)} {R.randint(-50, 10)}'/><animate attributeName='opacity' values='0;1;.2;1;0' dur='{R.randint(3, 6)}s' begin='-{R.randint(0, 5)}s' repeatCount='indefinite'/></circle>"
    d = lg('sky', [(0, '#c8e8a0'), (.5, '#8fcf8a'), (1, '#3f9a62')]) + rg('sg', [(0, '#fffbd0', .9), (1, '#fffbd0', 0)])
    return bg(s, d)

def lolli(x, y, sc, c1, c2, rot=0):
    sw = ''.join(f"<path d='M0 0A{r} {r} 0 0 1 {r * 2 if i % 2 == 0 else -r * 2} 0' fill='none' stroke='{c2 if i % 2 else c1}' stroke-width='3'/>" for i, r in enumerate(range(3, 16, 3)))
    return (f"<g transform='translate({x} {y}) rotate({rot}) scale({sc})'><rect x='-1.8' y='6' width='3.6' height='40' rx='1.8' fill='#fff'/><circle r='17' fill='{c1}'/>"
            f"<circle r='17' fill='none' stroke='#fff' stroke-width='2' opacity='.5'/><path d='M0 0m-11 0a11 11 0 1 1 22 0a7 7 0 1 1-14 0a3.5 3.5 0 1 1 7 0' fill='none' stroke='{c2}' stroke-width='3.2' stroke-linecap='round'/></g>")

def cane(x, y, sc, rot=0):
    return (f"<g transform='translate({x} {y}) rotate({rot}) scale({sc})'><path d='M0 40V-4a10 10 0 0 1 20 0' fill='none' stroke='#fff' stroke-width='7' stroke-linecap='round'/>"
            "<path d='M0 40V-4a10 10 0 0 1 20 0' fill='none' stroke='#ff3d6e' stroke-width='7' stroke-linecap='round' stroke-dasharray='5 6'/></g>")

def wrapped(x, y, sc, c1, rot=0):
    return (f"<g transform='translate({x} {y}) rotate({rot}) scale({sc})'><path d='M-13 0L-22 -8V8zM13 0L22 -8V8z' fill='{c1}'/><ellipse rx='14' ry='9' fill='{c1}'/>"
            "<path d='M-8 -6l4 12M0 -8l4 16M8 -6l4 12' stroke='#fff' stroke-width='2' opacity='.6'/></g>")

def gumdrop(x, y, sc, col):
    return f"<g transform='translate({x} {y}) scale({sc})'><path d='M-12 10a12 15 0 0 1 24 0z' fill='{col}'/><g fill='#fff' opacity='.55'><circle cx='-6' cy='5' r='1.3'/><circle cx='1' cy='1' r='1.3'/><circle cx='6' cy='6' r='1.3'/><circle cx='-1' cy='7' r='1.3'/></g></g>"

def bb_candy():
    pat = ("<pattern id='p' width='200' height='200' patternUnits='userSpaceOnUse'>" + drift(200, 200, 200, 200, 46)
           + lolli(40, 44, 1, '#ff4d8d', '#ffd1e3', -12) + cane(140, 28, 1, 8) + wrapped(120, 118, 1, '#7c4dff', 20) + gumdrop(46, 150, 1.15, '#69f0ae')
           + gumdrop(168, 170, .9, '#ffd54f') + lolli(150, 170, .55, '#40c4ff', '#e1f5fe', 18)
           + "<circle cx='96' cy='70' r='3' fill='#fff'/><circle cx='12' cy='110' r='2.4' fill='#fff'/><circle cx='180' cy='110' r='2.6' fill='#fff'/></pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)'/>"
    R = R_(91)
    for i in range(26):
        x, y, dur = R.randint(0, 400), R.randint(-20, 560), R.randint(6, 12)
        c = ['#ff4081', '#ffd740', '#40c4ff', '#69f0ae', '#fff'][i % 5]
        s += f"<rect x='-3' y='-1' width='6' height='2' rx='1' fill='{c}' transform='translate({x} {y}) rotate({R.randint(0, 180)})'><animateTransform attributeName='transform' additive='sum' type='translate' values='0 0;{R.randint(-20, 20)} 120' dur='{dur}s' begin='-{R.randint(0, 8)}s' repeatCount='indefinite'/></rect>"
    return bg(s, lg('g', [(0, '#ffc2dc'), (.5, '#ffe5a8'), (1, '#a4e8ff')], 1, 1) + pat)

def bb_space():
    R = R_(101)
    s = "<rect width='400' height='560' fill='url(#g)'/><ellipse cx='100' cy='170' rx='200' ry='90' fill='url(#n1)'/><ellipse cx='320' cy='400' rx='200' ry='100' fill='url(#n2)'/>" + twinkle(R, 70, 26, 560, 1.7, ('#fff', '#ffe9b0', '#cfe3ff'))
    s += ("<g transform='translate(300 190)'><g transform='rotate(-24)'><path d='M-90 0A90 22 0 0 1 90 0' fill='none' stroke='#e0c8ff' stroke-width='8' opacity='.5'/><circle r='44' fill='url(#pl)'/>"
          "<path d='M-34 -16q34 12 68 0M-42 4q42 12 84 0M-36 24q36 8 72 0' stroke='#fff' stroke-opacity='.2' stroke-width='5' fill='none'/><path d='M-90 0A90 22 0 0 0 90 0' fill='none' stroke='#e0c8ff' stroke-width='8' opacity='.9'/></g></g>")
    s += "<g transform='translate(70 400)'><circle r='26' fill='url(#pl2)'/><circle cx='-8' cy='-6' r='7' fill='#000' opacity='.12'/><circle cx='9' cy='8' r='5' fill='#000' opacity='.1'/></g>"
    s += "<g transform='translate(240 300)'>" + spin("<circle cx='86' cy='0' r='6' fill='#cfd8dc'/><circle cx='88' cy='-2' r='1.6' fill='#90a4ae'/>", 16) + "</g>"
    s += ("<g><animateMotion dur='16s' repeatCount='indefinite' rotate='auto' path='M-40 520C120 420 260 520 440 300'/>"
          "<path d='M0 -6L16 0 0 6z' fill='#fff'/><rect x='-8' y='-4.5' width='9' height='9' rx='2' fill='#e53935'/><circle cx='9' cy='0' r='2.4' fill='#4fc3f7'/>"
          "<path d='M-8 0L-24 -4V4z' fill='#ffb300'><animate attributeName='opacity' values='1;.3;1' dur='.4s' repeatCount='indefinite'/></path></g>")
    for i in range(3):
        x, y = R.randint(80, 440), R.randint(-60, 200)
        s += (f"<g><g transform='rotate(-30)'><rect x='0' y='-1' width='{R.randint(50, 80)}' height='2' rx='1' fill='url(#t)'/><circle r='2.2' fill='#fff'/></g>"
              f"<animateTransform attributeName='transform' type='translate' values='{x} {y};{x - 240} {y + 160}' dur='{R.randint(4, 8)}s' begin='-{R.randint(0, 8)}s' repeatCount='indefinite'/>"
              f"<animate attributeName='opacity' values='0;1;1;0' dur='{R.randint(4, 8)}s' begin='-{R.randint(0, 8)}s' repeatCount='indefinite'/></g>")
    d = (rg('g', [(0, '#2a1a6a', 1), (.6, '#0b0b30', 1), (1, '#04041a', 1)], '.3', '.2', '1.1') + rg('n1', [(0, '#7c4dff', .4), (1, '#7c4dff', 0)]) + rg('n2', [(0, '#ff4081', .3), (1, '#ff4081', 0)])
         + "<radialGradient id='pl' cx='.35' cy='.3'><stop offset='0' stop-color='#ffcc80'/><stop offset='1' stop-color='#a23a7a'/></radialGradient><radialGradient id='pl2' cx='.35' cy='.3'><stop offset='0' stop-color='#80deea'/><stop offset='1' stop-color='#00695c'/></radialGradient>"
         + "<linearGradient id='t' x1='1' y1='0' x2='0' y2='0'><stop offset='0' stop-color='#fff'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient>")
    return bg(s, d)

B.update(aurora=bb_aurora(), sunset=bb_sunset(), ocean=bb_ocean(), sakura=bb_sakura(), neon=bb_neon(), forest=bb_forest(), candy=bb_candy(), space=bb_space())
