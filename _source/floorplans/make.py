"""Casa Rossa floor plans: redrawn from Pat's annotated plans, rendered to PNG with headless Chrome.
Run:  python3 make.py   (writes floorplan-ground.png and floorplan-first.png next to this file,
then copy them into ../site/images/). Coordinates are traced from photos of Pat's plans.
"""
import os, subprocess
OUT = os.path.dirname(os.path.abspath(__file__))
PLUM, PAPER, STONE, MIST, MUTED, SILVER = "#5B2A45", "#F8F7F4", "#EEECE8", "#DCD3E7", "#66626B", "#9EA0A3"
OUTER, INNER = 5, 1.6          # wall weights: delicate outer walls, hairline partitions

def rect(x, y, w, h, fill=PAPER, sw=2, dash=None, stroke=PLUM):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'

def poly(pts, fill=PAPER, sw=OUTER):
    return f'<polygon points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="{fill}" stroke="{PLUM}" stroke-width="{sw}" stroke-linejoin="miter"/>'

def inner(x, y, w, h):
    return rect(x, y, w, h, fill="none", sw=INNER)

def stairs(x, y, w, h, n=9):
    s = [rect(x, y, w, h, fill=STONE, sw=1.2)]
    for i in range(1, n):
        yy = y + h * i / n
        s.append(f'<line x1="{x}" y1="{yy:.1f}" x2="{x+w}" y2="{yy:.1f}" stroke="{PLUM}" stroke-width="0.9"/>')
    return "".join(s)

def gap(x, y, axis, L, outer=False):
    t = (OUTER if outer else INNER) + 2
    return (f'<rect x="{x}" y="{y - t/2}" width="{L}" height="{t}" fill="{PAPER}"/>' if axis == "h"
            else f'<rect x="{x - t/2}" y="{y}" width="{t}" height="{L}" fill="{PAPER}"/>')

def opening(x, y, axis, L, outer=False):
    """A doorless opening: a gap in the wall with two small jambs."""
    j = 7
    if axis == "h":
        ticks = f'<path d="M{x},{y-j} V{y+j} M{x+L},{y-j} V{y+j}" stroke="{PLUM}" stroke-width="1.2"/>'
    else:
        ticks = f'<path d="M{x-j},{y} H{x+j} M{x-j},{y+L} H{x+j}" stroke="{PLUM}" stroke-width="1.2"/>'
    return gap(x, y, axis, L, outer) + ticks

def door(x, y, axis, L, swing, hinge=0, outer=False):
    """Door in a wall from (x,y) along axis 'h' or 'v' for length L.
    swing=+1 opens down/right, -1 up/left. hinge=0 hinged at the start, 1 at the end."""
    if axis == "h":
        hx, hy = (x if hinge == 0 else x + L), y
        fx, fy = (x + L if hinge == 0 else x), y
        lx, ly = hx, y + swing * L
    else:
        hx, hy = x, (y if hinge == 0 else y + L)
        fx, fy = x, (y + L if hinge == 0 else y)
        lx, ly = x + swing * L, hy
    cross = (fx - hx) * (ly - hy) - (fy - hy) * (lx - hx)
    sweep = 1 if cross > 0 else 0
    return (gap(x, y, axis, L, outer)
            + f'<line x1="{hx}" y1="{hy}" x2="{lx}" y2="{ly}" stroke="{PLUM}" stroke-width="1.6"/>'
            + f'<path d="M{fx},{fy} A{L},{L} 0 0 {sweep} {lx},{ly}" fill="none" stroke="{PLUM}" stroke-width="0.9" opacity="0.75"/>')

def fit(n, w, base):
    longest = max(len(l) for l in n.split("\n"))
    return min(base, (w - 34) / (longest * 0.74))

def label(x, y, text, size=24, style="sans", color=PLUM):
    lines = text.split("\n"); lh = size * 1.3; y0 = y - (len(lines) - 1) * lh / 2
    if style == "serif":
        fam, extra, tx = "'Cormorant Garamond', Georgia, serif", 'font-style="italic"', (lambda t: t)
    else:
        fam, extra, tx = "Jost, Arial, sans-serif", f'letter-spacing="{size*0.14:.1f}" font-weight="400"', (lambda t: t.upper())
    sp = "".join(f'<tspan x="{x}" y="{y0 + i*lh + size*0.35:.1f}">{tx(l)}</tspan>' for i, l in enumerate(lines))
    return f'<text text-anchor="middle" font-family="{fam}" font-size="{size:.1f}" fill="{color}" {extra}>{sp}</text>'

def page(svg, vb):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Jost:wght@300;400;500&display=block" rel="stylesheet">
<style>html,body{{margin:0;background:{STONE}}} svg{{display:block;width:100vw;height:auto}}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">
<rect x="-9999" y="-9999" width="99999" height="99999" fill="{STONE}"/>{svg}</svg></body></html>"""

def line(x1, y1, x2, y2, sw=INNER, dash=None, color=PLUM):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{sw}"{d}/>'

def double_door(x, y, axis, L, swing, outer=False):
    """Pair of doors (French doors) filling an opening of length L."""
    h = L / 2
    if axis == "h":
        return door(x, y, "h", h, swing, 0, outer) + door(x + h, y, "h", h, swing, 1, outer)
    return door(x, y, "v", h, swing, 0, outer) + door(x, y + h, "v", h, swing, 1, outer)

def window(x, y, axis, L):
    """Window in an outer wall: a gap with a thin double line."""
    if axis == "h":
        return gap(x, y, "h", L, True) + line(x, y - 2.5, x + L, y - 2.5, 0.9) + line(x, y + 2.5, x + L, y + 2.5, 0.9) \
            + line(x, y - 5, x, y + 5, 1.2) + line(x + L, y - 5, x + L, y + 5, 1.2)
    return gap(x, y, "v", L, True) + line(x - 2.5, y, x - 2.5, y + L, 0.9) + line(x + 2.5, y, x + 2.5, y + L, 0.9) \
        + line(x - 5, y, x + 5, y, 1.2) + line(x - 5, y + L, x + 5, y + L, 1.2)

def sliding(x, y, L, offset):
    """Sliding door in a vertical wall: a gap with the door panel drawn just beside it."""
    return gap(x, y, "v", L) + line(x + offset, y, x + offset, y + L * 0.8, 2.2)

# ---------- GROUND FLOOR (redrawn 2026-11-14 from Pat's updated plan) ----------
g = []
g.append(rect(1160, 470, 625, 350, fill="none", sw=1.5, dash="9 8"))
g.append(label(1472, 645, "Courtyard", 50, "serif", MUTED))
outline = [(480,460),(1160,460),(1160,130),(1785,130),(1785,470),(1160,470),(1160,1100),(1085,1100),(1085,1375),(480,1375),(480,1100),(270,1100),(270,840),(480,840)]
g.append(poly(outline, sw=0))
rooms = [(480,460,280,330,"Lounge"),(760,460,290,330,"Kitchen and\ndining"),(1050,460,110,230,"Hall"),(1050,690,110,100,"Store"),
         (480,790,310,310,"La Saletta"),(790,790,270,310,"Dining room"),(1060,790,100,310,""),
         (480,1100,280,275,"Winter\nsitting room"),(760,1100,325,275,""),
         (270,840,210,85,"Guest\ncloakroom"),(270,925,210,175,"Boiler\nroom")]
for x, y, w, h, n in rooms: g.append(inner(x, y, w, h))
# TV room, en-suite and bedroom five: the old lobby walls have gone
g += [line(1440, 130, 1440, 380), line(1440, 380, 1550, 380), line(1550, 130, 1550, 405),
      line(1550, 440, 1550, 470, 2.4), line(1550, 440, 1612, 440, 2.4)]
g.append(stairs(700, 960, 70, 135, 8))
g.append(poly(outline, fill="none"))
g.append(stairs(405, 1105, 70, 270, 12))
g += [
    double_door(560, 790, "h", 140, 1),     # lounge / La Saletta, double doors
    opening(825, 790, "h", 155),            # kitchen / dining room
    opening(760, 525, "v", 180),            # lounge / kitchen, wide opening
    opening(1050, 555, "v", 130),           # kitchen / hall
    door(1160, 575, "v", 55, -1, outer=True),   # hall / courtyard
    door(1055, 690, "h", 45, -1),           # hall / store
    door(1470, 380, "h", 50, -1),           # en-suite
    double_door(1595, 470, "h", 110, 1, outer=True),  # bedroom five / courtyard, French doors
    door(1060, 900, "v", 55, 1),            # dining room / passage
    door(1160, 840, "v", 55, -1, outer=True),   # passage / outside
    door(980, 1100, "h", 55, 1),            # dining room / unlabelled room
    door(560, 1100, "h", 55, 1),            # La Saletta / winter sitting room
    door(480, 860, "v", 45, -1),            # La Saletta / guest cloakroom
    door(300, 1100, "h", 50, -1, outer=True),   # boiler room / outside
    double_door(520, 1375, "h", 190, 1, outer=True),  # winter sitting room / garden, double doors
]
rooms += [(1160,130,280,340,"TV and\ngames room"),(1440,130,110,250,"En-suite"),(1550,130,235,340,"Bedroom\nfive")]
for x, y, w, h, n in rooms:
    if not n: continue
    small = n in ("Hall", "Store", "Guest\ncloakroom", "En-suite")
    cx = x + w/2 - (35 if n == "La Saletta" else 22 if n == "Guest\ncloakroom" else 0); cy = y + h/2 - (60 if n == "La Saletta" else 80 if n == "Hall" else 30 if n in ("TV and\ngames room", "Bedroom\nfive") else 0)
    g.append(label(cx, cy, n, fit(n, w - (60 if n == "La Saletta" else 0), 17 if small else 27)))
g.append(label(1472, 1300, "Not to scale", 18, "sans", SILVER))
ground = page("".join(g), "230 90 1600 1420")

# ---------- FIRST FLOOR (redrawn 2026-11-14) ----------
# Traced in the photo's own pixel positions, then scaled with T().
def T(px, py): return (565 + (px - 200) * 0.52, 510 + (py - 45) * 0.53)
def L(x1, y1, x2, y2, sw=INNER, dash=None):
    a, b = T(x1, y1); c, d = T(x2, y2); return line(a, b, c, d, sw, dash)
def R(x1, y1, x2, y2, fill=STONE, sw=1.2, dash=None):
    a, b = T(x1, y1); c, d = T(x2, y2); return rect(a, b, c - a, d - b, fill=fill, sw=sw, dash=dash)
def S(x1, y1, x2, y2, n):
    a, b = T(x1, y1); c, d = T(x2, y2); return stairs(a, b, c - a, d - b, n)
def Lab(px, py, text, size, style="sans", color=PLUM):
    a, b = T(px, py); return label(a, b, text, size, style, color)
f = []
f.append(R(1325, 30, 1490, 390, fill=MIST, sw=1.5, dash="8 6"))      # loggia
outline1 = [T(200,45), T(1325,45), T(1325,1770), T(165,1770), T(165,1275), T(200,1275)]
f.append(poly(outline1, sw=0))
f += [
    L(750, 45, 750, 700),                                   # bedroom two / bedroom three
    L(200, 495, 625, 495), L(740, 495, 815, 495),           # bedroom two (opening onto the landing)
    L(915, 490, 1325, 490),                                 # bedroom three (opening onto the landing)
    L(740, 560, 740, 697, 2.4), L(740, 697, 818, 697), L(815, 495, 815, 690, 1.2, "5 5"),  # cupboard
    L(625, 495, 625, 530), L(625, 670, 625, 700), L(200, 700, 628, 700), L(610, 530, 610, 650, 2.4),  # en-suite, sliding door
    L(955, 490, 955, 545), L(955, 645, 955, 700), L(955, 820, 955, 900),  # right-hand en-suites
    L(955, 690, 1325, 690), L(922, 690, 922, 825, 2.4), L(920, 690, 955, 690, 2.4),  # sliding door
    L(915, 900, 960, 900, 2.4), L(1100, 900, 1325, 900),    # bedroom four, open to its en-suite
    L(775, 900, 808, 900, 2.4), L(808, 900, 808, 985, 2.4), L(778, 1165, 778, 1270),  # stair rail
    L(200, 1275, 255, 1275), L(370, 1275, 1325, 1275), L(370, 1275, 370, 1390, 2.4),  # principal bedroom
    L(715, 1275, 715, 1335), L(715, 1435, 715, 1495), L(715, 1580, 715, 1625), L(715, 1720, 715, 1770),
    L(807, 1275, 807, 1365), L(807, 1435, 807, 1625), L(807, 1720, 807, 1770),   # dressing area
]
for yy in (1495, 1580):
    a, b = T(715, yy); f.append(line(a - 7, b, a + 7, b, 1.2))
f.append(R(375, 865, 645, 1200, fill=MIST))                 # open to below
f.append(S(645, 860, 772, 1165, 9))                         # gallery staircase
f.append(poly(outline1, fill="none"))
f.append(S(1340, 410, 1490, 915, 12))                       # outside stairs to the loggia
f.append(S(15, 1300, 160, 1770, 12))                        # outside stairs to the principal bedroom
x, y = T(955, 545); f.append(door(x, y, "v", 100 * 0.53, 1))           # landing / en-suite
x, y = T(1325, 150); f.append(door(x, y, "v", 110 * 0.53, 1, outer=True))  # bedroom three / loggia
x, y = T(165, 1345); f.append(door(x, y, "v", 90 * 0.53, 1, outer=True))   # outside stairs / principal bedroom
f += [Lab(465, 275, "Bedroom two", 21), Lab(1040, 265, "Bedroom three", 21), Lab(425, 600, "En-suite", 13.5),
      Lab(1165, 590, "En-suite", 13.5), Lab(1165, 795, "En-suite", 13.5), Lab(490, 775, "Gallery staircase", 15),
      Lab(510, 1035, "Open\nto below", 11, "sans", MUTED), Lab(1140, 1080, "Bedroom\nfour", 21),
      Lab(445, 1525, "Principal\nbedroom", 21), Lab(1065, 1525, "Principal\nen-suite", 21), Lab(1410, 320, "Loggia", 11),
      Lab(750, 1830, "Not to scale", 14, "sans", SILVER)]
first = page("".join(f), "410 460 880 1030")

# ---------- POOL HOUSE (new 2026-11-14) ----------
p = []
p.append(rect(140, 1110, 810, 140, fill="none", sw=1.5, dash="9 8"))            # pergola
p.append(f'<circle cx="1080" cy="1150" r="85" fill="none" stroke="{SILVER}" stroke-width="1.4" stroke-dasharray="4 6"/>')  # tree
p.append(line(60, 1300, 1260, 1300, 1.2) + line(60, 1314, 1260, 1314, 1.2))      # wall
pool_outline = [(140,625),(395,625),(395,755),(655,755),(655,645),(1150,645),(1150,1000),(950,1000),(950,1110),(140,1110)]
p.append(poly(pool_outline, sw=0))
p += [
    line(140, 880, 210, 880), line(265, 880, 395, 880),          # kitchen, opening to the oven
    line(395, 755, 395, 775), line(395, 860, 395, 880),          # kitchen / dining area opening
    line(330, 880, 330, 1110),                                   # dining area
    line(685, 755, 685, 905),                                    # dining / sitting area (part wall)
    line(655, 755, 700, 755), line(760, 755, 940, 755),          # laundry room
    line(940, 645, 940, 880),                                    # bathroom
    line(940, 880, 1000, 880), line(1060, 880, 1150, 880),
]
p.append(f'<circle cx="237" cy="995" r="70" fill="{STONE}" stroke="{PLUM}" stroke-width="{INNER}"/>')  # wood oven
p.append(poly(pool_outline, fill="none"))
p += [
    door(230, 625, "h", 55, 1, outer=True),          # kitchen / outside
    door(500, 755, "h", 55, 1, outer=True),          # dining area / outside
    double_door(465, 1110, "h", 110, -1, outer=True),  # dining area / pergola
    double_door(750, 1110, "h", 120, -1, outer=True),  # sitting area / pergola
    door(1010, 1000, "h", 55, -1, outer=True),       # lobby / outside
    door(1000, 880, "h", 60, -1),                    # bathroom
    opening(700, 755, "h", 60),                      # laundry room
    window(775, 645, "h", 80), window(990, 645, "h", 65),
]
p += [label(267, 752, "Kitchen", 24), label(510, 965, "Dining\narea", 24), label(815, 960, "Sitting\narea", 24),
      label(797, 700, "Laundry room", fit("Laundry room", 285, 17)), label(1045, 765, "Bathroom", 17),
      label(237, 995, "Wood\noven", 13), label(545, 1185, "Pergola", 40, "serif", MUTED),
      label(660, 1360, "Pool on the lower level", 30, "serif", MUTED), label(1080, 1150, "Tree", 13, "sans", SILVER),
      label(1120, 1395, "Not to scale", 15, "sans", SILVER)]
pool = page("".join(p), "60 560 1240 870")

chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for name, html, w, h in [("floorplan-ground", ground, 1600, 1420), ("floorplan-first", first, 1100, 1288), ("floorplan-pool-house", pool, 1240, 870)]:
    p = os.path.join(OUT, name + ".html"); open(p, "w").write(html)
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.25",
                    f"--window-size={w},{h}", "--virtual-time-budget=6000",
                    f"--screenshot={os.path.join(OUT, name + '.png')}", "file://" + p],
                   check=True, capture_output=True)
    print(name, "ok")
