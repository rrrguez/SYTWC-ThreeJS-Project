// script.js
let scene, camera, renderer, raycaster, selectedObject;
const mouse = new THREE.Vector2();

// Crear escena
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luz
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz general suave
    scene.add(ambientLight);

    // Cámara inicial
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Crear objetos aleatorios
    createRandomScene();

    // Eventos
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    document.getElementById('new-scene-btn').addEventListener('click', createRandomScene);
    animate();
}

// Crear geometrías aleatorias
function createRandomScene() {
    // Limpiar escena actual
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    const geometries = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(),
        new THREE.ConeGeometry(),
        new THREE.CylinderGeometry()
    ];

    for (let i = 0; i < 5; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);
        scene.add(mesh);
    }

    console.log(scene.children);

}

// Detectar movimiento del ratón
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Detectar clic
function onClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        showObjectInfo(selectedObject);
    }
}

// Mostrar información del objeto
function showObjectInfo(object) {
    const geometry = object.geometry;
    document.getElementById('object-name').textContent = geometry.type;
    document.getElementById('object-faces').textContent = geometry.index ? geometry.index.count / 3 : '-';
    document.getElementById('object-regular').textContent = geometry.parameters ? 'Sí' : 'No';
    document.getElementById('download-btn').disabled = false;
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(obj => obj.rotation.y += 0.01); // Animar rotación
    renderer.render(scene, camera);
}

init();
