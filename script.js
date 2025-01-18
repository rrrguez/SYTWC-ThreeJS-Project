// Configuración básica de ThreeJS
// Creación de la escena y el fondo
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Creación de la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

// Se inicializa el renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controles de órbita para poder mover la cámara alrededor de la escena
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Creación del suelo con un color suave
const planeGeometry = new THREE.PlaneGeometry(18, 18);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true; // El suelo recibirá la sombra de los objetos
plane.background = "#ffffff";
scene.add(plane); // Se añade el suelo a la escena

// Luz direccional con sombras
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
scene.add(light); // Se añade la luz a la escena

// Luz de ambiente para que no se vea tan oscura la sombra
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Array de objetos aleatorios
const objects = [];

// Función para crear objetos aleatorios en la escena (máximo 5)
function createRandomObjects() {
    const maxAttempts = 50; // Máximo de intentos para encontrar una posición válida
    const minDistance = 5; // Distancia mínima permitida entre objetos
    const maxSize = 3; // Tamaño máximo de los objetos
    const minSize = 1; // Tamaño mínimo de los objetos

    for (let i = 0; i < 5; i++) {
    let validPosition = false;
    let attempts = 0;
    const figHeight = Math.random() * (maxSize - minSize) + minSize;

    while (!validPosition && attempts < maxAttempts) {
        attempts++;

        // Se genera una posición aleatoria
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;

        // Se comprueba si hay suficiente distancia con los objetos existentes para que no se superpongan
        validPosition = objects.every(obj => {
            const dx = obj.position.x - x;
            const dz = obj.position.z - z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance >= minDistance;
        });

        // Array de las posibles figuras geométricas que se van a generar
        // Cada una de las figuras tendrá unas dimensiones aleatorias dentro de unos límites establecidos
        const geometries = [
            {
            type: 'sphere',
            create: () => {
                const radius = Math.random() * (2 - 0.5) + minSize;
                return new THREE.SphereGeometry(radius);
            }
            },
            {
            type: 'box',
            create: () => {
                const width = Math.random() * (maxSize - minSize) + minSize;
                const height = Math.random() * (maxSize - minSize) + minSize;
                const depth = Math.random() * (maxSize - minSize) + minSize;
                return new THREE.BoxGeometry(width, height, depth);
            }
            },
            {
            type: 'cone',
            create: () => {
                const radius = Math.random() * (figHeight - minSize) + minSize;
                const height = figHeight;
                return new THREE.ConeGeometry(radius, height);
            }
            },
            {
            type: 'cylinder',
            create: () => {
                const radius = Math.random() * (figHeight - minSize) + minSize;
                const height = figHeight
                return new THREE.CylinderGeometry(radius, radius, height);
            }
            }
        ];

        if (validPosition) {
            // Se crea el objeto si la posición es válida
            // Se escoge un objeto aleatorio del array geometries
            const geometryData = geometries[Math.floor(Math.random() * geometries.length)];
            const geometry = geometryData.create();
            const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);

            // Se calcula la altura a la que el objeto está del suelo en función de su forma
            let objectHeight;
            if (geometry.type === "SphereGeometry") {
                objectHeight = geometry.parameters.radius*2; // Las esferas no tienen parámetro height

            } else {
                objectHeight = geometry.parameters.height; // Para conos y cilindros, la altura también es un parámetro
            }

            // Se coloca el objeto de manera que su base esté pegada al suelo
            mesh.position.set(x, objectHeight / 2, z);

            // El objeto emitirá y recibirá sombra de otros objetos
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Se aáde el objeto al array de objetos y a la escena
            objects.push(mesh);
            scene.add(mesh);
        }
    }

    // Si no se encuentra una posición válida después de varios intentos, se omite este objeto.
    if (attempts === maxAttempts) {
      console.warn(`Unable to locate figure ${i + 1} after ${maxAttempts} tries.`);
    }
  }
}

// Se llama a la función para crear objetos aleatorios
createRandomObjects();

// Raycaster para selección de objetos haciendo clic con el ratón
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

// Función para mostrar información de un objeto por pantalla si se le hace clic
function displayObjectInfo(object) {
    const infoPanel = document.getElementById('objectInfo');

    infoPanel.innerText = "";

    if (object.geometry.type === "BoxGeometry") {
        // Se obtienen las dimensiones y se calcula el volumen
        const { width, height, depth } = object.geometry.parameters;
        const volume = width * depth * height; // Volumen del cuadrilátero

        // Se imprime información sobre la figura
        infoPanel.innerText += `Geometric figure: Rectangular prism\nColor: #${object.material.color.getHexString()}\n`;
        infoPanel.innerText += `Dimensions: ${width.toFixed(2)}cm × ${height.toFixed(2)}cm × ${depth.toFixed(2)}cm\n`;
        infoPanel.innerText += `Volume: ${volume.toFixed(2)}cm³`;

    } else if (object.geometry.type === "ConeGeometry") {
        const { radius, height } = object.geometry.parameters;
        const volume = (1 / 3) * Math.PI * Math.pow(radius, 2) * height; // Volumen del cono

        infoPanel.innerText += `Geometric figure: Cone\nColor: #${object.material.color.getHexString()}\n`;
        infoPanel.innerText += `Base radius: ${radius.toFixed(2)}cm\nHeight: ${height.toFixed(2)}cm\n`;
        infoPanel.innerText += `Volume: ${volume.toFixed(2)}cm³`;

    } else if (object.geometry.type === "CylinderGeometry") {
        const { radiusTop, radiusBottom, height } = object.geometry.parameters;
        const volume = Math.PI * Math.pow(radiusTop, 2) * height; // Volumen del cono

        infoPanel.innerText += `Geometric figure: Cylinder\nColor: #${object.material.color.getHexString()}\n`;
        infoPanel.innerText += `Radius: ${radiusTop.toFixed(2)}cm\nHeight: ${height.toFixed(2)}cm\n`;
        infoPanel.innerText += `Volume: ${volume.toFixed(2)}cm³`;

    } else if (object.geometry.type === "SphereGeometry") {
        const { radius, height } = object.geometry.parameters;
        const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // Volumen de la esfera

        infoPanel.innerText += `Geometric figure: Sphere\nColor: #${object.material.color.getHexString()}\n`;
        infoPanel.innerText += `Radius: ${radius.toFixed(2)}cm\n`;
        infoPanel.innerText += `Volume: ${volume.toFixed(2)}cm³`;
    }

    // Se habilita el botón para descargar la figura
    document.getElementById('downloadButton').disabled = false;
}

// Map para almacenar los objetos que están saltando y su estado
const jumpingObjects = new Map();

function toggleJump(object) {
    // Si el objeto no está saltando ya, se añade al map anterior
    if (!jumpingObjects.has(object)) {
        // Si no está saltando, iniciar el salto
        jumpingObjects.set(object, { velocity: 0.2, height: 0, isFalling: false });
    }
}

// Función para la animación del salto
function animateJumpingObjects(deltaTime) {
    const gravity = 0.98; // Gravedad para los saltos
    const damping = 0.65;  // Amortiguación para reducir el rebote

    jumpingObjects.forEach((state, object) => {
        // Se crea un boundingBox para evitar que el objeto atraviese el suelo al saltar
        if (!object.geometry.boundingBox) {
            object.geometry.computeBoundingBox();
        }

        // Se calcula la altura basada en el boundingBox
        const boxHeight = object.geometry.boundingBox.max.y - object.geometry.boundingBox.min.y;
        baseHeight = boxHeight / 2;

        if (!state.isFalling) {
            // Si el objeto no está en estado "cayendo", se eleva
            state.velocity -= gravity * deltaTime;
            state.height += state.velocity;

            if (state.velocity <= 0) {
                // Se establece que el objeto está cayendo
                state.isFalling = true;
            }
        } else {
            // Si el objeto está en estado "cayendo", se baja
            state.velocity += gravity * deltaTime;
            state.height -= state.velocity;

            if (state.height <= 0) {
                // Si el objeto toca el suelo
                state.height = 0; // Asegura que el objeto no atraviese el suelo

                if (state.velocity > 0.1) {
                    // Se rebota si la velocidad es alta
                    state.velocity *= -damping; // Invierte y reduce la velocidad
                } else {
                    // Detener el salto si el rebote es muy pequeño borrando el objeto del array de objetos saltando
                    jumpingObjects.delete(object);
                }
            }
        }

        // Se actualiza la posición vertical del objeto
        object.position.y = baseHeight + state.height;
    });
}

// Manejador de clics para mostrar info del objeto y hacerlo saltar
function onMouseClick(event) {
    // Posición del ratón para comprobar si se hizo clic sobre un objeto
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects); // Objetos intersectados por el "rayo" del ratón

    // Si se ha intersectado alguno, se marca como seleccionado el que está delante y se le pone a saltar
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        selectedObject = intersects[0].object;

        // Se pone el objeto a saltar y se muestra su info
        toggleJump(clickedObject);
        displayObjectInfo(clickedObject);
    }
}

// Esto es para poder descargar el objeto seleccionado por el usuario en formato GLB
const exporter = new THREE.GLTFExporter();
document.getElementById('downloadButton').addEventListener('click', () => {
    // Si hay un objeto seleccionado...
    if (selectedObject) {
        // Se usa GLTFExporter para exportar el objeto seleccionado
        exporter.parse(selectedObject, (gltf) => {
            const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'figure.glb';  // Nombre de archivo predeterminado para la descarga
            link.click(); // Simula un clic en enlace para iniciar la descarga del objeto
        }, { binary: true }); // Establecemos 'binary' como 'true' para la exportación en formato GLB

    // Esto es opcional porque el botón no está habilitado si no hay objeto seleccionado
    } else {
        console.log("No hay objeto seleccionado para descargar.");
    }
});

// Esto es para generar una nueva escena
document.getElementById('newSceneButton').addEventListener('click', () => {
    // Se eliminan los objetos existentes
    objects.forEach(obj => scene.remove(obj));
    objects.length = 0; // Se limpia el array de objetos

    // Se limpia el panel de info del objeto seleccionado
    document.getElementById('objectInfo').innerText = "";
    document.getElementById('downloadButton').disabled = true;

    // Se llama a la función para crear nuevos objetos
    createRandomObjects();
});

// Función de animación principal
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Tiempo en segundos
    lastTime = currentTime;

    // Se habilitan que los objetos salten
    animateJumpingObjects(deltaTime);

    controls.update();
    renderer.render(scene, camera);
}

// Llamada a la función animate para comenzar
animate();

// Se habilita el event listener para clics del ratón
window.addEventListener('click', onMouseClick);
