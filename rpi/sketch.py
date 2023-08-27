from datetime import datetime
import py5
from deadpixel.keystone import Keystone
import firebase_admin
from firebase_admin import db, storage


delay = 2

dimensions = {
    "front": [
        { "w": 480, "h": 97 },
        { "w": 480, "h": 50 },
        { "w": 380, "h": 77 },
        { "w": 380, "h": 45 },
        { "w": 290, "h": 60 },
        { "w": 290, "h": 50 },
        { "w": 190, "h": 42 },
        { "w": 190, "h": 48 },
        { "w": 95, "h": 22 },
        { "w": 95, "h": 95 },
    ],
    "back": [
        { "w": 480, "h": 97 },
        { "w": 480, "h": 50 },
        { "w": 380, "h": 77 },
        { "w": 380, "h": 45 },
        { "w": 290, "h": 60 },
        { "w": 290, "h": 50 },
        { "w": 190, "h": 42 },
        { "w": 190, "h": 48 },
        { "w": 95, "h": 22 },
    ],
    "left": [
        { "w": 480, "h": 97 },
        { "w": 380, "h": 50 },
        { "w": 380, "h": 77 },
        { "w": 290, "h": 45 },
        { "w": 290, "h": 60 },
        { "w": 190, "h": 50 },
        { "w": 190, "h": 42 },
        { "w": 95, "h": 48 },
        { "w": 95, "h": 22 },
    ],
    "right": [
        { "w": 480, "h": 97 },
        { "w": 380, "h": 50 },
        { "w": 380, "h": 77 },
        { "w": 290, "h": 45 },
        { "w": 290, "h": 60 },
        { "w": 190, "h": 50 },
        { "w": 190, "h": 42 },
        { "w": 95, "h": 48 },
        { "w": 95, "h": 22 },
    ],
}
face = "front"

def x_offset():
    x = 0
    if face == "front":
        return x
    if face == "back":
        for piece in dimensions["front"]:
            x += piece["w"]
        return x
    if face == "left":
        for piece in dimensions["front"]:
            x += piece["w"]
        for piece in dimensions["back"]:
            x += piece["w"]
        return x
    if face == "right":
        for piece in dimensions["front"]:
            x += piece["w"]
        for piece in dimensions["back"]:
            x += piece["w"]
        for piece in dimensions["left"]:
            x += piece["w"]
        return x


cred_obj = firebase_admin.credentials.Certificate("firebase-admin-sdk.json")
default_app = firebase_admin.initialize_app(cred_obj, {
    "databaseURL": "https://common-pastiche-db.firebaseio.com/",
    "storageBucket": "common-pastiche-app.appspot.com"
})
bucket = storage.bucket()
start_x = x_offset()
num_surfaces = len(dimensions[face])
offscreen = []
surface = []
img = None
ks = None

def download_painting(title, ref):
    fn = f"{title}.png"
    blob = bucket.blob(ref)
    blob.download_to_filename(fn)
    return fn


def get_painting_id():
    ref = db.reference("current")
    painting_id = ref.get()["painting"]
    return painting_id


current_id = None

def update_painting(isInitial = False):
    global img, ks
    ref = db.reference(f"art_walk/{current_id}")
    current = ref.get()
    fn = download_painting(current["title"], current["ref"])
    img = py5.load_image(fn)
    x = start_x
    y = 0
    for i in range(num_surfaces):
        w = dimensions[face][i]["w"]
        h = dimensions[face][i]["h"]
        if (isInitial):
            off = py5.create_graphics(w, h)
        else:
            off = offscreen[i]
        w = dimensions[face][i]["w"]
        h = dimensions[face][i]["h"]
        drawing = img.get_pixels(x, y, w, h)
        off.begin_draw()
        off.image(drawing, 0, 0)
        off.end_draw()
        if isInitial:
            offscreen.append(off)
            surf = ks.createCornerPinSurface(w, h, 10)
            surface.append(surf)
        x += w


def settings():
	py5.full_screen(py5.P3D)


def setup():
    global ks, current_id
    ks = Keystone(py5.get_current_sketch())
    current_id = get_painting_id()
    update_painting(True)


has_checked = False

def draw():
    global current_id, has_checked
    py5.background(0)
    for i in range(num_surfaces):
        off = offscreen[i]
        surf = surface[i]
        surf.render(off)
    if datetime.now().second % delay == 0:
        if has_checked:
            return
        current_id = get_painting_id()
        update_painting()
        has_checked = True
    else:
        has_checked = False


def key_pressed():
    if py5.key == "c":
        ks.toggleCalibration()
    elif py5.key == "s":
        ks.save()
    elif py5.key == "l":
        ks.load()
    elif py5.key == "u":
        update_painting()


py5.run_sketch()
