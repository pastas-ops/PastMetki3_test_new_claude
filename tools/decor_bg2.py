# PastMetki 1.1.1 (часть 2): фоны СЕТОВ (улучшенные старые + 10 новых). Подключается из gen_decor.py.
# Ключи s_<id> заменяют старые версии из gen_decor.py.

def stripes_of(cols, n, h, y0=0, w=400):
    return ''.join(f"<rect x='0' y='{y0 + i * h}' width='{w}' height='{h}' fill='{cols[i % len(cols)]}'/>" for i in range(n))

def kface(x, y, sc, fill='#2a1a2a', blush='#ff80ab'):
    return (f"<g transform='translate({x} {y}) scale({sc})'><ellipse cx='-9' cy='0' rx='3.2' ry='4' fill='{fill}'/><ellipse cx='9' cy='0' rx='3.2' ry='4' fill='{fill}'/>"
            "<circle cx='-8' cy='-1.4' r='1.1' fill='#fff'/><circle cx='10' cy='-1.4' r='1.1' fill='#fff'/>"
            f"<ellipse cx='-15' cy='6' rx='4' ry='2.4' fill='{blush}' opacity='.6'/><ellipse cx='15' cy='6' rx='4' ry='2.4' fill='{blush}' opacity='.6'/>"
            f"<path d='M-4 6q4 5 8 0' stroke='{fill}' stroke-width='2' fill='none' stroke-linecap='round'/></g>")

# ---------------------------------------------------------------- Инь-Ян
def bs_yin():
    R = R_(2)
    yy = ("<circle r='100' fill='#f4f4f4'/><path d='M0 -100A100 100 0 0 1 0 100A50 50 0 0 0 0 0A50 50 0 0 1 0 -100z' fill='#0a0a0a'/>"
          "<circle cy='-50' r='15' fill='#f4f4f4'/><circle cy='50' r='15' fill='#0a0a0a'/><circle r='100' fill='none' stroke='#888' stroke-width='2'/>")
    s = "<rect width='400' height='560' fill='#0a0a0a'/><clipPath id='r'><path d='M200 -10C110 130 290 420 200 570H410V-10z'/></clipPath><g clip-path='url(#r)'><rect width='400' height='560' fill='#efefef'/>"
    for i in range(10):
        x, y = R.randint(210, 400), R.randint(0, 560)
        s += f"<g transform='translate({x} {y})' fill='none' stroke='#111' stroke-width='2' opacity='.5'><path d='M0 0a9 9 0 1 1 14 6a6 6 0 1 1-8-8'><animate attributeName='opacity' values='.15;.6;.15' dur='{R.randint(4, 8)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></path></g>"
    for i in range(18):
        s += f"<circle cx='{R.randint(215, 400)}' cy='{R.randint(0, 560)}' r='{R.randint(1, 3)}' fill='#111' opacity='.45'/>"
    s += "</g>"
    for i in range(30):
        s += f"<circle cx='{R.randint(0, 190)}' cy='{R.randint(0, 560)}' r='{R.uniform(.8, 2.6):.1f}' fill='#fff' opacity='.7'><animate attributeName='opacity' values='.7;.1;.7' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></circle>"
    for i, dl in enumerate((0, 2, 4)):
        s += f"<circle cx='200' cy='280' r='100' fill='none' stroke='#999' stroke-width='1.5'><animate attributeName='r' values='100;230' dur='6s' begin='-{dl * 2}s' repeatCount='indefinite'/><animate attributeName='opacity' values='.55;0' dur='6s' begin='-{dl * 2}s' repeatCount='indefinite'/></circle>"
    s += "<g transform='translate(200 280)'>" + spin(yy, 40) + "</g>"
    for i in range(7):
        c = '#fff' if i % 2 else '#111'
        s += fall(spin(petal_sh(c, 1.2), 5), R.randint(0, 400), -20, 580, R.randint(9, 15), R.randint(0, 14), 30)
    return bg(s)

# ---------------------------------------------------------------- Футбол
def bs_ball():
    s = stripes_of(['#2e7d32', '#388e3c'], 14, 40)
    ln = "stroke='#fff' stroke-width='2.5' fill='none' opacity='.6'"
    s += f"<rect x='16' y='16' width='368' height='528' {ln}/><path d='M16 280H384' {ln}/><circle cx='200' cy='280' r='52' {ln}/><circle cx='200' cy='280' r='3' fill='#fff' opacity='.7'/>"
    s += f"<rect x='96' y='16' width='208' height='86' {ln}/><rect x='96' y='458' width='208' height='86' {ln}/><path d='M160 102a40 40 0 0 0 80 0M160 458a40 40 0 0 1 80 0' {ln}/>"
    s += "<g stroke='#fff' stroke-width='1' opacity='.55'><rect x='150' y='-6' width='100' height='28' fill='url(#net)'/><rect x='150' y='538' width='100' height='28' fill='url(#net)'/></g>"
    for x, y in [(0, 0), (400, 0), (0, 560), (400, 560)]:
        s += f"<circle cx='{x}' cy='{y}' r='150' fill='url(#fl)'/>"
    for x, y, a in [(16, 16, 0), (384, 16, 90), (384, 544, 180), (16, 544, 270)]:
        s += f"<g transform='translate({x} {y}) rotate({a})'><path d='M0 0V-14' stroke='#fff' stroke-width='2'/><path d='M0 -14l11 4-11 4z' fill='#ff5252'/></g>"
    ball = "<circle r='13' fill='#fff' stroke='#222' stroke-width='1.4'/><path d='M0 -6l5.7 4.1-2.2 6.7h-7l-2.2-6.7z' fill='#222'/><path d='M0 -6V-13M5.7 -1.9L12 -4M3.5 4.8L7.5 10.5M-3.5 4.8L-7.5 10.5M-5.7 -1.9L-12 -4' stroke='#222' stroke-width='1.2'/>"
    path = 'M40 470C120 400 300 460 360 380S80 330 70 250 330 200 350 140 90 100 60 80'
    s += f"<g><animateMotion dur='11s' repeatCount='indefinite' path='{path}'/><ellipse cx='3' cy='14' rx='12' ry='4' fill='#000' opacity='.3'/>{spin(ball, 1.4)}</g>"
    for k in range(6):
        s += f"<circle r='{5 - k * .6:.1f}' fill='#fff' opacity='{.5 - k * .07:.2f}'><animateMotion dur='11s' begin='-{.18 * (k + 1):.2f}s' repeatCount='indefinite' path='{path}'/></circle>"
    d = ("<pattern id='net' width='8' height='8' patternUnits='userSpaceOnUse'><path d='M0 0L8 8M8 0L0 8' stroke='#fff' stroke-width='.8'/></pattern>" + rg('fl', [(0, '#fff', .35), (1, '#fff', 0)]))
    return bg(s, d)

# ---------------------------------------------------------------- Планета
def bs_planet():
    R = R_(8)
    s = "<rect width='400' height='560' fill='url(#g)'/><ellipse cx='90' cy='430' rx='200' ry='110' fill='url(#n1)'/><ellipse cx='330' cy='90' rx='180' ry='100' fill='url(#n2)'/>" + twinkle(R, 70, 26, 560, 1.7, ('#fff', '#ffe9b0', '#cfe3ff'))
    s += ("<g transform='translate(290 230)'><g transform='rotate(-22)'><path d='M-130 0A130 32 0 0 1 130 0' fill='none' stroke='#d7b3ff' stroke-width='11' opacity='.5'/>"
          "<circle r='62' fill='url(#pl)'/><path d='M-48 -26q48 16 96 0M-58 4q58 18 116 0M-50 34q50 12 100 0' stroke='#fff' stroke-opacity='.18' stroke-width='7' fill='none'/>"
          "<path d='M-130 0A130 32 0 0 0 130 0' fill='none' stroke='#d7b3ff' stroke-width='11' opacity='.95'/>" + spin("<circle cx='100' cy='0' r='8' fill='#e0e0e0'/><circle cx='103' cy='-3' r='2.4' fill='#9e9e9e'/>", 14) + "</g></g>")
    s += "<g transform='translate(70 440)'><circle r='28' fill='#4dd0e1'/><circle cx='-8' cy='-6' r='10' fill='#26a69a' opacity='.7'/><circle cx='10' cy='10' r='6' fill='#fff' opacity='.3'/></g>"
    s += "<g transform='translate(60 120)'>" + spin("<circle cx='34' cy='0' r='5' fill='#ffb74d'/>", 7) + "<circle r='11' fill='#ff8a65'/></g>"
    ast = ("<circle r='12' fill='#fafafa'/><rect x='-9' y='-6' width='18' height='11' rx='5' fill='#1b2a4a'/><ellipse cx='-3' cy='-2' rx='3' ry='1.8' fill='#80d8ff' opacity='.8'/>"
           "<rect x='-8' y='9' width='16' height='14' rx='4' fill='#fafafa'/><rect x='-14' y='10' width='6' height='11' rx='3' fill='#cfd8dc'/><path d='M-7 22l-3 8M7 22l3 8M-8 12l-9 6M8 12l9 6' stroke='#fafafa' stroke-width='4' stroke-linecap='round'/>")
    s += "<g><animateTransform attributeName='transform' type='translate' values='70 330;110 300;60 270;70 330' dur='12s' repeatCount='indefinite'/>" + spin(ast, 30) + "</g>"
    s += "<g><animateMotion dur='7s' repeatCount='indefinite' path='M440 40C300 120 160 220 -40 260'/><circle r='3' fill='#fff'/><path d='M0 0L50 -18' stroke='#fff' stroke-opacity='.5' stroke-width='3'/></g>"
    d = (lg('g', [(0, '#05021a'), (1, '#1b0f4a')]) + rg('n1', [(0, '#7c4dff', .35), (1, '#7c4dff', 0)]) + rg('n2', [(0, '#ff4081', .3), (1, '#ff4081', 0)])
         + "<radialGradient id='pl' cx='.35' cy='.3'><stop offset='0' stop-color='#ffb74d'/><stop offset='1' stop-color='#c2185b'/></radialGradient>")
    return bg(s, d)

# ---------------------------------------------------------------- Пончик
def bs_donut():
    R = R_(18)
    pat = ("<pattern id='p' width='160' height='160' patternUnits='userSpaceOnUse'>" + drift(160, 160, 160, -160, 34)
           + donut_svg(40, 42, .8, '#ff80ab', 14, 0) + donut_svg(122, 84, .65, '#80deea', 18, 3) + donut_svg(56, 132, .55, '#fff59d', 12, 5) + "</pattern>")
    s = "<rect width='400' height='560' fill='url(#g)'/><rect width='400' height='560' fill='url(#p)' opacity='.3'/>"
    s += "<circle cx='200' cy='290' r='150' fill='url(#gl)'/>"
    big = ("<ellipse cx='0' cy='62' rx='96' ry='14' fill='#000' opacity='.18'/><circle r='80' fill='#e0a458'/><path d='M-80 -2a80 80 0 0 1 160 0c0 14-14 18-22 12-8 10-18 14-28 6-8 10-22 12-30 4-8 8-22 8-28-2-10 8-26 6-30-6-4 6-14 8-22 0z' fill='#ff80ab' transform='translate(0 -14)'/>"
           "<circle r='72' fill='#ff80ab'/><circle r='24' fill='#7a2a70'/><circle r='19' fill='#e0a458' opacity='.0'/>")
    spr = ''
    cols = ['#fff', '#ffeb3b', '#69f0ae', '#40c4ff', '#ff5252', '#b388ff']
    for i in range(22):
        a = R.uniform(0, 6.283)
        rr = R.uniform(34, 66)
        spr += f"<rect x='-5' y='-1.6' width='10' height='3.2' rx='1.6' fill='{cols[i % 6]}' transform='translate({rr * math.cos(a):.1f} {rr * math.sin(a):.1f}) rotate({R.randint(0, 180)})'/>"
    face = kface(0, -52, 1.2, '#4a0a2a')
    # лицо над дыркой нельзя: ставим на глазурь выше дырки
    s += "<g transform='translate(200 300)'>" + bob(f"<g>{big}{spr}</g><g transform='translate(0 0)'>{face}</g>", 8, 4) + "</g>"
    for i in range(30):
        c = cols[i % 6]
        s += f"<rect x='-4' y='-1.3' width='8' height='2.6' rx='1.3' fill='{c}' transform='translate({R.randint(0, 400)} {R.randint(-20, 560)}) rotate({R.randint(0, 180)})'><animateTransform attributeName='transform' additive='sum' type='translate' values='0 0;{R.randint(-24, 24)} 160' dur='{R.randint(6, 11)}s' begin='-{R.randint(0, 9)}s' repeatCount='indefinite'/></rect>"
    for i in range(7):
        s += fall("<path d='M0 3C-6 -3 -3 -7 0 -3C3 -7 6 -3 0 3z' fill='#fff' opacity='.85'/>", R.randint(10, 390), 580, -20, R.randint(7, 12), R.randint(0, 10), 14)
    d = lg('g', [(0, '#b0275f'), (1, '#6a2aa8')], 1, 1) + "<radialGradient id='hole'><stop offset='.6' stop-color='#7a2a70'/><stop offset='1' stop-color='#b4408a'/></radialGradient>" + rg('gl', [(0, '#ffd1e8', .55), (1, '#ffd1e8', 0)]) + pat
    return bg(s, d)

# ---------------------------------------------------------------- Котик
def bs_cat():
    R = R_(28)
    s = "<rect width='400' height='560' fill='url(#g)'/>" + twinkle(R, 40, 14, 260, 1.5, ('#fff', '#ffe9b0'))
    s += "<circle cx='300' cy='110' r='54' fill='#fff4cf'/><circle cx='318' cy='100' r='50' fill='#4a2a6a' opacity='.0'/><circle cx='300' cy='110' r='96' fill='url(#mg)'/>"
    x = -10
    while x < 410:
        w, h = R.randint(40, 70), R.randint(60, 140)
        s += f"<rect x='{x}' y='{400 - h}' width='{w}' height='{h + 170}' fill='#26143f'/>"
        for wy in range(400 - h + 10, 396, 18):
            for wx in range(x + 6, x + w - 10, 14):
                if R.random() < .25:
                    s += f"<rect x='{wx}' y='{wy}' width='7' height='9' fill='#ffcf70' opacity='.9'/>"
        x += w + R.randint(0, 4)
    s += "<rect y='408' width='400' height='160' fill='#170b2b'/><rect y='404' width='400' height='8' fill='#3a2160'/>"
    body = ("<path d='M-34 0C-34 -32 -18 -52 0 -52S34 -32 34 0z' fill='#ff9a2e'/><g stroke='#b85a00' stroke-width='3' opacity='.55' stroke-linecap='round'><path d='M-14 -50v14M0 -52v16M14 -50v14'/><path d='M-34 -14h10M34 -14h-10'/></g>"
            "<ellipse cx='-14' cy='-2' rx='10' ry='5' fill='#ffb85c'/><ellipse cx='14' cy='-2' rx='10' ry='5' fill='#ffb85c'/>")
    head = ("<path d='M-26 -40L-24 -66-8 -52zM26 -40L24 -66 8 -52z' fill='#ff9a2e'/><path d='M-22 -46L-21 -60-12 -52zM22 -46L21 -60 12 -52z' fill='#ff9db0'/><ellipse cx='0' cy='-34' rx='28' ry='24' fill='#ff9a2e'/>"
            "<g><ellipse cx='-10' cy='-36' rx='4.6' ry='6' fill='#2a1a10'/><ellipse cx='10' cy='-36' rx='4.6' ry='6' fill='#2a1a10'/><circle cx='-8.6' cy='-38' r='1.6' fill='#fff'/><circle cx='11.4' cy='-38' r='1.6' fill='#fff'/>"
            "<animateTransform attributeName='transform' type='scale' values='1 1;1 1;1 .1;1 1;1 1' keyTimes='0;.9;.94;.97;1' dur='4s' repeatCount='indefinite' additive='replace'/></g>"
            "<path d='M-3 -26h6l-3 3.4z' fill='#ff6f91'/><path d='M0 -22.6q-4 4-8 1.4M0 -22.6q4 4 8 1.4' stroke='#2a1a10' stroke-width='1.6' fill='none' stroke-linecap='round'/>"
            "<path d='M-26 -28l-16-3M-26 -24l-15 4M26 -28l16-3M26 -24l15 4' stroke='#fff' stroke-width='1.4' opacity='.8'/>")
    tail = "<path d='M30 -4C70 0 74 -50 56 -70' fill='none' stroke='#ff9a2e' stroke-width='11' stroke-linecap='round'/>"
    s += "<g transform='translate(190 418)'><ellipse cx='0' cy='4' rx='56' ry='7' fill='#000' opacity='.35'/><g>" + sway(tail, 30, -4, 12, 2.4).replace('<g>', "<g>", 1) + "</g>" + body + head + "</g>"
    yarn = "<circle r='13' fill='#e53935'/><path d='M-10 -4q10 6 20 -2M-11 3q11 6 22 -1M-6 -10q10 8 14 14' stroke='#ff8a80' stroke-width='1.6' fill='none'/>"
    s += "<g><animateMotion dur='9s' repeatCount='indefinite' path='M-30 500C100 505 300 495 430 500'/>" + spin(yarn, 1.6) + "</g>"
    for i in range(7):
        s += f"<g opacity='.0'><animate attributeName='opacity' values='0;.5;0' dur='{R.randint(5, 9)}s' begin='-{R.randint(0, 8)}s' repeatCount='indefinite'/>" + paw(R.randint(20, 380), R.randint(430, 540), .6, '#ffb74d', R.randint(-30, 30)) + "</g>"
    d = lg('g', [(0, '#1b1450'), (.6, '#5a2c7a'), (1, '#c2457a')]) + rg('mg', [(0, '#fff4cf', .35), (1, '#fff4cf', 0)])
    return bg(s, d)

# ---------------------------------------------------------------- Кибер
def bs_cyber():
    R = R_(38)
    s = "<rect width='400' height='560' fill='url(#g)'/>" + twinkle(R, 24, 10, 200, 1.2, ('#9de7ff', '#ff9dff'))
    s += "<circle cx='300' cy='110' r='60' fill='none' stroke='#ff2bd6' stroke-width='2' opacity='.6'/><circle cx='300' cy='110' r='44' fill='#ff2bd6' opacity='.18'/>"
    x = -10
    while x < 410:
        w, h = R.randint(30, 56), R.randint(120, 300)
        top = 560 - h
        s += f"<rect x='{x}' y='{top}' width='{w}' height='{h}' fill='#0b0f2e' stroke='#1f2a6a' stroke-width='1'/>"
        c = R.choice(['#00fff0', '#ff2bd6', '#ffe066'])
        s += f"<rect x='{x}' y='{top}' width='{w}' height='2' fill='{c}'/>"
        for wy in range(top + 10, 548, 11):
            for wx in range(x + 5, x + w - 5, 8):
                if R.random() < .14:
                    s += f"<rect x='{wx}' y='{wy}' width='4' height='5' fill='{R.choice(['#00fff0', '#ff2bd6', '#ffe066', '#7c4dff'])}' opacity='.85'/>"
        if R.random() < .5:
            s += f"<rect x='{x + 4}' y='{top + 20}' width='{w - 8}' height='10' fill='{c}' opacity='.0'><animate attributeName='opacity' values='0;.9;0;.9;0' dur='{R.randint(3, 6)}s' begin='-{R.randint(0, 5)}s' repeatCount='indefinite'/></rect>"
        x += w + R.randint(2, 8)
    for i in range(34):
        x, y = R.randint(0, 400), R.randint(0, 560)
        s += f"<rect x='{x}' y='{y}' width='1.4' height='{R.randint(14, 30)}' fill='#9de7ff' opacity='.0'><animate attributeName='y' values='{y - 40};{y + 200}' dur='{R.uniform(.7, 1.3):.2f}s' begin='-{R.uniform(0, 1):.2f}s' repeatCount='indefinite'/><animate attributeName='opacity' values='0;.55;0' dur='{R.uniform(.7, 1.3):.2f}s' repeatCount='indefinite'/></rect>"
    s += "<g transform='translate(110 250)'>" + spin("<circle r='46' fill='none' stroke='#00fff0' stroke-width='2' stroke-dasharray='12 6 3 6'/>", 12) + spin("<circle r='34' fill='none' stroke='#ff2bd6' stroke-width='1.6' stroke-dasharray='4 5'/>", 8, 0, 0, 0, True) + "<path d='M-14 0h28M0 -14v28' stroke='#00fff0' stroke-width='1.4' opacity='.7'/></g>"
    for k, y in enumerate([180, 330, 420]):
        s += f"<g><animateMotion dur='{8 + k * 3}s' begin='-{k * 3}s' repeatCount='indefinite' path='M-40 {y}C120 {y - 30} 260 {y + 30} 440 {y - 10}'/><path d='M0 0h20l5 4h-25z' fill='#ff2bd6'/><rect x='6' y='-3' width='8' height='3' fill='#00fff0'/><path d='M0 2h-22' stroke='#ff2bd6' stroke-width='2' opacity='.5'/></g>"
    for i in range(5):
        y = R.randint(40, 520)
        s += f"<rect x='0' y='{y}' width='400' height='{R.randint(3, 8)}' fill='#00fff0' opacity='0'><animate attributeName='opacity' values='0;0;.22;0;0' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></rect>"
    s += "<rect width='400' height='560' fill='url(#sc)' opacity='.35'/>"
    d = lg('g', [(0, '#06021f'), (.55, '#2a0a55'), (1, '#8a1a8f')]) + "<pattern id='sc' width='4' height='4' patternUnits='userSpaceOnUse'><rect width='4' height='1.4' fill='#000'/></pattern>"
    return bg(s, d)

# ---------------------------------------------------------------- Вода
def bs_water():
    R = R_(48)
    s = "<rect width='400' height='560' fill='url(#g)'/>"
    s += "<g fill='none' stroke='#fff' stroke-width='1.6' opacity='.35'>" + ''.join(f"<path d='M-20 {y}q40 -14 80 0t80 0t80 0t80 0t80 0'><animateTransform attributeName='transform' type='translate' values='0 0;-80 0' dur='{R.randint(6, 10)}s' repeatCount='indefinite'/></path>" for y in range(30, 560, 46)) + "</g>"
    for (x, y, dl) in [(110, 160, 0), (300, 250, 2), (200, 420, 4), (60, 470, 1), (330, 100, 3)]:
        for k in range(3):
            s += f"<ellipse cx='{x}' cy='{y}' rx='8' ry='3' fill='none' stroke='#fff' stroke-width='1.8'><animate attributeName='rx' values='8;70' dur='5s' begin='-{dl + k * 1.6:.1f}s' repeatCount='indefinite'/><animate attributeName='ry' values='3;26' dur='5s' begin='-{dl + k * 1.6:.1f}s' repeatCount='indefinite'/><animate attributeName='opacity' values='.8;0' dur='5s' begin='-{dl + k * 1.6:.1f}s' repeatCount='indefinite'/></ellipse>"
    for x, y, sc, dl in [(70, 300, 1.5, 0), (330, 360, 1.2, 2), (210, 120, 1.0, 4), (150, 490, 1.3, 1)]:
        s += f"<g transform='translate({x} {y}) scale({sc})'>" + bob("<path d='M0 0L20 -4A20 20 0 1 1 0 -20z' fill='#3ea06a' transform='rotate(40)'/><path d='M0 0L14 -3' stroke='#2c7a50' stroke-width='1' transform='rotate(40)'/>", 3, 5, dl, 2) + "</g>"
    lotus = lambda x, y, sc: (f"<g transform='translate({x} {y}) scale({sc})'>" + ''.join(f"<path d='M0 0C-8 -6 -8 -20 0 -28C8 -20 8 -6 0 0z' fill='{c}' transform='rotate({a})'/>" for a, c in [(-60, '#ff9ec4'), (60, '#ff9ec4'), (-30, '#ffc2d9'), (30, '#ffc2d9'), (0, '#fff0f6')]) + "<circle r='3' fill='#ffd54f'/></g>")
    s += bob(lotus(300, 300, 1.2), 3, 6, 0, 1) + bob(lotus(90, 420, 1.0), 3, 7, 2, 1)
    koi = ("<path d='M0 0C10 -9 30 -9 42 0C30 9 10 9 0 0z' fill='{c}'/><path d='M0 0L-14 -8Q-10 0 -14 8z' fill='{c}' opacity='.8'/><circle cx='34' cy='-3' r='1.4' fill='#222'/><circle cx='20' cy='-2' r='4' fill='#fff' opacity='.7'/>")
    for k, (c, path, dur) in enumerate([('#ff7043', 'M-60 200C100 120 260 320 460 240', 18), ('#fff3e0', 'M460 400C300 480 120 330 -60 420', 22), ('#ffb300', 'M-60 520C120 460 260 540 460 470', 26)]):
        s += f"<g><animateMotion dur='{dur}s' begin='-{k * 6}s' repeatCount='indefinite' rotate='auto' path='{path}'/>{koi.replace('{c}', c)}</g>"
    for i in range(12):
        s += fall("<path d='M0 -6C5 0 5 4 0 6C-5 4 -5 0 0 -6z' fill='#fff' opacity='.9'/>", R.randint(10, 390), -20, 580, R.randint(3, 6), R.randint(0, 6), 4)
    d = lg('g', [(0, '#7fd8f0'), (.5, '#2aa5d8'), (1, '#0a6ab5')])
    return bg(s, d)

# ---------------------------------------------------------------- Земля
def bs_earth():
    R = R_(58)
    s = "<rect width='400' height='560' fill='url(#g)'/><circle cx='320' cy='70' r='34' fill='#fff2a0'/>"
    s += drift_g(cloud(0, 0, 1.1, '#fff', .9), -80, 480, 60, 5, 80) + drift_g(cloud(0, 0, .8, '#fff', .8), -80, 480, 80, 30, 130)
    s += hill(R, 190, 14, '#8bd16b', 1, 6) + hill(R, 215, 10, '#5fb04a', 1, 6)
    for x in range(20, 400, 70):
        s += f"<g transform='translate({x + R.randint(-10, 10)} 215)'><rect x='-3' y='-26' width='6' height='26' fill='#6d4c41'/><circle cy='-36' r='15' fill='#2e7d32'/><circle cx='-8' cy='-30' r='10' fill='#388e3c'/></g>"
    cols = ['#9b6b43', '#835632', '#6d4526', '#563519', '#40250f']
    for i, c in enumerate(cols):
        y = 232 + i * 70
        pts = [(-20, y)] + [(x, y + R.randint(-8, 8)) for x in range(40, 420, 60)]
        s += f"<path d='{smooth(pts)}L430 570L-20 570z' fill='{c}'/>"
    s += "<path d='M-20 232C60 226 120 240 200 232S340 226 420 234' fill='none' stroke='#5fb04a' stroke-width='8'/>"
    for i in range(70):
        x, y = R.randint(0, 400), R.randint(250, 560)
        s += f"<ellipse cx='{x}' cy='{y}' rx='{R.randint(3, 9)}' ry='{R.randint(2, 6)}' fill='{R.choice(['#b08a64', '#6b4a2e', '#8c7a6b', '#4a3220'])}' opacity='.75'/>"
    s += "<path d='M60 250C50 300 80 330 60 380M340 250C350 310 320 340 350 400M200 250C210 290 180 320 200 360' stroke='#c9a06b' stroke-width='3' fill='none' opacity='.7'/>"
    for x, y, c in [(120, 330, '#4dd0e1'), (290, 410, '#ba68c8'), (80, 480, '#ff8a65'), (320, 520, '#69f0ae')]:
        s += f"<g transform='translate({x} {y})'><path d='M0 -10L7 0 0 10-7 0z' fill='{c}'/><path d='M0 -10L0 10M-7 0H7' stroke='#fff' stroke-width='.8' opacity='.7'/><animate attributeName='opacity' values='1;.4;1' dur='{R.randint(2, 4)}s' begin='-{R.randint(0, 3)}s' repeatCount='indefinite'/></g>"
    s += "<g transform='translate(60 470)'><g><animateTransform attributeName='transform' type='translate' values='0 0;280 -20;0 0' dur='18s' repeatCount='indefinite'/><path d='M0 0q6 -8 12 0t12 0t12 0' stroke='#e57373' stroke-width='5' fill='none' stroke-linecap='round'/><circle cx='36' cy='0' r='4' fill='#e57373'/></g></g>"
    s += "<g transform='translate(250 330)'><path d='M0 0q10 -14 20 0M4 -4q6 -5 12 0' fill='none' stroke='#efe6d2' stroke-width='3'/><circle cx='-2' cy='4' r='5' fill='#efe6d2'/></g>"
    for k in range(4):
        x = R.randint(30, 370)
        s += f"<g transform='translate({x} 220)'><path d='M0 0v-14' stroke='#2e7d32' stroke-width='2'/>{blossom(0, -17, 8, R.choice(['#ff80ab', '#ffd54f', '#fff', '#ba68c8']))}</g>"
    d = lg('g', [(0, '#8fd3f4'), (.4, '#d4f1ff'), (1, '#fff')])
    return bg(s, d)

# ---------------------------------------------------------------- Огонь
def flame_t(x, y, w, h, c1, c2, dur, dl):
    p = f"M{x - w} {y}C{x - w} {y - h * .4} {x - w * .2} {y - h * .55} {x} {y - h}C{x + w * .1} {y - h * .55} {x + w} {y - h * .4} {x + w} {y}z"
    return (f"<g><path d='{p}' fill='url(#{c1})'><animateTransform attributeName='transform' type='scale' values='1 1;.88 1.14;1.06 .92;1 1' dur='{dur}s' begin='-{dl}s' repeatCount='indefinite' additive='replace'/></path></g>")

def bs_fire():
    R = R_(68)
    s = "<rect width='400' height='560' fill='url(#g)'/><ellipse cx='200' cy='580' rx='320' ry='220' fill='url(#h)'/>"
    for row, (y, hmax, cid, n, sc) in enumerate([(520, 300, 'f1', 7, 1), (560, 380, 'f2', 6, 1), (600, 260, 'f3', 8, 1)]):
        for i in range(n):
            x = (i + .5) * 400 / n + R.randint(-14, 14)
            w = R.randint(28, 46)
            h = R.randint(int(hmax * .55), hmax)
            dur = R.uniform(1.1, 2.2)
            s += (f"<g transform='translate({x:.0f} {y})'><g><animateTransform attributeName='transform' type='scale' values='1 1;.86 1.12;1.07 .94;1 1' dur='{dur:.1f}s' begin='-{R.uniform(0, 2):.1f}s' repeatCount='indefinite'/>"
                  f"<path d='M{-w} 0C{-w} {-h * .4:.0f} {-w * .3:.0f} {-h * .6:.0f} 0 {-h}C{w * .15:.0f} {-h * .55:.0f} {w} {-h * .4:.0f} {w} 0z' fill='url(#{cid})'/>"
                  f"<path d='M{-w * .5:.0f} 0C{-w * .5:.0f} {-h * .3:.0f} 0 {-h * .45:.0f} 0 {-h * .7:.0f}C{w * .1:.0f} {-h * .4:.0f} {w * .5:.0f} {-h * .3:.0f} {w * .5:.0f} 0z' fill='#fff3b0' opacity='.55'/></g></g>")
    for i in range(40):
        x, y = R.randint(0, 400), R.randint(200, 560)
        r = R.uniform(1, 3)
        s += f"<circle cx='{x}' cy='{y}' r='{r:.1f}' fill='{R.choice(['#ffd54f', '#ff9800', '#fff3b0'])}'><animate attributeName='cy' values='{y};{y - R.randint(160, 320)}' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/><animate attributeName='opacity' values='1;0' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/><animate attributeName='cx' values='{x};{x + R.randint(-40, 40)}' dur='{R.randint(3, 7)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></circle>"
    d = (lg('g', [(0, '#1a0204'), (.6, '#5a0f08'), (1, '#b3260a')]) + rg('h', [(0, '#ff9100', .65), (1, '#ff6d00', 0)])
         + lg('f1', [(0, '#ffd54f'), (.5, '#ff6d00'), (1, '#c62828')], 0, 0).replace("y2='0'", "y2='1'") + lg('f2', [(0, '#fff176'), (.5, '#ff9100'), (1, '#e53935')]).replace("y1='0'", "y1='1'").replace("y2='1'", "y2='0'")
         + lg('f3', [(0, '#ff8f00'), (1, '#b71c1c')]))
    return bg(s, d)

# ---------------------------------------------------------------- Воздух
def bs_air():
    R = R_(78)
    s = "<rect width='400' height='560' fill='url(#g)'/><circle cx='80' cy='90' r='40' fill='#fffbe0' opacity='.85'/><circle cx='80' cy='90' r='80' fill='url(#sg)'/>"
    for i in range(7):
        y = 70 + i * 70 + R.randint(-14, 14)
        s += drift_g(cloud(0, 0, R.uniform(.9, 1.7), '#fff', R.uniform(.6, .95)), -120, 520, R.randint(30, 70), R.randint(0, 60), y)
    for i in range(6):
        y = 120 + i * 72
        d_ = f"M-20 {y}C60 {y - 30} 120 {y + 30} 200 {y}S340 {y - 30} 420 {y}"
        s += f"<path d='{d_}' fill='none' stroke='#fff' stroke-width='2.4' stroke-linecap='round' stroke-dasharray='60 140' opacity='.6'><animate attributeName='stroke-dashoffset' values='0;-400' dur='{R.randint(4, 8)}s' begin='-{R.randint(0, 6)}s' repeatCount='indefinite'/></path>"
    bal = lambda c: (f"<ellipse cx='0' cy='0' rx='16' ry='20' fill='{c}'/><path d='M0 -20C-8 -8 -8 8 0 20C8 8 8 -8 0 -20z' fill='#fff' opacity='.3'/><path d='M-9 18L-5 30H5L9 18' stroke='#6d4c41' stroke-width='1.4' fill='none'/><rect x='-5' y='30' width='10' height='7' rx='1.5' fill='#8d6e63'/>")
    s += "<g transform='translate(290 360)'>" + bob(sway(bal('#ff7043'), 0, 40, 4, 5), 24, 6, 0, 8) + "</g>" + "<g transform='translate(110 250) scale(.7)'>" + bob(sway(bal('#ab47bc'), 0, 40, 4, 6), 20, 7, 2, -8) + "</g>"
    for i in range(5):
        y = R.randint(60, 480)
        s += (f"<g><animateMotion dur='{R.randint(14, 22)}s' begin='-{R.randint(0, 18)}s' repeatCount='indefinite' path='M-20 {y}C120 {y - 50} 260 {y + 40} 430 {y - 20}'/>"
              "<path d='M0 0q5-6 10 0q5-6 10 0' stroke='#37474f' stroke-width='2' fill='none' stroke-linecap='round'><animate attributeName='d' values='M0 0q5-6 10 0q5-6 10 0;M0 0q5 4 10 0q5 4 10 0;M0 0q5-6 10 0q5-6 10 0' dur='.8s' repeatCount='indefinite'/></path></g>")
    for i in range(12):
        x, y = R.randint(10, 390), R.randint(40, 520)
        seed = ("<path d='M0 0V-10' stroke='#fff' stroke-width='.8'/><g stroke='#fff' stroke-width='.8'>" + ''.join(f"<path d='M0 -10L{8 * math.cos(math.radians(a)):.1f} {-10 - 8 * math.sin(math.radians(a)):.1f}'/>" for a in range(20, 170, 30)) + "</g>")
        s += f"<g opacity='.85'><animateMotion dur='{R.randint(9, 16)}s' begin='-{R.randint(0, 14)}s' repeatCount='indefinite' path='M{x} {y}q{R.randint(30, 80)} {R.randint(-60, 0)} {R.randint(100, 220)} {R.randint(-80, 20)}'/>{seed}</g>"
    d = lg('g', [(0, '#3a9be8'), (.6, '#8fd0ff'), (1, '#e6f6ff')]) + rg('sg', [(0, '#fffbe0', .6), (1, '#fffbe0', 0)])
    return bg(s, d)

# ---------------------------------------------------------------- Баскетбол
def bs_basket():
    R = R_(88)
    s = "<rect width='400' height='560' fill='url(#g)'/>"
    for x, c in [(40, '#ffd54f'), (200, '#fff'), (360, '#ff8a65')]:
        s += f"<path d='M{x - 6} -10L{x + 6} -10L{x + 70 if x < 200 else x - 70} 400L{x - 70 if x < 200 else x + 70} 400z' fill='{c}' opacity='.08'><animate attributeName='opacity' values='.04;.14;.04' dur='{R.randint(4, 7)}s' begin='-{R.randint(0, 5)}s' repeatCount='indefinite'/></path>"
    for i in range(70):
        s += f"<circle cx='{R.randint(0, 400)}' cy='{R.randint(60, 240)}' r='{R.uniform(1.5, 4.5):.1f}' fill='{R.choice(['#ffd54f', '#ff8a65', '#fff', '#80d8ff'])}' opacity='.45'><animate attributeName='opacity' values='.15;.7;.15' dur='{R.randint(2, 6)}s' begin='-{R.randint(0, 5)}s' repeatCount='indefinite'/></circle>"
    s += "<rect y='400' width='400' height='170' fill='url(#fl)'/>"
    for x in range(0, 400, 40):
        s += f"<path d='M{x} 400V560' stroke='#7a4a1c' stroke-width='1' opacity='.55'/>"
    s += "<g stroke='#fff' stroke-width='2.5' fill='none' opacity='.75'><path d='M-10 540C100 450 300 450 410 540'/><path d='M90 560V455M310 560V455'/><circle cx='200' cy='455' r='38'/></g>"
    s += "<rect x='140' y='150' width='120' height='84' rx='4' fill='#f5f5f5' stroke='#b0bec5' stroke-width='3'/><rect x='172' y='188' width='56' height='40' fill='none' stroke='#e53935' stroke-width='3'/><rect x='198' y='232' width='4' height='20' fill='#666'/>"
    net = "<path d='M-28 0L-18 40M-14 0L-9 40M0 0V40M14 0L9 40M28 0L18 40M-24 14H24M-21 28H21' stroke='#fff' stroke-width='1.6' fill='none'/>"
    s += "<ellipse cx='200' cy='254' rx='30' ry='6' fill='none' stroke='#ff5722' stroke-width='5'/><g transform='translate(200 254)'>" + sway(net, 0, 0, 3, 1.4) + "</g>"
    ball = "<circle r='15' fill='#ff8f00' stroke='#3a1a00' stroke-width='1.4'/><path d='M-15 0H15M0 -15V15M-11 -10C-4 -4 -4 4 -11 10M11 -10C4 -4 4 4 11 10' stroke='#3a1a00' stroke-width='1.3' fill='none'/>"
    s += f"<g><animateMotion dur='3.6s' repeatCount='indefinite' keyTimes='0;.55;.7;1' keyPoints='0;.55;.7;1' calcMode='linear' path='M70 500C110 300 180 120 200 200L200 300L200 460C220 400 300 400 330 500'/>{spin(ball, 1.2, 0, 0, 0)}</g>"
    d = lg('g', [(0, '#1a0a3a'), (.6, '#4a1a6a'), (1, '#8a2a4a')]) + lg('fl', [(0, '#e0a050'), (1, '#a8692a')])
    return bg(s, d)

# ---------------------------------------------------------------- Волейбол
def bs_volley():
    R = R_(98)
    s = "<rect width='400' height='560' fill='url(#g)'/><circle cx='320' cy='90' r='42' fill='#fff7c2'/><circle cx='320' cy='90' r='86' fill='url(#sg)'/>"
    s += drift_g(cloud(0, 0, 1.0, '#fff', .9), -80, 480, 60, 8, 130) + drift_g(cloud(0, 0, .7, '#fff', .8), -80, 480, 80, 40, 60)
    s += "<rect y='236' width='400' height='54' fill='#2cb5e8'/>" + ''.join(f"<path d='M-20 {y}q25 -8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0' fill='none' stroke='#fff' stroke-width='2' opacity='.6'><animateTransform attributeName='transform' type='translate' values='0 0;-50 0' dur='{3 + i}s' repeatCount='indefinite'/></path>" for i, y in enumerate([248, 264, 280]))
    s += "<path d='M-10 292C100 282 300 300 410 288V560H-10z' fill='#f6d58a'/><path d='M-10 420C120 405 300 430 410 415V560H-10z' fill='#e9c46f'/>"
    for x, sc in [(40, 1.2), (350, 1.0)]:
        s += f"<g transform='translate({x} 290) scale({sc})'><path d='M0 0C-4 -40 4 -70 -2 -100' stroke='#6d4c41' stroke-width='6' fill='none'/>" + ''.join(f"<path d='M-2 -100q{dx} -22 {dx * 2} 4' stroke='#2e9b4a' stroke-width='5' fill='none' stroke-linecap='round'/>" for dx in (-34, -18, 18, 34)) + "</g>"
    s += "<rect x='60' y='290' width='6' height='150' fill='#eee'/><rect x='334' y='290' width='6' height='150' fill='#eee'/><rect x='62' y='300' width='276' height='54' fill='url(#nt)' stroke='#fff' stroke-width='3'/>"
    ball = "<circle r='15' fill='#fff' stroke='#bbb' stroke-width='1'/><path d='M0 -15C-8 -6 -8 6 0 12M-14 -4C-4 -2 6 2 12 10M13 -6C4 -4 -4 -10 -9 -13' stroke='#1e88e5' stroke-width='2.2' fill='none'/><path d='M0 -15C8 -6 8 6 0 15M-14 4C-4 6 6 2 12 -6' stroke='#fdd835' stroke-width='2.2' fill='none'/>"
    s += f"<g><animateMotion dur='4.4s' repeatCount='indefinite' path='M80 470C100 330 160 180 200 190S300 330 320 470C300 330 240 180 200 190S100 330 80 470'/>{spin(ball, 1.5)}</g>"
    s += "<ellipse cx='200' cy='500' rx='160' ry='14' fill='#000' opacity='.0'/>"
    d = lg('g', [(0, '#4aa8ff'), (.55, '#9bdcff'), (1, '#fff1cc')]) + rg('sg', [(0, '#fff7c2', .6), (1, '#fff7c2', 0)]) + "<pattern id='nt' width='10' height='10' patternUnits='userSpaceOnUse'><path d='M0 0H10M0 0V10' stroke='#fff' stroke-width='1.2' opacity='.7'/><rect width='10' height='10' fill='#000' opacity='.12'/></pattern>"
    return bg(s, d)

# ---------------------------------------------------------------- Хоккей
def bs_hockey():
    R = R_(108)
    s = "<rect width='400' height='560' fill='url(#g)'/>"
    s += "<g fill='none' stroke='#9bbfd8' stroke-width='1' opacity='.5'>" + ''.join(f"<path d='M{R.randint(0, 400)} {R.randint(0, 560)}q{R.randint(20, 90)} {R.randint(-30, 30)} {R.randint(60, 160)} {R.randint(-20, 40)}'/>" for _ in range(24)) + "</g>"
    s += "<rect x='14' y='14' width='372' height='532' rx='60' fill='none' stroke='#fff' stroke-width='10'/><rect x='14' y='14' width='372' height='532' rx='60' fill='none' stroke='#6aa7d0' stroke-width='3'/>"
    s += "<path d='M14 280H386' stroke='#d32f2f' stroke-width='6' opacity='.8'/><path d='M14 280H386' stroke='#fff' stroke-width='2' stroke-dasharray='10 8' opacity='.8'/><circle cx='200' cy='280' r='56' fill='none' stroke='#1e66d0' stroke-width='3.5' opacity='.8'/><circle cx='200' cy='280' r='6' fill='#1e66d0' opacity='.8'/>"
    s += "<path d='M14 190H386M14 370H386' stroke='#1e66d0' stroke-width='6' opacity='.7'/>"
    for x, y in [(90, 120), (310, 120), (90, 440), (310, 440)]:
        s += f"<circle cx='{x}' cy='{y}' r='34' fill='none' stroke='#d32f2f' stroke-width='2.5' opacity='.7'/><circle cx='{x}' cy='{y}' r='5' fill='#d32f2f' opacity='.8'/>"
    s += "<path d='M160 40a40 40 0 0 0 80 0z' fill='#8ec5ff' opacity='.55' stroke='#d32f2f' stroke-width='2'/><path d='M160 520a40 40 0 0 1 80 0z' fill='#8ec5ff' opacity='.55' stroke='#d32f2f' stroke-width='2'/>"
    s += "<rect x='168' y='4' width='64' height='14' fill='#fff' stroke='#d32f2f' stroke-width='3'/><rect x='168' y='542' width='64' height='14' fill='#fff' stroke='#d32f2f' stroke-width='3'/>"
    stick = "<path d='M0 0L70 -60' stroke='#8d5a2b' stroke-width='6' stroke-linecap='round'/><path d='M0 0q-14 4 -26 0' stroke='#8d5a2b' stroke-width='7' stroke-linecap='round'/><path d='M0 0L70 -60' stroke='#d7a96b' stroke-width='2' opacity='.6'/>"
    s += "<g transform='translate(110 330)'>" + stick + "</g><g transform='translate(290 330) scale(-1 1)'>" + stick + "</g>"
    puck = "<ellipse cy='3' rx='13' ry='6' fill='#000'/><ellipse rx='13' ry='6' fill='#222'/><ellipse cy='-2' rx='13' ry='6' fill='#444'/><path d='M-9 -1q9 4 18 0' stroke='#888' stroke-width='1' fill='none'/>"
    path = 'M60 500C120 420 300 480 340 380S80 340 70 260 330 200 350 120 100 90 70 60'
    s += f"<g><animateMotion dur='8s' repeatCount='indefinite' path='{path}'/>{puck}</g>"
    for k in range(7):
        s += f"<ellipse rx='{12 - k}' ry='{5 - k * .5:.1f}' fill='#fff' opacity='{.5 - k * .06:.2f}'><animateMotion dur='8s' begin='-{.14 * (k + 1):.2f}s' repeatCount='indefinite' path='{path}'/></ellipse>"
    for i in range(22):
        s += fall("<path d='M0 -5V5M-4.3 -2.5L4.3 2.5M-4.3 2.5L4.3 -2.5' stroke='#fff' stroke-width='1.2' fill='none'/>", R.randint(10, 390), -20, 580, R.randint(7, 13), R.randint(0, 12), 16)
    d = lg('g', [(0, '#e8f6ff'), (1, '#b9dcf2')])
    return bg(s, d)

# ---------------------------------------------------------------- Сакура (ночная)
def bs_sakura():
    R = R_(118)
    s = "<rect width='400' height='560' fill='url(#g)'/>" + twinkle(R, 40, 14, 300, 1.4, ('#fff', '#ffe0ec'))
    s += "<circle cx='270' cy='150' r='62' fill='#fff7e0'/><circle cx='270' cy='150' r='120' fill='url(#mg)'/>"
    s += hill(R, 420, 20, '#3a1e5a', 1, 6) + hill(R, 470, 14, '#241040', 1, 6)
    s += "<g fill='#1a0a30'><rect x='60' y='250' width='10' height='190'/><rect x='130' y='250' width='10' height='190'/><rect x='40' y='238' width='120' height='14' rx='3'/><rect x='52' y='260' width='96' height='8'/></g><g fill='#c62828' opacity='.9'><rect x='36' y='232' width='128' height='8' rx='3'/></g>"
    for d_, w in [("M-10 -10C40 40 90 60 150 140", 12), ("M410 -10C360 50 310 70 250 120", 12), ("M90 82C70 110 40 130 10 150", 6), ("M320 74C340 110 372 130 400 150", 6), ("M200 106C200 150 215 175 230 200", 5)]:
        s += f"<path d='{d_}' stroke='#2a1030' stroke-width='{w}' fill='none' stroke-linecap='round'/>"
    cols = ['#ffe0ec', '#ffc2d9', '#ff9ec4', '#fff']
    for (x, y) in [(40, 40), (90, 70), (140, 125), (20, 150), (370, 50), (320, 80), (260, 118), (390, 150), (230, 195), (100, 90), (330, 100)]:
        for k in range(2):
            s += blossom(x + R.randint(-22, 22), y + R.randint(-18, 22), R.uniform(6, 10), cols[R.randint(0, 3)])
    for i, (x, y, c) in enumerate([(200, 220, '#ff8a3d'), (330, 300, '#ff5252'), (120, 340, '#ffb300'), (260, 380, '#ff7043')]):
        lan = (f"<path d='M0 -42V-24' stroke='#222' stroke-width='1.6'/><ellipse cx='0' cy='-4' rx='15' ry='20' fill='{c}'/><ellipse cx='0' cy='-4' rx='15' ry='20' fill='url(#lg)'/>"
               "<path d='M-14 -12H14M-15 -4H15M-14 4H14' stroke='#7a1a00' stroke-width='1' opacity='.5'/><rect x='-7' y='-26' width='14' height='4' fill='#222'/><rect x='-7' y='14' width='14' height='4' fill='#222'/><path d='M0 18v12' stroke='#ffd54f' stroke-width='2'/>")
        s += f"<g transform='translate({x} {y})'><circle cy='-4' r='34' fill='url(#gl)'/>" + sway(lan, 0, -42, 5, 3 + i * .6, i) + "</g>"
    for i in range(24):
        s += fall(spin(petal_sh(cols[i % 4], R.uniform(.8, 1.4)), R.randint(3, 8)), R.randint(-10, 410), -20, 580, R.randint(8, 14), R.randint(0, 14), R.randint(30, 60))
    d = lg('g', [(0, '#150a38'), (.6, '#3b1a60'), (1, '#8a3a7a')]) + rg('mg', [(0, '#fff7e0', .35), (1, '#fff7e0', 0)]) + rg('gl', [(0, '#ffb060', .55), (1, '#ffb060', 0)]) + rg('lg', [(0, '#fff3b0', .65), (1, '#fff3b0', 0)])
    return bg(s, d)

# ---------------------------------------------------------------- Природа
def bs_nature():
    R = R_(128)
    s = "<rect width='400' height='560' fill='url(#g)'/><circle cx='320' cy='80' r='38' fill='#fff7a8'/><circle cx='320' cy='80' r='90' fill='url(#sg)'/>"
    s += drift_g(cloud(0, 0, 1.1, '#fff', .95), -80, 480, 70, 10, 100) + drift_g(cloud(0, 0, .8, '#fff', .9), -80, 480, 90, 50, 170)
    s += "<path d='M-20 300L80 170 150 250 230 130 320 250 360 200 430 300z' fill='#7a9ec8'/><path d='M230 130L205 168 230 156 250 172z M80 170L62 196 80 186 98 200z' fill='#fff'/>"
    s += "<path d='M-20 320L60 240 140 300 220 220 300 300 380 240 430 320z' fill='#5a8a9a' opacity='.9'/>"
    s += hill(R, 320, 10, '#4caf50', 1, 6)
    s += "<path d='M-10 350C80 330 300 330 410 350V420C300 440 80 440 -10 420z' fill='#4fc3f7'/><path d='M60 380q20 -6 40 0M220 395q20 -6 40 0M300 366q15 -4 30 0' stroke='#fff' stroke-width='2' fill='none' opacity='.7'><animate attributeName='opacity' values='.2;.8;.2' dur='3s' repeatCount='indefinite'/></path>"
    s += hill(R, 430, 12, '#43a047', 1, 6)
    for x, y, sc in [(30, 420, 1.1), (80, 436, .8), (330, 425, 1.2), (375, 440, .9), (290, 445, .7)]:
        s += pine(x, y, sc * 1.2, '#1b6b32', 4)
    s += hill(R, 490, 10, '#66bb6a', 1, 6) + "<rect y='520' width='400' height='40' fill='#58a85c'/>"
    for i in range(34):
        x, y = R.randint(5, 395), R.randint(440, 550)
        s += f"<g transform='translate({x} {y})'><path d='M0 0V10' stroke='#2e7d32' stroke-width='1.6'/>" + sway(blossom(0, -2, R.uniform(5, 8), R.choice(['#ff80ab', '#ffd54f', '#fff', '#ba68c8', '#ff7043'])), 0, 8, 6, R.randint(2, 4), R.randint(0, 3)) + "</g>"
    bfl = lambda c: (f"<g><g><animateTransform attributeName='transform' type='scale' values='1 1;.25 1;1 1' dur='.5s' repeatCount='indefinite'/><path d='M0 0C-12 -12 -16 4 -2 6zM0 0C12 -12 16 4 2 6z' fill='{c}'/></g><path d='M0 -4V6' stroke='#333' stroke-width='1.4'/></g>")
    for k, (c, path, dur) in enumerate([('#ff7043', 'M40 400C120 360 160 460 240 420S360 380 300 330', 14), ('#7e57c2', 'M360 470C300 420 200 500 120 440S60 380 140 350', 18), ('#ffca28', 'M200 300C240 340 300 280 350 350S180 400 90 380', 16)]):
        s += f"<g><animateMotion dur='{dur}s' begin='-{k * 4}s' repeatCount='indefinite' path='{path}'/>{bfl(c)}</g>"
    for i in range(4):
        y = R.randint(50, 200)
        s += (f"<g><animateMotion dur='{R.randint(16, 24)}s' begin='-{R.randint(0, 18)}s' repeatCount='indefinite' path='M-20 {y}C120 {y - 40} 260 {y + 30} 430 {y - 20}'/>"
              "<path d='M0 0q5-6 10 0q5-6 10 0' stroke='#37474f' stroke-width='1.8' fill='none' stroke-linecap='round'/></g>")
    d = lg('g', [(0, '#6ec6ff'), (.6, '#b8e6ff'), (1, '#eaf9ff')]) + rg('sg', [(0, '#fff7a8', .65), (1, '#fff7a8', 0)])
    return bg(s, d)

B.update(s_yin=bs_yin(), s_ball=bs_ball(), s_planet=bs_planet(), s_donut=bs_donut(), s_cat=bs_cat(), s_cyber=bs_cyber(), s_water=bs_water(), s_earth=bs_earth(),
         s_fire=bs_fire(), s_air=bs_air(), s_basket=bs_basket(), s_volley=bs_volley(), s_hockey=bs_hockey(), s_sakura=bs_sakura(), s_nature=bs_nature())
