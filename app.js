import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
  new THREE.MeshStandardMaterial({ color: 0xf4f8ff, roughness: 1 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();

let initialCameraPosition = new THREE.Vector3();
let initialTarget = new THREE.Vector3();

const obiektySceny = [];
const mapaObiektow = new Map();
let wybranyObiektId = null;

function ustawRozmiar() {
  const width = viewer.clientWidth || 800;
  const height = viewer.clientHeight || 500;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function ustawListeDanych(containerId, dane = {}) {
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

function ustawDokumentacje(listaDokumentow = []) {
  let sekcja = document.getElementById('sekcjaDokumentacji');

  if (!sekcja) {
    sekcja = document.createElement('section');
    sekcja.className = 'karta';
    sekcja.id = 'sekcjaDokumentacji';
    sekcja.innerHTML = '<h3>Dokumentacja</h3><ul id="listaDokumentacji" class="lista-notatek"></ul>';
    document.querySelector('.panel-prawy').appendChild(sekcja);
  }

  const lista = document.getElementById('listaDokumentacji');
  lista.innerHTML = '';

  listaDokumentow.forEach((dok) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = dok.plik;
    a.textContent = dok.nazwa;
    a.target = '_blank';
    li.appendChild(a);
    lista.appendChild(li);
  });
}

function wypelnijPanel(obiekt) {
  document.getElementById('nazwaObiektu').textContent = obiekt.nazwa || 'Obiekt';
  document.getElementById('opisObiektu').textContent = obiekt.opis || '';

  ustawListeDanych('danePodstawowe', obiekt.danePodstawowe || {});
  ustawListeDanych('daneKontaktowe', obiekt.daneKontaktowe || {});
  ustawListeDanych('daneDostepu', obiekt.daneDostepu || {});

  const notatki = document.getElementById('notatkiLista');
  notatki.innerHTML = '';

  (obiekt.notatki || []).forEach((tekst) => {
    const li = document.createElement('li');
    li.textContent = tekst;
    notatki.appendChild(li);
  });

  ustawDokumentacje(obiekt.dokumentacja || []);
}

function zapamietajWidok() {
  initialCameraPosition.copy(camera.position);
  initialTarget.copy(controls.target);
}

function dopasujWidokDoObiektu(obiekt3d) {
  const box = new THREE.Box3().setFromObject(obiekt3d);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= 2.0;

  camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
  controls.target.copy(center);
  controls.update();
}

function ustawPrzezroczystoscDlaModelu(model, opacity) {
  model.traverse((child) => {
    if (child.isMesh) {
      if (!child.userData.materialOriginal) {
        child.userData.materialOriginal = child.material;
      }

      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.transparent = opacity < 1;
          mat.opacity = opacity;
        });
      } else if (child.material) {
        child.material.transparent = opacity < 1;
        child.material.opacity = opacity;
      }
    }
  });
}

function wyciszReszteSceny(wybranyId) {
  obiektySceny.forEach((ob) => {
    if (!ob.model) return;

    if (ob.id === wybranyId) {
      ustawPrzezroczystoscDlaModelu(ob.model, 1);
    } else {
      ustawPrzezroczystoscDlaModelu(ob.model, 0.15);
    }
  });
}

function przywrocWidocznoscWszystkich() {
  obiektySceny.forEach((ob) => {
    if (ob.model) ustawPrzezroczystoscDlaModelu(ob.model, 1);
  });
}

function zaznaczObiekt(id) {
  const obiekt = mapaObiektow.get(id);
  if (!obiekt || !obiekt.model) return;

  wybranyObiektId = id;
  wypelnijPanel(obiekt);
  dopasujWidokDoObiektu(obiekt.model);
  wyciszReszteSceny(id);
  statusEl.textContent = `Wybrano obiekt: ${obiekt.nazwa}`;
}

function stworzPlaceholder(obiekt) {
  const grupa = new THREE.Group();

  const bryla = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 3),
    new THREE.MeshStandardMaterial({
      color: obiekt.typ === 'budynek' ? 0x7f8ea6 : 0x5b8def,
      roughness: 0.85,
      metalness: 0.08
    })
  );
  bryla.position.y = 1.5;
  bryla.name = obiekt.nazwa;
  grupa.add(bryla);

  grupa.position.set(...(obiekt.pozycja || [0, 0, 0]));
  grupa.rotation.set(...(obiekt.rotacja || [0, 0, 0]));
  grupa.scale.set(...(obiekt.skala || [1, 1, 1]));

  grupa.userData.obiektId = obiekt.id;
  scene.add(grupa);

  obiekt.model = grupa;
  obiektySceny.push(obiekt);
  mapaObiektow.set(obiekt.id, obiekt);
}

async function wczytajModelObiektu(obiekt) {
  try {
    const gltf = await loader.loadAsync(obiekt.model3d);
    const model = gltf.scene;

    model.position.set(...(obiekt.pozycja || [0, 0, 0]));
    model.rotation.set(...(obiekt.rotacja || [0, 0, 0]));
    model.scale.set(...(obiekt.skala || [1, 1, 1]));

    model.traverse((child) => {
      if (child.isMesh) {
        child.userData.obiektId = obiekt.id;
        child.name = child.name || obiekt.nazwa;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    model.userData.obiektId = obiekt.id;
    scene.add(model);

    obiekt.model = model;
    obiektySceny.push(obiekt);
    mapaObiektow.set(obiekt.id, obiekt);
  } catch (err) {
    console.warn(`Nie udało się wczytać modelu ${obiekt.nazwa}, tworzę placeholder`, err);
    stworzPlaceholder(obiekt);
  }
}

async function wczytajObiekty() {
  const response = await fetch('./dane/obiekty.json');
  const dane = await response.json();

  for (const obiekt of dane.obiekty) {
    await wczytajModelObiektu(obiekt);
  }

  if (obiektySceny.length > 0) {
    zapamietajWidok();
    zaznaczObiekt(obiektySceny[0].id);
  }
}

function ustawWidokPrzod() {
  if (!wybranyObiektId) return;
  const obiekt = mapaObiektow.get(wybranyObiektId);
  if (!obiekt?.model) return;

  const box = new THREE.Box3().setFromObject(obiekt.model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 1.8;

  camera.position.set(center.x, center.y + size.y * 0.25, center.z + distance);
  controls.target.copy(center);
  controls.update();
}

function ustawWidokGora() {
  if (!wybranyObiektId) return;
  const obiekt = mapaObiektow.get(wybranyObiektId);
  if (!obiekt?.model) return;

  const box = new THREE.Box3().setFromObject(obiekt.model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 1.8;

  camera.position.set(center.x, center.y + distance, center.z);
  controls.target.copy(center);
  controls.update();
}

function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (!intersects.length) return;

  let clicked = intersects[0].object;

  while (clicked && !clicked.userData.obiektId && clicked.parent) {
    clicked = clicked.parent;
  }

  if (clicked?.userData?.obiektId) {
    zaznaczObiekt(clicked.userData.obiektId);
  }
}

resetWidokuBtn.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
  przywrocWidocznoscWszystkich();
  statusEl.textContent = 'Widok zresetowany';
});

dopasujWidokBtn.addEventListener('click', () => {
  if (wybranyObiektId) {
    const obiekt = mapaObiektow.get(wybranyObiektId);
    if (obiekt?.model) {
      dopasujWidokDoObiektu(obiekt.model);
      statusEl.textContent = 'Dopasowano widok do wybranego obiektu';
    }
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
  if (wybranyObiektId) {
    const obiekt = mapaObiektow.get(wybranyObiektId);
    if (obiekt?.model) dopasujWidokDoObiektu(obiekt.model);
  }
  statusEl.textContent = 'Widok perspektywiczny';
});

window.addEventListener('resize', ustawRozmiar);
viewer.addEventListener('click', onPointerClick);

function animuj() {
  requestAnimationFrame(animuj);
  controls.update();
  renderer.render(scene, camera);
}

async function start() {
  ustawRozmiar();
  statusEl.textContent = 'Ładowanie obiektów 3D...';
  await wczytajObiekty();
  animuj();
}

start().catch((err) => {
  console.error(err);
  statusEl.textContent = 'Błąd ładowania sceny';
});
