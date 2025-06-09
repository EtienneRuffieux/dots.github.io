import * as THREE from 'three';
import {ImageParserArray} from './ImageParser.js';

class Dots {
	#scene;
	#camera;
	#dots;
	#dotsVector = [];

	#PIXEL_SPACING = 2.8;
	#DOTS_SIZE = 4;
	#PIXEL_Z_MAX_SPREAD = 490;
	#CAMERA_BASE_Z;
	#DOTS_SPEED_DIVIDER = 10;
	#DOTS_SPEED_MAX = 10;
	#DOTS_COLOR = 0x454545;

	constructor(scene, camera, cameraBaseZ) {
		console.debug("Instantiating Dots");
		this.#scene = scene;
		this.#camera = camera;
		this.#CAMERA_BASE_Z = cameraBaseZ;
		this.updateDotsSize();
	}

	#getGeometry(imageParsedArray) {
		const positions = new Float32Array(imageParsedArray.getVisiblePixelCount() * 3);
		const scales = new Float32Array(imageParsedArray.getVisiblePixelCount());
		let i = 0;
		let j = 0;
		for (let iY = 0; iY < imageParsedArray.getHeight(); iY++) {
			for (let iX = 0; iX < imageParsedArray.getWidth(); iX++) {
				let greyscale = imageParsedArray.getPixelsArray()[
					iY * imageParsedArray.getWidth() + iX
				];

				// Transparent / clear pixels shouldn't be drawn
				if (greyscale == -1) {
					continue;
				}

				// Set dot position
				let basePosition = new THREE.Vector3(
					iX * this.#PIXEL_SPACING - ((imageParsedArray.getWidth() * this.#PIXEL_SPACING) / 2),
					-iY * this.#PIXEL_SPACING + ((imageParsedArray.getHeight() * this.#PIXEL_SPACING) / 2),
					0
				);

				let direction = new THREE.Vector3();
				direction.subVectors(this.#camera.position, basePosition).normalize();

				let mult = Math.random() * (this.#PIXEL_Z_MAX_SPREAD - 1) + 1;

				positions[i] = basePosition.x + direction.x * mult;
				positions[i + 1] = basePosition.y + direction.y * mult;
				positions[i + 2] = basePosition.z + direction.z * mult;

				this.#dotsVector[j] = {
					vector: direction,
					greyscale: greyscale,
					basePosition: basePosition,
					zMax: this.#PIXEL_Z_MAX_SPREAD,
				};

				scales[j] = ((255 - greyscale) * this.#DOTS_SIZE / 255) * ((this.#CAMERA_BASE_Z - positions[i + 2]) * this.#DOTS_SIZE / (this.#CAMERA_BASE_Z));

				i += 3;
				j++;
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

		return geometry;
	}

	#getMaterial() {
		const material = new THREE.ShaderMaterial( {
			uniforms: {
				color: {value: new THREE.Color(this.#DOTS_COLOR)},
			},
			vertexShader: document.getElementById('vertexshader').textContent,
			fragmentShader: document.getElementById('fragmentshader').textContent
		});

		return material;
	}

	createImage(imageParsedArray) {
		this.clear();
		this.#dots = new THREE.Points(
			this.#getGeometry(imageParsedArray),
			this.#getMaterial());
		this.#scene.add(this.#dots);
		console.info("Dots image created: ", this.#dots);
	}

	updateImage() {
		if (!this.#dots) {
			return;
		}

		let x, y, z, zMult = 1;

		const dotsGeometry = this.#dots.geometry.getAttribute('position');
		const dotsScale = this.#dots.geometry.getAttribute('scale');

		for(let i = 0; i < this.#dotsVector.length; i++) {

			x = dotsGeometry.getX(i);
			y = dotsGeometry.getY(i);
			z = dotsGeometry.getZ(i);

			zMult = 1 + this.#camera.position.distanceTo(new THREE.Vector3(x, y, z)) * 0.01;

			x += (this.#dotsVector[i].vector.x / this.#DOTS_SPEED_DIVIDER * zMult);
			y += (this.#dotsVector[i].vector.y / this.#DOTS_SPEED_DIVIDER * zMult);
			z += (this.#dotsVector[i].vector.z / this.#DOTS_SPEED_DIVIDER * zMult);
			if (dotsGeometry.getZ(i) > this.#dotsVector[i].zMax) {
				x = this.#dotsVector[i].basePosition.x;
				y = this.#dotsVector[i].basePosition.y;
				z = this.#dotsVector[i].basePosition.z;
			}

			dotsGeometry.setXYZ(i, x, y, z);
			dotsScale.array[i] = ((255 - this.#dotsVector[i].greyscale) * this.#DOTS_SIZE / 255)
					* ((this.#CAMERA_BASE_Z - dotsGeometry.getZ(i))
					* this.#DOTS_SIZE / (this.#CAMERA_BASE_Z));
		}
		dotsGeometry.needsUpdate = true;
		dotsScale.needsUpdate = true;
	}

	// Scale dots size with pixel count, 800 worked great...
	updateDotsSize() {
		this.#DOTS_SIZE = 3 + window.innerHeight / 1000;
	}

	clear() {
		this.#scene.remove(this.#dots);
	}
}

export {Dots};