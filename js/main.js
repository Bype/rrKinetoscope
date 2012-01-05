/**
 *    rrKinetoscope
 *    webgl video viewer
 *
 *
 *    Copyright (c) 2011, David Olivari
 *    All rights reserved.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * 	  Intensively based on examples from : https://github.com/mrdoob/three.js
 *
 */

var img_list = ['zat1_jour1', 'zat1_jour2', 'zat1_jour3', 'zat2_jour1', 'zat2_jour2', 'zat2_jour3', 'zat3_jour1', 'zat3_jour2'];

$(document).ready(function() {

	var camera, scene, renderer;
	var material = new Array(img_list.length);
	var geometry = new Array(img_list.length);
	var mesh = new Array(img_list.length);
	var cubeMesh, sphereMesh;

	var sun;
	var mouse = {
		x : 0,
		y : 0
	}, INTERSECTED, FINISH;
	var mousetrack = {
		x : 0,
		y : 0
	};

	var defaultCamera = new THREE.Vector3(0, 0, 500);
	var targetCamera = new THREE.Vector3(163, -80, 500);

	var video, image, imageContext, texture, materialV;
	var savedMaterial;

	var animMesh = new Array();

	var seekingPos = false;
	var userSeeking = false;

	var startTimeStamp = 0;

	init();
	animate();

	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
		mouse2d = new THREE.Vector3(0, 0, 1);

		camera.position.x = 136;
		camera.position.y = -80;
		camera.position.z = 500;
		camera.rotation.x = 0;
		scene.add(camera);
		video = document.getElementById('video');
		video.load();
		image = document.createElement('canvas');
		image.width = 1280;
		image.height = 720;
		imageContext = image.getContext('2d');
		imageContext.fillStyle = '#000000';
		imageContext.fillRect(0, 0, 1280, 720);
		texture = new THREE.Texture(image);
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		materialV = new THREE.MeshBasicMaterial({
			map : texture,
			overdraw : true
		});

		for(var i = 0; i < 64; i++) {
			imgUrl = img_list[Math.floor(Math.random() * img_list.length)];
			material[i] = new THREE.MeshBasicMaterial({
				map : THREE.ImageUtils.loadTexture('stream/img/sttl_' + imgUrl + '.webp')		
			});
			geometry[i] = new THREE.PlaneGeometry(128, 72);
			mesh[i] = new THREE.Mesh(geometry[i], material[i]);
			mesh[i].name = imgUrl;
			mesh[i].position.x = 476 - 144 * (i % 8);
			mesh[i].position.y = 360 - 88 * Math.floor(i / 8);
			scene.add(mesh[i]);
		};

		var cubePlus = new THREE.PlaneGeometry(112, 2);
		cubeMesh = new THREE.Mesh(cubePlus, new THREE.MeshBasicMaterial({
			//map : THREE.ImageUtils.loadTexture('img/play.png'),
			color : 0x606060,
			opacity : .7,
			transparent : true
		}));
		cubeMesh.position.x = 0;
		cubeMesh.position.y = 0;
		cubeMesh.position.z = 1000;
		scene.add(cubeMesh);

		var spherePlus = new THREE.CubeGeometry(4, 4, 4);
		sphereMesh = new THREE.Mesh(spherePlus, new THREE.MeshLambertMaterial({
			//map : THREE.ImageUtils.loadTexture('img/play.png'),
			color : 0x606060,
			opacity : .5,
			transparent : true
		}));
		sphereMesh.position.x = 0;
		sphereMesh.position.y = 0;
		sphereMesh.position.z = 1000;
		scene.add(sphereMesh);

		/*
		 var light = new THREE.PointLight(0xFFFFFF);
		 light.position.set(136, -80, 300);
		 scene.add(light);
		 var light1 = new THREE.PointLight(0xFFFFFF);
		 light1.position.set(-100, -500, 0);
		 scene.add(light1);
		 var light2 = new THREE.PointLight(0xFFFFFF);
		 light2.position.set(-100, 100, 100);
		 scene.add(light2);
		 */
		var ambientLight = new THREE.AmbientLight(0x606060);
		scene.add(ambientLight);
		sun = new THREE.DirectionalLight(0xffffff);
		scene.add(sun);
		projector = new THREE.Projector();
		renderer = new THREE.WebGLRenderer({
			antialias : true
		});
		renderer.setSize(document.width, document.height);
		document.body.appendChild(renderer.domElement);

	}


	window.addEventListener('resize', onWindowResize, false);

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	function render() {
		// find intersections

		if(video.readyState === video.HAVE_ENOUGH_DATA) {

			imageContext.drawImage(video, 0, 0);

			if(texture)
				texture.needsUpdate = true;

		}
		if(seekingPos) {
			if(INTERSECTED) {
				sphereMesh.rotation.x += 0.01;
				sphereMesh.rotation.y -= 0.02;
			}
		} else {
			if(userSeeking != true)
				if(sphereMesh.position.z < 500)
					sphereMesh.position.z += sphereMesh.position.z / 16;
		}

		function gotoTarget(current, target) {
			if(current < target)
				current += (target - current) / 16;
			if(target < current)
				current -= (current - target) / 16;
			return current;
		}


		camera.position.x = gotoTarget(camera.position.x, targetCamera.x);
		camera.position.y = gotoTarget(camera.position.y, targetCamera.y);
		camera.position.z = gotoTarget(camera.position.z, targetCamera.z);

		for(var i = 0; i < animMesh.length; i++) {
			if(0 < animMesh[i].position.z)
				animMesh[i].position.z -= animMesh[i].position.z / 16;
			else
				animMesh.splice(i, 1);
		}

		if(INTERSECTED)
			if(INTERSECTED.position.z < 120)
				INTERSECTED.position.z += (120 - INTERSECTED.position.z) / 4;

		sun.position = camera.position.clone();
		sun.position.z = 500;
		sun.position.normalize();
		renderer.render(scene, camera);

	}

	function startVideo(anIntersectedObj) {
		if(INTERSECTED) {
			video.pause();
			video.currentTime = video.initialTime;
			INTERSECTED.material = savedMaterial;
			animMesh.push(INTERSECTED);
		}
		INTERSECTED = anIntersectedObj;
		video.setAttribute('src', 'stream/' + INTERSECTED.name + '.webm');
		targetCamera.x = INTERSECTED.position.x;
		targetCamera.y = INTERSECTED.position.y;
		targetCamera.z = 250;
		savedMaterial = INTERSECTED.material;
		INTERSECTED.material = materialV;

		if(video.paused)
			video.play();

	}

	function stopVideo() {
		if(INTERSECTED) {
			INTERSECTED.material = savedMaterial;
			animMesh.push(INTERSECTED);
		}
		INTERSECTED = null;
		video.pause();
		video.setAttribute('src', '');
		targetCamera.z = 500;
	}

	function seekVideo() {
		if(INTERSECTED) {
			video.pause();
			cubeMesh.position = INTERSECTED.position.clone();
			sphereMesh.position.y = cubeMesh.position.y;
			sphereMesh.position.z = cubeMesh.position.z + 1;
			sphereMesh.rotation.x = 0;
			sphereMesh.rotation.y = 0;
		}
	}

	function endSeek() {
		if(video.paused) {
			video.play();
		}
	}

	var findVideo = null;

	function pickStart(x, y, aTimestamp) {
		startTimeStamp = aTimestamp;
		mousetrack.x = x;
		mousetrack.x = y;

		mouse.x = (x / window.innerWidth ) * 2 - 1;
		mouse.y = -(y / window.innerHeight ) * 2 + 1;
		var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
		projector.unprojectVector(vector, camera);

		var normVector = vector.subSelf(camera.position).normalize();

		var ray = new THREE.Ray(camera.position, normVector);

		var intersects = ray.intersectScene(scene);
		findVideo = null;
		if(intersects.length > 0) {
			// Intersection
			if(INTERSECTED != intersects[0].object) {
				// New intersected object
				findVideo = intersects[0].object;
			} else {
				// Current intersected object
				seekVideo();
			}

		} else {
			stopVideo();

		}
	}

	function pickStop(x, y, timestamp) {
		mousetrack.x = x;
		mousetrack.x = y;
		if(300 < (timestamp - startTimeStamp)) {
			if(INTERSECTED) {
				endSeek();
			}
			userSeeking = false;
		} else {
			// Tap touch
			if(findVideo)
				startVideo(findVideo);
		}

	}

	function pickMove(x, y) {

		if(INTERSECTED) {
			if(video.paused) {
				userSeeking = true;
				video.currentTime = Math.floor(video.duration * x / window.innerWidth);
				var newPos = 1.1 * (112 * x / window.innerWidth - 56);
				if((-56 < newPos) && (newPos < 56))
					sphereMesh.position.x = cubeMesh.position.x + newPos;
			}
		} else {
			if(Math.abs(x - mousetrack.x) < 50)
				targetCamera.x -= (x - mousetrack.x) / 2;
			if(Math.abs(y - mousetrack.y) < 50)
				targetCamera.y += (y - mousetrack.y) / 2;
		}
		mousetrack.x = x;
		mousetrack.y = y;
	}


	video.addEventListener('seeking', function(event) {
		seekingPos = true;

	});
	video.addEventListener('seeked', function(event) {
		seekingPos = false;
		cubeMesh.position.z = 1000;
	});
	var startTimeStamp = 0;
	document.addEventListener('touchstart', function(event) {

		pickStart(event.targetTouches[0].pageX, event.targetTouches[0].pageY, event.timeStamp);
	});

	document.addEventListener('touchend', function(event) {
		pickStop(event.changedTouches[0].pageX, event.changedTouches[0].pageY, event.timeStamp);
	});
	document.addEventListener('touchmove', function(event) {
		pickMove(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
	});
	var mouseDown = false;

	document.addEventListener('mousemove', function(event) {
		event.preventDefault();
		if(mouseDown)
			pickMove(event.clientX, event.clientY);
	});

	document.addEventListener('mouseup', function(event) {
		event.preventDefault();
		mouseDown = false;
		pickStop(event.clientX, event.clientY, event.timeStamp);
	});

	document.addEventListener('mousedown', function(event) {
		mouseDown = true;
		event.preventDefault();
		pickStart(event.clientX, event.clientY, event.timeStamp);
	});
});
