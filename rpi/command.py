import firebase_admin
from firebase_admin import db, storage


cred_obj = firebase_admin.credentials.Certificate(
    "firebase-admin-sdk.json"
)
default_app = firebase_admin.initialize_app(
    cred_obj,
    {
        "databaseURL": "https://common-pastiche-db.firebaseio.com/",
        "storageBucket": "common-pastiche-app.appspot.com",
    },
)

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "live":
            ref = db.reference("current")
            ref.set({"painting": "live"})
        else:
            ref = db.reference("art_walk")
            bucket = storage.bucket()
            snapshot = ref.get()
            paintings = sorted(snapshot.items(), key=lambda k: k[1]["timestamp"])
            n = int(sys.argv[1])
            if n >= len(paintings):
                message = "😱 There aren't that many paintings."
            elif n < 0 and abs(n + 1) >= len(paintings):
                message = "😱 There aren't that many paintings."
            else:
                id = paintings[n][0]
                ref = db.reference("current")
                ref.set({"painting": id})
                title = paintings[n][1]["title"]
                message = f"🎨 {title}"
            print("=" * (len(message) + 1))
            print(message)
            print("=" * (len(message) + 1))
