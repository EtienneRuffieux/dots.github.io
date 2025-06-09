import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

import {ImageParser, ImageParserArray} from './ImageParser.js';
import {Dots} from './Dots.js';
import {CameraControl} from './CameraControl.js';
import {UI} from './UI.js';

let scene, composer;

let dots, cameraControl, UIController, pageIndex = 0;

const resizeToPixel = 100;

const texts = [
		"0001",
		"0002",
		"0003",
		"0004",
		"0005",
		"0006",
	];

//////////////////////////////////////////////////////////
//						INIT							//
//////////////////////////////////////////////////////////

function init() {
	cameraControl = new CameraControl();

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff);

	initPostprocessing();

	initImageButtons();

	UIController = new UI(texts.length, texts[0], showContent, texts);

	document.getElementById('threejs-container').appendChild(cameraControl.getRenderer().domElement);
	window.addEventListener('resize', onWindowResize);
	window.addEventListener('wheel', onMouseScroll);
	window.addEventListener('mouseout', onMouseOut);

	render();
}

function initPostprocessing() {

	const renderPass = new RenderPass(scene, cameraControl.getCamera());
	const outputPass = new OutputPass();
	composer = new EffectComposer(cameraControl.getRenderer());

	composer.addPass(renderPass);
	composer.addPass(outputPass);

	composer = composer;
}

function onWindowResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;

	cameraControl.onWindowResize(width, height);

	composer.setSize(width, height);

	dots.updateDotsSize();
}

function render() {
	requestAnimationFrame(render);
	TWEEN.update();

	// Don't update when camera is in front, it won't move anyway.
	if (dots && !cameraControl.cameraPositionIsBase()) {
		dots.updateImage();
	}

	composer.render();
}

function initImageButtons() {
	loadImage("images/" + texts[pageIndex] + ".png");

	document.getElementById("load").addEventListener("click", () => {
		showContent(-1, false);
		loadImage(window.prompt("Enter image URL", "http://"));
	});
}

function loadImage(path) {
	const img = new ImageParser(path, resizeToPixel, () => {
		let imageParserArray = img.getGreyscale();
		cameraControl.cameraSetPosition(0, cameraControl.getBaseY(), cameraControl.getBaseZ());
		if (!dots) {
			dots = new Dots(scene, cameraControl.getCamera(), cameraControl.getBaseZ());
		}
		dots.createImage(imageParserArray);
		cameraControl.cameraFromPosition(0, 0, 0, true);
	});
}

function onMouseScroll(event) {
	if (cameraControl.isBusy()) {
		return;
	}

	let fromBottom = false;
	if (event.wheelDelta > 0 && pageIndex > 0) {
		pageIndex--;
	} else if (event.wheelDelta < 0 && pageIndex < texts.length - 1) {
		pageIndex++;
		fromBottom = true;
	} else {
		return;
	}

	showContent(pageIndex, fromBottom);
}

function showContent(index, fromBottom) {
	if (index == -1) {
		UIController.deselectSliderStep();
		UIController.hideText();
		return;
	}

	if (cameraControl.isBusy()) {
		return;
	}

	console.log("showContent ", index);
	pageIndex = index;
	UIController.selectSliderStep(index);
	UIController.displayText(texts[index], fromBottom);
	loadImage("images/" + texts[index] + ".png");
}

function onMouseOut(event) {
	if (cameraControl.isBusy()) {
		return;
	}
	cameraControl.cameraRecenter(false);
}

init();


