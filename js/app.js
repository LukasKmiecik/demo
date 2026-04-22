import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/DRACOLoader.js';

const viewer = document.getElementById('viewer3d');
const statusEl = document.getElementById('statusModelu');
const resetBtn = document.getElementById('resetKameryBtn');
const fitBtn = document.getElementById('pokazCalyModelBtn');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(6, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(8, 14, 10);
scene.add(dir);

const grid = new THREE.GridHelper(40, 40, 0x475569, 0x1e293b);
grid.position.y = -0.001;
scene.add(grid);

const axes = new THREE.AxesHelper(2);
scene.add(axes);

let modelRoot = null;
let initialCameraPosition = new THREE.Vector3(6, 5, 8);
let initialTarget = new THREE.Vector3(0, 1, 0);

function ustawRozmiar() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function ustawListeDanych(containerId, dane) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  Object.entries(dane).forEach(([klucz, wartosc]) => {
    const dt = document.createElement('dt');
    dt.textContent = klucz;

    const dd = document.createElement('dd');
    if (klucz.toLowerCase() === 'status') {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = wartosc;
      dd.appendChild(badge);
    } else {
      dd.textContent = wartosc;
    }

    container.appendChild(dt);
    container.appendChild(dd);
  });
}

function wypelnijPanel(dane) {
  document.getElementById('nazwaObiektu').textContent = dane.nazwa || 'Obiekt';
  document.getElementById('opisObiektu').textContent = dane.opis || '';
  ustawListeDanych('danePodstawowe', dane.danePodstawowe || {});
  ustawListeDanych('daneKontaktowe', dane.daneKontaktowe || {});
  ustawListeDanych('daneDostepu', dane.daneDostepu || {});

  const notatkiLista = document.getElementById('notatkiLista');
  notatkiLista.innerHTML = '';
  (dane.notatki || []).forEach((notatka) => {
    const li = document.createElement('li');
    li.textContent = notatka;
    notatkiLista.appendChild(li);
  });
}

function dopasujWidokDoObiektu(obiekt) {
  const box = new THREE.Box3().setFromObject(obiekt);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= 1.7;

  camera.position.set(center.x + distance, center.y + distance * 0.55, center.z + distance);
  controls.target.copy(center);
  controls.update();

  initialCameraPosition = camera.position.clone();
  initialTarget = center.clone();
}

async function wczytajModel(path) {
  statusEl.textContent = 'Ładowanie modelu GLB...';

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  loader.setDRACOLoader(dracoLoader);

  try {
    const gltf = await loader.loadAsync(path);
    modelRoot = gltf.scene;
    scene.add(modelRoot);
    dopasujWidokDoObiektu(modelRoot);
    statusEl.textContent = 'Model załadowany poprawnie';
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Nie udało się załadować modelu';

    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.6, 3),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })
    );
    placeholder.position.y = 1.3;
    modelRoot = placeholder;
    scene.add(placeholder);
    dopasujWidokDoObiektu(placeholder);
  }
}

resetBtn.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
});

fitBtn.addEventListener('click', () => {
  if (modelRoot) dopasujWidokDoObiektu(modelRoot);
});

window.addEventListener('resize', ustawRozmiar);

function animuj() {
  requestAnimationFrame(animuj);
  controls.update();
  renderer.render(scene, camera);
}

async function start() {
  ustawRozmiar();
  const response = await fetch('./dane/obiekt.json');
  const dane = await response.json();
  wypelnijPanel(dane);
  await wczytajModel(dane.model3d);
  animuj();
}

start().catch((error) => {
  console.error(error);
  statusEl.textContent = 'Błąd uruchamiania strony';
});
