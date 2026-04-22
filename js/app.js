// import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

// const viewer = document.getElementById('viewer3d');
// const statusEl = document.getElementById('statusModelu');
// const resetBtn = document.getElementById('resetKameryBtn');
// const fitBtn = document.getElementById('pokazCalyModelBtn');

// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x0b1220);

// const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
// camera.position.set(6, 5, 8);

// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.setSize(100, 100);
// viewer.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.target.set(0, 1, 0);

// scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.2));

// const dir = new THREE.DirectionalLight(0xffffff, 1.5);
// dir.position.set(8, 14, 10);
// scene.add(dir);

// const grid = new THREE.GridHelper(40, 40, 0x475569, 0x1e293b);
// grid.position.y = -0.001;
// scene.add(grid);

// scene.add(new THREE.AxesHelper(2));

// let modelRoot = null;
// let initialCameraPosition = new THREE.Vector3(6, 5, 8);
// let initialTarget = new THREE.Vector3(0, 1, 0);

// function ustawRozmiar() {
//   const width = viewer.clientWidth || 800;
//   const height = viewer.clientHeight || 600;
//   camera.aspect = width / height;
//   camera.updateProjectionMatrix();
//   renderer.setSize(width, height);
// }

// function ustawListeDanych(containerId, dane) {
//   const container = document.getElementById(containerId);
//   container.innerHTML = '';

//   Object.entries(dane).forEach(([klucz, wartosc]) => {
//     const dt = document.createElement('dt');
//     dt.textContent = klucz;

//     const dd = document.createElement('dd');
//     dd.textContent = wartosc;

//     container.appendChild(dt);
//     container.appendChild(dd);
//   });
// }

// function wypelnijPanel() {
//   document.getElementById('nazwaObiektu').textContent = 'Willa Parkowa 10';
//   document.getElementById('opisObiektu').textContent =
//     'Demo obiektu: budynek jako pierwszy poziom systemu serwisowego 3D.';

//   ustawListeDanych('danePodstawowe', {
//     'Typ': 'Budynek',
//     'Adres': 'Willa Parkowa 10',
//     'Status': 'Aktywny'
//   });

//   ustawListeDanych('daneKontaktowe', {
//     'Kontakt': 'Serwis główny',
//     'Telefon': '+47 000 00 000',
//     'Email': 'serwis@demo.no'
//   });

//   ustawListeDanych('daneDostepu', {
//     'Kod drzwi': '1234',
//     'Wejście': 'Główne',
//     'Uwagi': 'Dostęp po zgłoszeniu'
//   });

//   const notatkiLista = document.getElementById('notatkiLista');
//   notatkiLista.innerHTML = '';

//   [
//     'To jest etap 1: sam budynek i informacje.',
//     'Następny etap: dodać agregat jako osobny model.',
//     'Potem: połączenie budynek → agregat → komponenty.'
//   ].forEach((tekst) => {
//     const li = document.createElement('li');
//     li.textContent = tekst;
//     notatkiLista.appendChild(li);
//   });
// }

// function dopasujWidokDoObiektu(obiekt) {
//   const box = new THREE.Box3().setFromObject(obiekt);
//   const size = box.getSize(new THREE.Vector3());
//   const center = box.getCenter(new THREE.Vector3());

//   const maxDim = Math.max(size.x, size.y, size.z) || 1;
//   const fov = camera.fov * (Math.PI / 180);
//   let distance = maxDim / (2 * Math.tan(fov / 2));
//   distance *= 1.7;

//   camera.position.set(center.x + distance, center.y + distance * 0.55, center.z + distance);
//   controls.target.copy(center);
//   controls.update();

//   initialCameraPosition = camera.position.clone();
//   initialTarget = center.clone();
// }

// function pokazModelTestowy() {
//   const grupa = new THREE.Group();

//   const bryla = new THREE.Mesh(
//     new THREE.BoxGeometry(6, 3, 4),
//     new THREE.MeshStandardMaterial({
//       color: 0x64748b,
//       roughness: 0.8,
//       metalness: 0.1
//     })
//   );
//   bryla.position.y = 1.5;
//   grupa.add(bryla);

//   const dach = new THREE.Mesh(
//     new THREE.ConeGeometry(4.8, 1.8, 4),
//     new THREE.MeshStandardMaterial({
//       color: 0x92400e,
//       roughness: 0.9
//     })
//   );
//   dach.position.y = 3.9;
//   dach.rotation.y = Math.PI / 4;
//   grupa.add(dach);

//   modelRoot = grupa;
//   scene.add(grupa);
//   dopasujWidokDoObiektu(grupa);
// }

// resetBtn.addEventListener('click', () => {
//   camera.position.copy(initialCameraPosition);
//   controls.target.copy(initialTarget);
//   controls.update();
// });

// fitBtn.addEventListener('click', () => {
//   if (modelRoot) dopasujWidokDoObiektu(modelRoot);
// });

// window.addEventListener('resize', ustawRozmiar);

// function animuj() {
//   requestAnimationFrame(animuj);
//   controls.update();
//   renderer.render(scene, camera);
// }

// function start() {
//   ustawRozmiar();
//   wypelnijPanel();
//   pokazModelTestowy();
//   statusEl.textContent = 'Model testowy załadowany poprawnie';
//   animuj();
// }

// start();


import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const viewer = document.getElementById('viewer3d');
const statusEl = document.getElementById('statusModelu');
const resetBtn = document.getElementById('resetKameryBtn');
const fitBtn = document.getElementById('pokazCalyModelBtn');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(8, 6, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.5, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.2));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 15, 10);
scene.add(dirLight);

const grid = new THREE.GridHelper(40, 40, 0x475569, 0x1e293b);
scene.add(grid);

let modelRoot = null;
let initialCameraPosition = new THREE.Vector3();
let initialTarget = new THREE.Vector3();

function ustawRozmiar() {
  const width = viewer.clientWidth || 800;
  const height = viewer.clientHeight || 600;
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
    dd.textContent = wartosc;

    container.appendChild(dt);
    container.appendChild(dd);
  });
}

function wypelnijPanel() {
  document.getElementById('nazwaObiektu').textContent = 'Willa Parkowa 10';
  document.getElementById('opisObiektu').textContent =
    'Etap 1: budynek jako obiekt główny z panelem informacji.';

  ustawListeDanych('danePodstawowe', {
    'Typ': 'Budynek',
    'Adres': 'Willa Parkowa 10',
    'Status': 'Aktywny'
  });

  ustawListeDanych('daneKontaktowe', {
    'Kontakt': 'Serwis główny',
    'Telefon': '+47 000 00 000',
    'Email': 'serwis@demo.no'
  });

  ustawListeDanych('daneDostepu', {
    'Kod drzwi': '1234',
    'Wejście': 'Główne',
    'Uwagi': 'Dostęp po zgłoszeniu'
  });

  const notatkiLista = document.getElementById('notatkiLista');
  notatkiLista.innerHTML = '';

  [
    'Pierwszy poziom systemu: budynek.',
    'Następny etap: osadzenie modelu agregatu.',
    'Potem: powiązanie budynku z komponentami wewnątrz.'
  ].forEach((tekst) => {
    const li = document.createElement('li');
    li.textContent = tekst;
    notatkiLista.appendChild(li);
  });
}

function dopasujWidokDoObiektu(obiekt) {
  const box = new THREE.Box3().setFromObject(obiekt);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= 1.8;

  camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
  controls.target.copy(center);
  controls.update();

  initialCameraPosition.copy(camera.position);
  initialTarget.copy(center);
}

function pokazModelTestowy() {
  const grupa = new THREE.Group();

  const korpus = new THREE.Mesh(
    new THREE.BoxGeometry(8, 3.5, 5),
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.1
    })
  );
  korpus.position.y = 1.75;
  grupa.add(korpus);

  const dach = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 2, 4),
    new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.9
    })
  );
  dach.position.y = 4.25;
  dach.rotation.y = Math.PI / 4;
  grupa.add(dach);

  const wejscie = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.2, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b
    })
  );
  wejscie.position.set(0, 1.1, 2.35);
  grupa.add(wejscie);

  modelRoot = grupa;
  scene.add(grupa);
  dopasujWidokDoObiektu(grupa);
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

function start() {
  ustawRozmiar();
  wypelnijPanel();
  pokazModelTestowy();
  statusEl.textContent = 'Model testowy załadowany poprawnie';
  animuj();
}

start();
