/* ============================================================
   3d.js — Three.js 3D viewer
   «3D тарихи реконструкция» — болжамды көрініс (факт емес!).
   static/models/mashyryq.glb болса — оны жүктейді,
   болмаса — процедуралық placeholder модель құрады.
   CDN жүктелмесе (интернетсіз) fallback хабарлама көрсетіледі.
   ============================================================ */
(function () {
  'use strict';
  const container = document.getElementById('viewer3d');
  const fallback = document.getElementById('viewerFallback');
  const statusChip = document.getElementById('modelStatus');
  if (!container) return;

  if (typeof THREE === 'undefined') {
    container.style.display = 'none';
    if (fallback) fallback.hidden = false;
    return;
  }

  /* ---------- Сцена ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1526);
  scene.fog = new THREE.Fog(0x0b1526, 40, 120);

  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 500);
  const HOME_POS = new THREE.Vector3(16, 12, 20);
  camera.position.copy(HOME_POS);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 3, 0);
  controls.maxPolarAngle = Math.PI / 2.05;

  /* ---------- Жарық ---------- */
  scene.add(new THREE.AmbientLight(0x8fa3c0, 0.55));
  const sun = new THREE.DirectionalLight(0xffe0a3, 1.1);
  sun.position.set(18, 26, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x6f86b8, 0.4);
  rim.position.set(-14, 10, -16);
  scene.add(rim);

  /* ---------- Жер (құм) ---------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: 0x8a6f45, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(new THREE.GridHelper(120, 60, 0x2a3d5c, 0x1a2a44));

  /* ---------- Материалдар ---------- */
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xcdb284, roughness: 0.9 });   // құмтас
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x8a6f45, roughness: 0.95 });
  const domeMat  = new THREE.MeshStandardMaterial({ color: 0x3e6f8e, roughness: 0.45, metalness: 0.15 }); // көк күмбез
  const goldMat  = new THREE.MeshStandardMaterial({ color: 0xd9b36c, roughness: 0.3, metalness: 0.6 });

  const placeholder = new THREE.Group();
  placeholder.name = 'placeholder-model';

  function box(w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || stoneMat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    placeholder.add(m);
    return m;
  }

  // Негізгі зал (мешіт/медресе корпусы)
  box(10, 5, 8, 0, 2.5, 0);
  // Орталық күмбез
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.set(0, 5, 0);
  dome.castShadow = true;
  placeholder.add(dome);
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.8, 24), stoneMat);
  domeBase.position.set(0, 5, 0);
  placeholder.add(domeBase);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), goldMat);
  finial.position.set(0, 7.9, 0);
  placeholder.add(finial);

  // Кіреберіс порталы (пештак)
  box(4.2, 6.5, 1.6, 0, 3.25, 4.6, stoneMat);
  box(2.2, 3.6, 0.4, 0, 1.8, 5.45, darkMat); // есік саңылауы

  // Екі мұнара
  [-6.2, 6.2].forEach(x => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 9, 16), stoneMat);
    tower.position.set(x, 4.5, 4.2);
    tower.castShadow = true;
    placeholder.add(tower);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1, 1.6, 16), domeMat);
    cap.position.set(x, 9.8, 4.2);
    placeholder.add(cap);
  });

  // Аула қабырғалары
  box(16, 2, 0.6, 0, 1, -6, darkMat);
  box(0.6, 2, 14, -8, 1, 0.5, darkMat);
  box(0.6, 2, 14, 8, 1, 0.5, darkMat);

  // Ауладағы құдық (Машырық қажы құдығы — ауызша дерек)
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 1, 14, 1, true), darkMat);
  well.position.set(-4.5, 0.5, -2);
  placeholder.add(well);
  const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 4), darkMat);
  wellRoof.position.set(-4.5, 2.2, -2);
  wellRoof.rotation.y = Math.PI / 4;
  placeholder.add(wellRoof);
  [-5.2, -3.8].forEach(x => box(0.15, 1.6, 0.15, x, 0.8, -2, darkMat));

  // Бақ (шартты ағаштар)
  [[5, -3.5], [6.3, -1.5], [4.6, -0.5]].forEach(([x, z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 8), darkMat);
    trunk.position.set(x, 0.7, z);
    placeholder.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x4d6b3a, roughness: 1 }));
    crown.position.set(x, 1.8, z);
    crown.castShadow = true;
    placeholder.add(crown);
  });

  scene.add(placeholder);

  /* ---------- GLB модельді талпынып жүктеу ---------- */
  // static/models/mashyryq.glb бар болса — placeholder орнына сол модель көрсетіледі
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      '/static/models/mashyryq.glb',
      gltf => {
        scene.remove(placeholder);
        const model = gltf.scene;
        // Модельді сахнаға бейімдеу
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const scale = 10 / Math.max(size.x, size.y, size.z, 0.001);
        model.scale.setScalar(scale);
        const bbox2 = new THREE.Box3().setFromObject(model);
        const center = bbox2.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y = -bbox2.min.y;
        model.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        scene.add(model);
        if (statusChip) statusChip.textContent = 'Нақты модель жүктелді: static/models/mashyryq.glb';
      },
      undefined,
      () => { /* GLB жоқ — placeholder қалады */ }
    );
  }

  /* ---------- Басқару батырмалары ---------- */
  let autoRotate = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  const btnRotate = document.getElementById('btnRotate');
  const btnReset = document.getElementById('btnReset');
  const btnWire = document.getElementById('btnWire');
  const btnFull = document.getElementById('btnFull');
  const frame = container.parentElement;

  if (btnRotate) btnRotate.addEventListener('click', () => {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    btnRotate.textContent = autoRotate ? '⟳ Айналдыру: қосулы' : '⟳ Айналдыру: өшірулі';
  });
  if (btnRotate) btnRotate.textContent = '⟳ Айналдыру: қосулы';
  if (btnReset) btnReset.addEventListener('click', () => {
    camera.position.copy(HOME_POS);
    controls.target.set(0, 3, 0);
    controls.update();
  });
  let wire = false;
  if (btnWire) btnWire.addEventListener('click', () => {
    wire = !wire;
    scene.traverse(o => { if (o.isMesh) o.material.wireframe = wire; });
  });
  if (btnFull) btnFull.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame);
    } else {
      document.exitFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', () => onResize());

  /* ---------- Resize ---------- */
  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  /* ---------- Цикл ---------- */
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
})();
