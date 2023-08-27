/**
 * Adapted from the three.js raycaster - texture example.
 * https://threejs.org/examples/?q=raycast#webgl_raycaster_texture
 */
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const INACTIVE = 'inactive';

const PI = Math.PI;
const HALF_PI = Math.PI * 0.5;
const TAU = Math.PI * 2;

class DrawingSurface {
    constructor(width, height, background = '#fff') {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = background;
        this.ctx.fillRect(0, 0, width, height);
        this.brushX = INACTIVE;
        this.brushY = INACTIVE;
        this.pbrushX = INACTIVE;
        this.pbrushY = INACTIVE;
        this.brushSize = 5;
        this.brushColor = '#000000';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.shadowColor = this.brushColor;
        this.ctx.shadowBlur = this.brushSize * 1.5;
        this.texture = new THREE.Texture(undefined, THREE.UVMapping);
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.texture.image = this.canvas;
        this.material = new THREE.MeshLambertMaterial({ map: this.texture });
        this.geometry = new THREE.PlaneGeometry(width, height, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh._drawingSurface = this;
        this.texture.needsUpdate = true;
    }

    translate(x = 0, y = 0, z = 0) {
        this.mesh.position.set(x, y, z);
    }

    rotate(x = 0, y = 0, z = 0) {
        this.mesh.rotation.set(x, y, z);
    }

    setBrushPosition(x, y) {
        if (this.brushX === INACTIVE || this.brushY === INACTIVE) {
            this.brushX = x * this.canvas.width;
            this.brushY = y * this.canvas.height;
            this.pbrushX = this.brushX;
            this.pbrushY = this.brushY;
        } else {
            this.pbrushX = this.brushX;
            this.pbrushY = this.brushY;
            this.brushX = x * this.canvas.width;
            this.brushY = y * this.canvas.height;
        }

        this.draw();
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.shadowBlur = this.brushSize * 1.5;
    }

    setBrushColor(color) {
        this.brushColor = color;
        this.ctx.shadowColor = this.brushColor;
    }

    deselect() {
        this.pbrushX = INACTIVE;
        this.pbrushY = INACTIVE;
        this.brushX = INACTIVE;
        this.brushY = INACTIVE;
    }

    draw() {
        if (!this.ctx) return;
        if (window.controls.enabled) return;

        this.ctx.strokeStyle = this.brushColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.pbrushX, this.pbrushY);
        this.ctx.lineTo(this.brushX, this.brushY);
        this.ctx.stroke();
        this.texture.needsUpdate = true;
    }
}


const width = window.innerWidth;
const height = window.innerHeight;

let container;

let camera, scene, renderer;
window.controls = undefined;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();

window.surfaces = [];

window.dimensions = {
    front: [
        { w: 480, h: 97 },
        { w: 480, h: 50 },
        { w: 380, h: 77 },
        { w: 380, h: 45 },
        { w: 290, h: 60 },
        { w: 290, h: 50 },
        { w: 190, h: 42 },
        { w: 190, h: 48 },
        { w: 95, h: 22 },
        { w: 95, h: 95 },
    ],
    back: [
        { w: 480, h: 97 },
        { w: 480, h: 50 },
        { w: 380, h: 77 },
        { w: 380, h: 45 },
        { w: 290, h: 60 },
        { w: 290, h: 50 },
        { w: 190, h: 42 },
        { w: 190, h: 48 },
        { w: 95, h: 22 },
    ],
    left: [
        { w: 480, h: 97 },
        { w: 380, h: 50 },
        { w: 380, h: 77 },
        { w: 290, h: 45 },
        { w: 290, h: 60 },
        { w: 190, h: 50 },
        { w: 190, h: 42 },
        { w: 95, h: 48 },
        { w: 95, h: 22 },
    ],
    right: [
        { w: 480, h: 97 },
        { w: 380, h: 50 },
        { w: 380, h: 77 },
        { w: 290, h: 45 },
        { w: 290, h: 60 },
        { w: 190, h: 50 },
        { w: 190, h: 42 },
        { w: 95, h: 48 },
        { w: 95, h: 22 },
    ],
};

function assemble(scene) {
    let totalHeight = 0;
    let totalDepth = 0;
    dimensions.front.forEach((f, idx) => {
        const { w, h } = f;
        f.surface = new DrawingSurface(w, h);
        surfaces.push(f.surface);
        if (idx === 0) {
            totalHeight += h / 2;
            scene.add(f.surface.mesh);
        } else {
            if (idx % 2 === 0) {
                totalHeight += h / 2;
                f.surface.translate(0, totalHeight, totalDepth);
                totalHeight += h / 2;
            } else {
                totalDepth -= h / 2;
                f.surface.rotate(3 * HALF_PI, 0, 0);
                f.surface.translate(0, totalHeight, totalDepth);
                totalDepth -= h / 2;
            }
            scene.add(f.surface.mesh);
        }
    });
    totalHeight = 0;
    totalDepth = -dimensions.left[0].w;
    dimensions.back.forEach((f, idx) => {
        const { w, h } = f;
        f.surface = new DrawingSurface(w, h);
        surfaces.push(f.surface);
        if (idx === 0) {
            totalHeight += h / 2;
            f.surface.rotate(0, PI, 0);
            f.surface.translate(0, 0, totalDepth);
            scene.add(f.surface.mesh);
        } else {
            if (idx % 2 === 0) {
                totalHeight += h / 2;
                f.surface.translate(0, totalHeight, totalDepth);
                f.surface.rotate(0, PI, 0);
                totalHeight += h / 2;
            } else {
                totalDepth += h / 2;
                f.surface.rotate(3 * HALF_PI, 0, 0);
                f.surface.translate(0, totalHeight, totalDepth);
                totalDepth += h / 2;
            }
            scene.add(f.surface.mesh);
        }
    });
    totalHeight = 0;
    totalDepth = 0;
    dimensions.left.forEach((f, idx) => {
        const { w, h } = f;
        f.surface = new DrawingSurface(w, h);
        surfaces.push(f.surface);
        const centerZ = -dimensions.front[0].w * 0.5;
        if (idx === 0) {
            const centerX = centerZ;
            totalHeight += h / 2;
            f.surface.rotate(0, -HALF_PI, 0);
            f.surface.translate(centerX, 0, centerZ);
            scene.add(f.surface.mesh);
        } else {
            if (idx % 2 === 0) {
                totalHeight += h / 2;
                f.surface.rotate(0, -HALF_PI, 0);
                f.surface.translate(-dimensions.front[idx].w / 2, totalHeight, totalDepth - dimensions.front[idx].w / 2);
                totalHeight += h / 2;
            } else {
                const centerX = (-dimensions.front[idx].w + h) / 2;
                totalDepth -= h / 2;
                f.surface.translate(centerX, totalHeight, centerZ);
                f.surface.rotate(-HALF_PI, 0, -HALF_PI)
                totalDepth -= h / 2;
            }
            scene.add(f.surface.mesh);
        }
    });
    totalHeight = 0;
    totalDepth = 0;
    dimensions.right.forEach((f, idx) => {
        const { w, h } = f;
        f.surface = new DrawingSurface(w, h);
        surfaces.push(f.surface);
        const centerZ = -dimensions.front[0].w * 0.5;
        if (idx === 0) {
            const centerX = -centerZ;
            totalHeight += h / 2;
            f.surface.rotate(0, HALF_PI, 0);
            f.surface.translate(centerX, 0, centerZ);
            scene.add(f.surface.mesh);
        } else {
            if (idx % 2 === 0) {
                totalHeight += h / 2;
                f.surface.rotate(0, HALF_PI, 0);
                f.surface.translate(dimensions.front[idx].w / 2, totalHeight, totalDepth - dimensions.front[idx].w / 2);
                totalHeight += h / 2;
            } else {
                const centerX = -(-dimensions.front[idx].w + h) / 2;
                totalDepth -= h / 2;
                f.surface.translate(centerX, totalHeight, centerZ);
                f.surface.rotate(-HALF_PI, 0, -HALF_PI)
                totalDepth -= h / 2;
            }
            scene.add(f.surface.mesh);
        }
    });
    const w = window.dimensions.front[0].w
    const h = window.dimensions.front[0].w;
    const baseGeometry = new THREE.PlaneGeometry(w, h);
    const baseMaterial = new THREE.MeshLambertMaterial(0xcccccc);
    window.basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    const x = 0;
    const y = -window.dimensions.front[0].h * 0.5;
    const z = -w * 0.5;
    basePlane.position.set(x, y, z);
    basePlane.rotation.set(HALF_PI, 0, 0);
    scene.add(basePlane);
}

init();
render();

function init() {
    container = document.getElementById('container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
    camera.position.x = -500;
    camera.position.y = 400;
    camera.position.z = 400;
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enabled = false;

    const directional = new THREE.DirectionalLight('white', 1.5);
    directional.position.set(300, 500, 300);
    scene.add(directional);
    const ambient = new THREE.AmbientLight('white');
    scene.add(ambient);

    assemble(scene);


    window.addEventListener('resize', onWindowResize);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(evt) {
    evt.preventDefault();

    const array = getMousePosition(container, evt.clientX, evt.clientY);
    onClickPosition.fromArray(array);

    const intersects = getIntersects(onClickPosition, scene.children);

    if (intersects.length > 0 && intersects[0].uv) {
        const { uv } = intersects[0];
        intersects[0].object.material.map.transformUv(uv);
        intersects[0].object._drawingSurface.setBrushPosition(uv.x, uv.y);
        surfaces.forEach((surface) => {
            if (surface.mesh.uuid !== intersects[0].object.uuid) {
                surface.deselect();
            }
        });
    }
}

function onPointerUp(evt) {
    surfaces.forEach((surface) => {
        surface.deselect();
    });
}

function getMousePosition(dom, x, y) {
    const rect = dom.getBoundingClientRect();
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}

function getIntersects(point, objects) {
    mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects, false);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}
