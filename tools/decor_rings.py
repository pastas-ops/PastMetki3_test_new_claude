# PastMetki 1.1.1 (часть 2): кольца-рамки сетов (новые + улучшенные donut/cat/planet/yin/ball). Подключается из gen_decor.py.

def band_(c1, c2, w=7.4, r=46.6):
    return f"<circle cx='50' cy='50' r='{r}' fill='none' stroke='{c1}' stroke-width='{w}'/><circle cx='50' cy='50' r='{r}' fill='none' stroke='{c2}' stroke-width='{w - 1.4:.1f}'/>"

def at(r, a, inner):
    x, y = pt(r, a)
    return f"<g transform='translate({x:.1f} {y:.1f}) rotate({a + 90})'>{inner}</g>"

def fr_cyber():
    s = band_('#0b0f2e', '#1b1f5a', 7.8)
    s += "<circle cx='50' cy='50' r='49.2' fill='none' stroke='#00fff0' stroke-width='1.1'/><circle cx='50' cy='50' r='43.4' fill='none' stroke='#ff2bd6' stroke-width='.9'/>"
    for i in range(12):
        a = i * 30
        x1, y1 = pt(44.2, a)
        x2, y2 = pt(49, a)
        s += f"<path d='M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}' stroke='{'#00fff0' if i % 2 else '#ff2bd6'}' stroke-width='1.6'/>"
    s += "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#00fff0' stroke-width='2' stroke-dasharray='18 10 3 10'><animate attributeName='stroke-dashoffset' values='0;-82' dur='3s' repeatCount='indefinite'/></circle>"
    s += "<rect x='47' y='1.2' width='6' height='3' fill='#ffe066'><animate attributeName='opacity' values='1;.1;1;1' dur='1.6s' repeatCount='indefinite'/></rect>"
    return ring(s, 30)

def fr_water():
    s = band_('#01579b', '#29b6f6', 7.4)
    s += "<circle cx='50' cy='50' r='45' fill='none' stroke='#e1f5fe' stroke-width='1' stroke-dasharray='6 4' opacity='.8'/>"
    for i in range(10):
        a = i * 36 + 8
        s += at(46.6, a, f"<path d='M0 -4C3 -1 3 2 0 3C-3 2 -3 -1 0 -4z' fill='#e1f5fe' opacity='.9'/>")
    s += "<g fill='none' stroke='#fff' opacity='.7'>" + ''.join(f"<circle cx='{pt(49.6, a)[0]:.1f}' cy='{pt(49.6, a)[1]:.1f}' r='1.6' stroke-width='.7'><animate attributeName='r' values='1;2.4;1' dur='{2 + i % 3}s' repeatCount='indefinite'/></circle>" for i, a in enumerate(range(0, 360, 40))) + "</g>"
    return ring(s, 40)

def fr_earth():
    R = R_(3)
    s = band_('#3e2a1a', '#8d6e63', 7.6)
    for i in range(22):
        a = i * 16.4 + R.randint(-3, 3)
        x, y = pt(46.6 + R.uniform(-2, 2), a)
        s += f"<ellipse cx='{x:.1f}' cy='{y:.1f}' rx='{R.uniform(1.4, 2.6):.1f}' ry='{R.uniform(1, 1.8):.1f}' fill='{R.choice(['#bcaaa4', '#6d4c41', '#d7ccc8', '#5d4037'])}' transform='rotate({R.randint(0, 180)} {x:.1f} {y:.1f})'/>"
    for i in range(9):
        a = i * 40 + 12
        s += at(50, a, "<path d='M-2 0Q-2 -4 -3 -5M0 0Q0 -5 0 -6.5M2 0Q2 -4 3 -5' stroke='#4caf50' stroke-width='1.3' fill='none' stroke-linecap='round'/>")
    for a in (60, 190, 300):
        s += at(46.6, a, "<circle cy='-1' r='1.5' fill='#ffd54f'/><circle cx='-1.6' cy='-1' r='1.1' fill='#fff'/><circle cx='1.6' cy='-1' r='1.1' fill='#fff'/>")
    return ring(s, 90)

def fr_fire():
    s = band_('#7f0000', '#ff6d00', 6.8, 45.6)
    for i in range(18):
        a = i * 20
        h = 7 + (i * 7 % 5)
        s += at(48, a, f"<path d='M-3.2 0C-3.2 -{h * .5:.1f} -1 -{h * .6:.1f} 0 -{h}C1 -{h * .6:.1f} 3.2 -{h * .5:.1f} 3.2 0z' fill='{'#ffd54f' if i % 2 else '#ff9100'}'><animateTransform attributeName='transform' type='scale' values='1 1;.8 1.25;1.1 .85;1 1' dur='{1 + (i % 4) * .3:.1f}s' begin='-{i * .1:.1f}s' repeatCount='indefinite'/></path>")
    s += "<circle cx='50' cy='50' r='43.4' fill='none' stroke='#ffe082' stroke-width='.8' opacity='.7'/>"
    return ring(s, -60)

def fr_air():
    s = band_('#90caf9', '#e3f2fd', 7.2)
    for i in range(6):
        a = i * 60
        x, y = pt(46.6, a)
        s += f"<g transform='translate({x:.1f} {y:.1f}) scale(.2)' fill='#fff'><ellipse rx='34' ry='11'/><circle cx='-12' cy='-8' r='12'/><circle cx='8' cy='-12' r='15'/><circle cx='22' cy='-4' r='10'/></g>"
    for i in range(3):
        s += f"<circle cx='50' cy='50' r='{46.6 + (i - 1) * 2.4}' fill='none' stroke='#fff' stroke-width='1' stroke-dasharray='12 30' opacity='.85'><animate attributeName='stroke-dashoffset' values='0;-{84 + i * 20}' dur='{3 + i}s' repeatCount='indefinite'/></circle>"
    return ring(s, 50)

def fr_basket():
    s = band_('#3a1a00', '#ff8f00', 7.6)
    for i in range(8):
        a = i * 45 + 22
        x1, y1 = pt(43, a)
        x2, y2 = pt(50, a)
        s += f"<path d='M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}' stroke='#3a1a00' stroke-width='1.6'/>"
    s += "<circle cx='50' cy='50' r='46.6' fill='none' stroke='#3a1a00' stroke-width='1.2'/><circle cx='50' cy='50' r='46.6' fill='none' stroke='#fff' stroke-width='1' stroke-dasharray='1 5' opacity='.45'/>"
    return ring(s, 22)

def fr_volley():
    s = band_('#1e88e5', '#ffffff', 7.6)
    for i in range(6):
        a0 = i * 60
        x1, y1 = pt(46.6, a0 + 6)
        x2, y2 = pt(46.6, a0 + 36)
        c = '#1e88e5' if i % 2 == 0 else '#fdd835'
        s += f"<path d='M{x1:.1f} {y1:.1f}A46.6 46.6 0 0 1 {x2:.1f} {y2:.1f}' fill='none' stroke='{c}' stroke-width='5'/>"
    s += "<circle cx='50' cy='50' r='50' fill='none' stroke='#90a4ae' stroke-width='.8'/><circle cx='50' cy='50' r='43' fill='none' stroke='#90a4ae' stroke-width='.8'/>"
    return ring(s, 26)

def fr_hockey():
    s = band_('#0d0d12', '#37474f', 7.8)
    s += "<circle cx='50' cy='50' r='49.4' fill='none' stroke='#90caf9' stroke-width='1.2'/>"
    for i in range(12):
        a = i * 30 + 7
        s += at(46.6, a, "<rect x='-1.1' y='-3.7' width='2.2' height='7.4' fill='#fff' opacity='.85'/>")
    for a in (0, 180):
        s += at(46.6, a, "<path d='M0 -2L-6 -8M0 -2L6 -8' stroke='#d32f2f' stroke-width='1.8' stroke-linecap='round'/><circle r='2.2' fill='#d32f2f'/>")
    return ring(s, 70)

def fr_sakura():
    s = band_('#ad1457', '#f48fb1', 6.6)
    for i in range(10):
        a = i * 36
        x, y = pt(46.6, a)
        s += f"<g transform='translate({x:.1f} {y:.1f}) rotate({a})'>" + ''.join(f"<ellipse cx='0' cy='-3.4' rx='2.1' ry='3' fill='{'#ffe0ec' if i % 2 else '#fff'}' transform='rotate({k * 72})'/>" for k in range(5)) + "<circle r='1.3' fill='#ffd54f'/></g>"
    for i in range(6):
        a = i * 60 + 18
        s += at(50, a, "<path d='M0 -2C2 -2 3 1 0 3C-3 1 -2 -2 0 -2z' fill='#ffc2d9'/>")
    return ring(s, 100)

def fr_nature():
    s = band_('#1b5e20', '#66bb6a', 6.8)
    for i in range(16):
        a = i * 22.5
        s += at(48.6, a, f"<path d='M0 0C-4 -3 -3 -8 0 -9C3 -8 4 -3 0 0z' fill='{'#2e7d32' if i % 2 else '#81c784'}' transform='rotate({-30 if i % 2 else 30})'/>")
    for a in (30, 120, 210, 300):
        s += at(46.6, a, "<circle r='2.2' fill='#e53935'/><path d='M0 -2.2V2.2' stroke='#222' stroke-width='.6'/><circle cx='-.8' cy='-.6' r='.5' fill='#222'/><circle cx='.9' cy='.8' r='.5' fill='#222'/>")
    for a in (75, 165, 255, 345):
        s += at(46.6, a, blossom(0, 0, 3.6, '#fff176', '#ff8f00'))
    return ring(s, 120)

# --- улучшенные старые
def fr_donut2():
    s = band_('#b0275f', '#ff80ab', 7.4)
    s += "<path d='M5 50a45 45 0 0 1 90 0' fill='none' stroke='#fff' stroke-width='1.1' opacity='.5' stroke-linecap='round' transform='rotate(-30 50 50)'/>"
    cols = ['#fff', '#ffeb3b', '#69f0ae', '#40c4ff', '#ff5252', '#b388ff']
    for i in range(30):
        a = i * 12
        x, y = pt(46.6 + (i % 3 - 1) * 1.2, a + (i % 3) * 2)
        s += f"<rect x='{x - 2.4:.1f}' y='{y - .8:.1f}' width='4.8' height='1.6' rx='.8' fill='{cols[i % 6]}' transform='rotate({a * 7 % 180} {x:.1f} {y:.1f})'><animate attributeName='opacity' values='1;.4;1' dur='{2 + i % 4}s' begin='-{i % 5}s' repeatCount='indefinite'/></rect>"
    for a in (40, 220):
        s += at(50, a, "<path d='M0 0C-3 -4 -1 -7 0 -4C1 -7 3 -4 0 0z' fill='#ff4081'/>")
    return ring(s, 120)

def fr_cat2():
    s = band_('#c25a00', '#ffb74d', 7.4)
    for i in range(20):
        a = i * 18
        x1, y1 = pt(43, a)
        x2, y2 = pt(50, a + 4)
        s += f"<path d='M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}' stroke='#5d2e00' stroke-width='2' stroke-linecap='round' opacity='.7'/>"
    for a in (-24, 24):
        s += at(49, a, "<path d='M-5 2L-3.6 -6 1 -1zM5 2L3.6 -6-1 -1z' fill='#ff9a2e' transform='translate(0 -1)'/><path d='M-3.8 0L-3.2 -4 -.6 -1z' fill='#ff9db0' transform='translate(0 -1)'/>")
    for a in (90, 160, 250, 320):
        s += at(46.6, a, "<ellipse cy='1' rx='2.2' ry='1.8' fill='#5d2e00'/><circle cx='-2.4' cy='-1.6' r='.9' fill='#5d2e00'/><circle cx='0' cy='-2.6' r='.9' fill='#5d2e00'/><circle cx='2.4' cy='-1.6' r='.9' fill='#5d2e00'/>")
    return ring(s, 150)

def fr_planet2():
    s = "<circle cx='50' cy='50' r='47' fill='none' stroke='#7c4dff' stroke-width='1.2' stroke-dasharray='2 2.4'/><circle cx='50' cy='50' r='44' fill='none' stroke='#b388ff' stroke-width='.8'/>"
    s += "<ellipse cx='50' cy='50' rx='49' ry='13' fill='none' stroke='#d7b3ff' stroke-width='2.4' opacity='.8' transform='rotate(-24 50 50)'/>"
    for a, r, c in [(20, 46, '#ffb74d'), (140, 46, '#4dd0e1'), (250, 46, '#ff80ab')]:
        x, y = pt(r, a)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='3.6' fill='{c}'/>"
    x, y = pt(46, 140)
    s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='5.6' fill='none' stroke='#4dd0e1' stroke-width='.8' opacity='.7'/>"
    for a in range(0, 360, 45):
        x, y = pt(48.6, a + 10)
        s += f"<circle cx='{x:.1f}' cy='{y:.1f}' r='.8' fill='#fff'><animate attributeName='opacity' values='1;.2;1' dur='{2 + a % 3}s' repeatCount='indefinite'/></circle>"
    return ring(s, 28)

F.update(s_cyber=fr_cyber(), s_water=fr_water(), s_earth=fr_earth(), s_fire=fr_fire(), s_air=fr_air(), s_basket=fr_basket(), s_volley=fr_volley(),
         s_hockey=fr_hockey(), s_sakura=fr_sakura(), s_nature=fr_nature(), s_donut=fr_donut2(), s_cat=fr_cat2(), s_planet=fr_planet2())
