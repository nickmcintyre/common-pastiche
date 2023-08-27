
const sprayButtons = {
    xlarge: {
        radius: 40,
        selected: false,
    },
    large: {
        radius: 20,
        selected: false,
    },
    medium: {
        radius: 10,
        selected: false,
    },
    small: {
        radius: 5,
        selected: false,
    },
};
const colorButtons = {
    brown: {
        cssColor: "saddlebrown",
        selected: false,
    },
    red: {
        cssColor: "crimson",
        selected: false,
    },
    orange: {
        cssColor: "orange",
        selected: false,
    },
    yellow: {
        cssColor: "gold",
        selected: false,
    },
    green: {
        cssColor: "forestgreen",
        selected: false,
    },
    blue: {
        cssColor: "royalblue",
        selected: false,
    },
    purple: {
        cssColor: "darkorchid",
        selected: false,
    },
    black: {
        cssColor: "#333",
        selected: false,
    },
    white: {
        cssColor: "#fff",
        selected: false,
    },
};
const orbitButton = {
    selected: false,
};
const zoomButtons = {
    in: {
        factor: 1.1,
    },
    out: {
        factor: 0.9,
    },
};
const eventName = "art_walk";
const uuid = crypto.randomUUID();
let storageRef;
let database;
let titleInput;
let submitButton;

function setup() {
    noCanvas();
    storageRef = firebase.storage().ref();
    database = firebase.database();
    // Brushes.
    sprayButtons.xlarge.btn = select("#spray-xlarge");
    sprayButtons.xlarge.btn.mouseClicked(() => {
        switchSize("xlarge");
    });
    sprayButtons.large.btn = select("#spray-large");
    sprayButtons.large.btn.mouseClicked(() => {
        switchSize("large");
    });
    sprayButtons.medium.btn = select("#spray-medium");
    sprayButtons.medium.btn.mouseClicked(() => {
        switchSize("medium");
    });
    sprayButtons.small.btn = select("#spray-small");
    sprayButtons.small.btn.mouseClicked(() => {
        switchSize("small");
    });
    // Colors.
    colorButtons.brown.btn = select("#color-brown");
    colorButtons.brown.btn.mouseClicked(() => {
        switchColor("brown");
    });
    colorButtons.red.btn = select("#color-red");
    colorButtons.red.btn.mouseClicked(() => {
        switchColor("red");
    });
    colorButtons.orange.btn = select("#color-orange");
    colorButtons.orange.btn.mouseClicked(() => {
        switchColor("orange");
    });
    colorButtons.yellow.btn = select("#color-yellow");
    colorButtons.yellow.btn.mouseClicked(() => {
        switchColor("yellow");
    });
    colorButtons.green.btn = select("#color-green");
    colorButtons.green.btn.mouseClicked(() => {
        switchColor("green");
    });
    colorButtons.blue.btn = select("#color-blue");
    colorButtons.blue.btn.mouseClicked(() => {
        switchColor("blue");
    });
    colorButtons.purple.btn = select("#color-purple");
    colorButtons.purple.btn.mouseClicked(() => {
        switchColor("purple");
    });
    colorButtons.black.btn = select("#color-black");
    colorButtons.black.btn.mouseClicked(() => {
        switchColor("black");
    });
    colorButtons.white.btn = select("#color-white");
    colorButtons.white.btn.mouseClicked(() => {
        switchColor("white");
    });
    // Controls.
    orbitButton.btn = select("#enter-orbit");
    orbitButton.btn.mouseClicked(() => {
        window.controls.enabled = !window.controls.enabled;
        orbitButton.selected = !orbitButton.selected;
        if (orbitButton.selected) {
            orbitButton.btn.addClass("selected");
        } else {
            orbitButton.btn.removeClass("selected");
        }
    });
    // Initialize.
    switchSize("medium");
    switchColor("black");
}

function draw() {
    if (frameCount % 60 === 0) {
        const paintingDataUrl = generateDataUrl();
        const filenName = `${eventName}/live.png`;
        const paintingRef = storageRef.child(filenName);
        paintingRef.putString(paintingDataUrl, 'data_url');
    }
}

function switchSize(size) {
    if (sprayButtons[size].selected) {
        return;
    }
    Object.keys(sprayButtons).forEach((s) => {
        sprayButtons[s].selected = false;
        sprayButtons[s].btn.removeClass("selected");
    });
    sprayButtons[size].selected = true;
    sprayButtons[size].btn.addClass("selected");
    const { radius } = sprayButtons[size];
    window.surfaces.forEach((surf) => surf.setBrushSize(radius));
}

function switchColor(color) {
    if (colorButtons[color].selected) {
        return;
    }
    Object.keys(colorButtons).forEach((c) => {
        colorButtons[c].selected = false;
        colorButtons[c].btn.removeClass("selected");
    });
    colorButtons[color].selected = true;
    colorButtons[color].btn.addClass("selected");
    const { cssColor } = colorButtons[color];
    window.surfaces.forEach((surf) => surf.setBrushColor(cssColor));
}

function generateDataUrl() {
    const canvas = document.createElement("canvas");
    let totalWidth = 0;
    let totalHeight = 0;
    ["front", "left", "back", "right"].forEach((side) => {
        window.dimensions[side].forEach((dim) => {
            totalWidth += dim.w;
            totalHeight = max(totalHeight, dim.h);
        });
    })
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    let x = 0;
    const y = 0;
    window.surfaces.forEach((surf) => {
        ctx.drawImage(surf.canvas, x, y);
        x += surf.canvas.width;
    });
    return canvas.toDataURL("image/png");
}
