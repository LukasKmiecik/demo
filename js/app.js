import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('viewer');
const lista = document.getElementById('lista-komponentow');
const detailName = document.getElementById('detail-name');
const detailType = document.getElementById('detail-type');
const detailDescription = document.getElementById('detail-description');
const detailInputs = document.getElementById('detail-inputs');
const detailOutputs = document.getElementById('detail-outputs');
const detailErrors = document.getElementById('detail-errors');
const detailLocation = document.getElementById('detail-location');

const state = {
  komponenty: [],
  selectedId: null,
  meshById: new Map(),
  itemById: new Map(),
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101927);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(6.5, 4.5, 7.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0.6, 0.4, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(4, 8, 6);
scene.add(dir);

const grid = new THREE.GridHelper(14, 14, 0x36527a, 0x23324d);
grid.position.y = -1.2;
scene.add(grid);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14),
  new THREE.MeshStandardMaterial({ color: 0x162234, metalness: 0.1, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.21;
scene.add(floor);

const room = new THREE.Mesh(
  new THREE.BoxGeometry(10, 5, 6),
  new THREE.MeshBasicMaterial({ color: 0x54719c, wireframe: true, transparent: true, opacity: 0.18 })
);
room.position.set(0.8, 1.2, 0);
scene.add(room);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function resize() {
  const wrap = canvas.parentElement;
  const width = wrap.clientWidth;
  const height = 620;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function makeMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.22 });
}

function addLabelLine(mesh, isSelected) {
  mesh.traverse((obj) => {
    if (obj.material?.emissive) {
      obj.material.emissive.setHex(isSelected ? 0x553300 : 0x000000);
      obj.material.emissiveIntensity = isSelected ? 0.9 : 0;
    }
  });
}

function renderList() {
  lista.innerHTML = '';
  state.komponenty.forEach((komp) => {
    const el = document.createElement('button');
    el.className = 'component-item';
    el.innerHTML = `<strong>${komp.nazwa}</strong><span class="type">${komp.typ}</span>`;
    el.addEventListener('click', () => selectComponent(komp.id));
    state.itemById.set(komp.id, el);
    lista.appendChild(el);
  });
}

function fillList(target, items, emptyText) {
  target.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.textContent = emptyText;
    target.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    target.appendChild(li);
  });
}

function updateDetails(komp) {
  detailName.textContent = komp.nazwa;
  detailType.textContent = komp.typ;
  detailDescription.textContent = komp.opis;
  detailLocation.textContent = komp.lokalizacja;
  fillList(detailInputs, komp.wejscia, 'Brak zdefiniowanych wejść');
  fillList(detailOutputs, komp.wyjscia, 'Brak zdefiniowanych wyjść');

  detailErrors.innerHTML = '';
  if (!komp.bledy || komp.bledy.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<span class="status-dot"></span>Brak aktywnych błędów';
    detailErrors.appendChild(li);
  } else {
    komp.bledy.forEach((err) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="status-dot error"></span>${err}`;
      detailErrors.appendChild(li);
    });
  }
}

function selectComponent(id) {
  state.selectedId = id;
  const komp = state.komponenty.find((item) => item.id === id);
  if (!komp) return;

  state.itemById.forEach((el, key) => el.classList.toggle('active', key === id));
  state.meshById.forEach((mesh, key) => addLabelLine(mesh, key === id));
  updateDetails(komp);
}

function createMesh(komp) {
  const [sx, sy, sz] = komp.rozmiar;
  let geometry;

  switch (komp.typ) {
    case 'Wentylator':
      geometry = new THREE.CylinderGeometry(sx / 2, sx / 2, sz, 32);
      break;
    case 'Silnik':
      geometry = new THREE.CylinderGeometry(sx / 2, sx / 2, sz, 24);
      break;
    case 'PasekKlinowy':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    case 'FiltrPowietrza':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    case 'Przepustnica':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    case 'SilownikPrzepustnicyBelimo':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    case 'CzujnikTemperatury':
      geometry = new THREE.CylinderGeometry(sx / 2, sx / 2, sz, 18);
      break;
    case 'Sterownik':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    default:
      geometry = new THREE.BoxGeometry(sx, sy, sz);
  }

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, makeMaterial(komp.kolor));
  group.add(mesh);

  if (komp.typ === 'SilownikPrzepustnicyBelimo') {
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.48, 18),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.3, metalness: 0.8 })
    );
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, 0.16, 0);
    group.add(axle);
  }

  if (komp.typ === 'Przepustnica') {
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xa7b6c8, roughness: 0.35, metalness: 0.7 })
    );
    axle.rotation.z = Math.PI / 2;
    group.add(axle);
  }

  group.position.set(...komp.pozycja);
  group.userData.componentId = komp.id;
  state.meshById.set(komp.id, group);
  scene.add(group);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function handlePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects([...state.meshById.values()], true);
  if (intersects.length > 0) {
    let node = intersects[0].object;
    while (node && !node.userData.componentId) node = node.parent;
    if (node?.userData?.componentId) selectComponent(node.userData.componentId);
  }
}

canvas.addEventListener('click', handlePointer);

document.querySelector('[data-action="reset-view"]').addEventListener('click', () => {
  camera.position.set(6.5, 4.5, 7.5);
  controls.target.set(0.6, 0.4, 0);
});

document.querySelector('[data-action="simulate-error"]').addEventListener('click', () => {
  const actuator = state.komponenty.find((item) => item.id === 'actuator-01');
  if (!actuator) return;
  actuator.bledy = ['brak zasilania', 'blokada mechaniczna'];
  selectComponent(actuator.id);
});

document.querySelector('[data-action="clear-error"]').addEventListener('click', () => {
  const actuator = state.komponenty.find((item) => item.id === 'actuator-01');
  if (!actuator) return;
  actuator.bledy = [];
  selectComponent(actuator.id);
});

async function init() {
  resize();
  const res = await fetch('./dane/komponenty-demo.json');
  const data = await res.json();
  state.komponenty = data.komponenty;
  renderList();
  state.komponenty.forEach(createMesh);
  selectComponent('actuator-01');
  animate();
}

init().catch((err) => {
  console.error(err);
  detailDescription.textContent = 'Nie udało się wczytać danych demo.';
});
