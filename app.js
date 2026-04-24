const viewerPlaceholder = document.getElementById('viewerPlaceholder');

viewerPlaceholder.addEventListener('click', () => {
  viewerPlaceholder.classList.toggle('active');

  const badge = viewerPlaceholder.querySelector('.placeholder-badge');
  const text = viewerPlaceholder.querySelector('p');

  if (viewerPlaceholder.classList.contains('active')) {
    badge.textContent = 'TRYB AKTYWNY';
    text.textContent = 'Miejsce podłączone. Tu można osadzić model GLB / GLTF / Three.js.';
  } else {
    badge.textContent = 'MIEJSCE NA MODEL 3D';
    text.textContent = 'Tu będzie osadzony model budynku lub instalacji.';
  }
});
