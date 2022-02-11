import { AnimationMixer } from 'three';
import { SkinnedMesh } from 'three';
import {
	DirectionalLight,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

let camera, scene, renderer, controls, mixer;

class App {

	async init() {

		camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
		camera.position.z = 2;

		scene = new Scene();

		const light = new DirectionalLight(0xffffff, 4.0);
		light.position.set(0, 0, 1);
		scene.add(light);

		const light2 = new DirectionalLight(0xffffff, 2.0);
		light2.position.set(0, 1, 0);
		scene.add(light2);

		const loader = new GLTFLoader();
		const gltf = await loader.loadAsync("/res/dancing.glb");

		const model = gltf.scene;

		mixer = new AnimationMixer(model);
		const dance = mixer.clipAction(gltf.animations[0]);
		dance.play();

		scene.add(model);

		// Amputate and reattach
		const skinnedMeshes = []
		model.traverse(node => {
			if (node instanceof SkinnedMesh) {
				skinnedMeshes.push(node);
			}
		})

		const old = skinnedMeshes.pop();
		if (old) {
			const clone = SkeletonUtils.clone(old);
			const parent = old.parent;
			parent?.remove(old);
			parent?.add(clone);
		}

		renderer = new WebGLRenderer({ antialias: true });
		renderer.physicallyCorrectLights = true;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.target.y = 1;
		controls.update();

		animate();

	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
	mixer.update(1 / 60);
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

}

export default App;
