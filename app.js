import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const viewer = document.getElementById('viewer3d');
const statusEl = document.getElementById('statusModelu');

const resetWidokuBtn = document.getElementById('resetWidokuBtn');
const dopasujWidokBtn = document.getElementById('dopasujWidokBtn');
const widokPrzodBtn = document.getElementById('widokPrzodBtn');
const widokGoraBtn = document.getElementById('widokGoraBtn');
const widokPerspBtn = document.getElementById('widokPerspBtn');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8f1ff);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(18, 12, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 3, 0);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbfd4f6, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
dirLight.position.set(20, 25, 15);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight2.position.set(-12, 10, -8);
scene.add(dirLight2);

const grid = new THREE.GridHelper(60, 60, 0xb8c9ea, 0xd7e3f8);
scene.add(grid);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({
    color: 0xf4f8ff,
    roughness: 1
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

let obiektGlowny = null;
let initialCameraPosition = new THREE.Vector3();
let initialTarget = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function ustawRozmiar() {
  const width = viewer.clientWidth || 800;
  const height = viewer.clientHeight || 500;
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
    'To jest interaktywna przestrzeń przygotowana pod przyszły model GLB budynku. Na razie działa placeholder i sterowanie kamerą.';

  ustawListeDanych('danePodstawowe', {
    'Typ': 'Budynek',
    'Adres': 'Willa Parkowa 10',
    'Status': 'Aktywny'
  });

  ustawListeDanych('daneKontaktowe', {
    'Kontakt': 'Jan Kowalski',
    'Telefon': '+47 000 00 000',
    'Email': 'serwis@demo.no'
  });

  ustawListeDanych('daneDostepu', {
    'Kod drzwi': '1234',
    'Wejście': 'Główne',
    'Uprawnienia': 'Serwis + administrator'
  });

  const notatki = document.getElementById('notatkiLista');
  notatki.innerHTML = '';

  [
    'Miejsce na model GLB budynku.',
    'Kolejny krok: podpięcie prawdziwego modelu.',
    'Potem: wejście do wnętrza i przejście do agregatu.'
  ].forEach((tekst) => {
    const li = document.createElement('li');
    li.textContent = tekst;
    notatki.appendChild(li);
  });
}

function zapamietajWidok() {
  initialCameraPosition.copy(camera.position);
  initialTarget.copy(controls.target);
}

function dopasujWidokDoObiektu(obiekt) {
  const box = new THREE.Box3().setFromObject(obiekt);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= 2.0;

  camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
  controls.target.copy(center);
  controls.update();

  zapamietajWidok();
}

function stworzPlaceholderBudynku() {
  const grupa = new THREE.Group();

  const bryla = new THREE.Mesh(
    new THREE.BoxGeometry(12, 6, 8),
    new THREE.MeshStandardMaterial({
      color: 0x7f8ea6,
      roughness: 0.85,
      metalness: 0.08
    })
  );
  bryla.position.y = 3;
  bryla.name = 'Budynek';
  grupa.add(bryla);

  const dach = new THREE.Mesh(
    new THREE.BoxGeometry(12.4, 0.4, 8.4),
    new THREE.MeshStandardMaterial({
      color: 0xc8d4e8,
      roughness: 0.9
    })
  );
  dach.position.y = 6.2;
  grupa.add(dach);

  const wejscie = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x23324f
    })
  );
  wejscie.position.set(0, 1.5, 4.15);
  wejscie.name = 'Wejście';
  grupa.add(wejscie);

  const plac = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.1, 14),
    new THREE.MeshStandardMaterial({
      color: 0xd8e3f5,
      roughness: 1
    })
  );
  plac.position.y = 0.05;
  grupa.add(plac);

  obiektGlowny = grupa;
  scene.add(grupa);
  dopasujWidokDoObiektu(grupa);
}

function ustawWidokPrzod() {
  if (!obiektGlowny) return;
  const box = new THREE.Box3().setFromObject(obiektGlowny);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 1.8;

  camera.position.set(center.x, center.y + size.y * 0.25, center.z + distance);
  controls.target.copy(center);
  controls.update();
}

function ustawWidokGora() {
  if (!obiektGlowny) return;
  const box = new THREE.Box3().setFromObject(obiektGlowny);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 1.8;

  camera.position.set(center.x, center.y + distance, center.z);
  controls.target.copy(center);
  controls.update();
}

function ustawWidokPerspektywiczny() {
  if (!obiektGlowny) return;
  dopasujWidokDoObiektu(obiektGlowny);
}

function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const trafiony = intersects[0].object;
    statusEl.textContent = `Kliknięto element: ${trafiony.name || 'bez nazwy'}`;
  }
}

resetWidokuBtn.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
  statusEl.textContent = 'Widok zresetowany';
});

dopasujWidokBtn.addEventListener('click', () => {
  if (obiektGlowny) {
    dopasujWidokDoObiektu(obiektGlowny);
    statusEl.textContent = 'Dopasowano widok do obiektu';
  }
});

widokPrzodBtn.addEventListener('click', () => {
  ustawWidokPrzod();
  statusEl.textContent = 'Widok z przodu';
});

widokGoraBtn.addEventListener('click', () => {
  ustawWidokGora();
  statusEl.textContent = 'Widok z góry';
});

widokPerspBtn.addEventListener('click', () => {
  ustawWidokPerspektywiczny();
  statusEl.textContent = 'Widok perspektywiczny';
});

window.addEventListener('resize', ustawRozmiar);
viewer.addEventListener('click', onPointerClick);

function animuj() {
  requestAnimationFrame(animuj);
  controls.update();
  renderer.render(scene, camera);
}

function start() {
  ustawRozmiar();
  wypelnijPanel();
  stworzPlaceholderBudynku();
  statusEl.textContent = 'Interaktywna przestrzeń 3D gotowa';
  animuj();
}

start();
