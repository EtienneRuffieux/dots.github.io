import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

class CameraControl {
	#camera;
	#renderer;
	#cameraBasePosition;
	#cameraBaseRotation;
	#busy = false;
	#controls;
	#threejsContainer;

	#CAMERA_BASE_Z = 501;
	#CAMERA_BASE_Y = -50;
	#DURATION_QUICK = 300;
	#DURATION_LONG = 1500;

	constructor() {
		this.#camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		this.#camera.position.z = this.#CAMERA_BASE_Z;
		this.#camera.position.y = this.#CAMERA_BASE_Y;
		this.#cameraBasePosition = new THREE.Vector3().copy(this.#camera.position);
		this.#cameraBaseRotation = new THREE.Euler().copy(this.#camera.rotation);

		// Init renderer
		this.#renderer = new THREE.WebGLRenderer({antialias: true});
		this.#renderer.setPixelRatio(window.devicePixelRatio);
		this.#renderer.setSize(window.innerWidth, window.innerHeight);

		this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
		this.#controls.enableZoom = false;
		this.#controls.enablePan = false;
		this.#controls.rotateSpeed = 0.1;
		this.#controls.target = new THREE.Vector3(0, this.#CAMERA_BASE_Y, 0);

		this.#threejsContainer = document.getElementById('threejs-container');
	}

	clear() {
		TWEEN.removeAll();
	}

	cameraSetPosition(x, y, z) {
		this.#camera.position.x = x;
		this.#camera.position.y = y;
		this.#camera.position.z = z;
	}

	cameraFromPosition(fromX, fromY, fromZ, resetRotation) {
		if (resetRotation) {
			this.#camera.rotation.copy(this.#cameraBaseRotation);
		}

		this.#camera.position.x = fromX;
		this.#camera.position.y = fromY;
		this.#camera.position.z = fromZ;

		this.#tweenToBase(this.#DURATION_LONG, true);
	}


	cameraRecenter(resetRotation) {
		if (this.#cameraBasePosition.equals(this.#camera.position) &&
			this.#cameraBaseRotation.equals(this.#camera.rotation)) {
			return;
		}
		if (resetRotation) {
			this.#camera.rotation.copy(this.#cameraBaseRotation);
		}
		this.#tweenToBase(this.#DURATION_QUICK);
	}

	#tweenToBase(duration, shiftOnEnd) {
		this.setBusy(true);

		TWEEN.removeAll();

		new TWEEN.Tween(this.#camera.position)
			.to({
				x: this.#cameraBasePosition.x,
				y: this.#cameraBasePosition.y,
				z: this.#cameraBasePosition.z},
				duration)
			.onComplete(() => {
				if (shiftOnEnd) {
					new TWEEN.Tween(this.#camera.position)
					.to({
						x: this.#cameraBasePosition.x + (Math.random() - 0.5) * 3,
						y: this.#cameraBasePosition.y + (Math.random() - 0.5) * 3,
						z: this.#cameraBasePosition.z},
						duration / 2)
					.onComplete(() => {
						this.setBusy(false);
					})
					.easing(TWEEN.Easing.Quadratic.InOut)
					.start();

				}
				else {
					this.#controls.update();
					// controls#update() will offset the position a bit so
					// we need to reset the position here.
					this.#camera.position.copy(this.#cameraBasePosition);
					this.setBusy(false);
				}
			})
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();

		new TWEEN.Tween(this.#camera.rotation)
			.to({
				x: this.#cameraBaseRotation.x,
				y: this.#cameraBaseRotation.y,
				z: this.#cameraBaseRotation.z},
				duration)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
	}

	isBusy() {
		return this.#busy;
	}

	setBusy(busy) {
		this.#threejsContainer.style.cursor = busy ? "auto" : "grab";
		this.#controls.enableRotate = busy ? false : true;
		this.#busy = busy;
	}

	getBaseZ() {
		return this.#CAMERA_BASE_Z;
	}

	getBaseY() {
		return this.#CAMERA_BASE_Y;
	}

	getCamera() {
		return this.#camera;
	}

	getRenderer() {
		return this.#renderer;
	}

	cameraPositionIsBase() {
		return this.#camera.position.equals(this.#cameraBasePosition);
	}

	onWindowResize(width, height) {
		this.#camera.aspect = width / height;
		this.#camera.updateProjectionMatrix();

		this.#renderer.setSize(width, height);
	}
}

export {CameraControl};