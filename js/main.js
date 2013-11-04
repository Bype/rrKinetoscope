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

var img_list = ["An_Impromptu_Session-Daft_Pianists", "Après_Barack_Obama,_François_Hollande_reprend_Get_Lucky_de_Daft_Punk_(ft_Pharrell)", "Barack_Obama_Singing_Get_Lucky_by_Daft_Punk_(ft._Pharrell)", "Billie_Jean_Get_Lucky_(Noy_Alooshe_Mash_Up)-Daft_Punk_Vs_Michael_Jackson", "Cat_Lucky", "C'est_bon_pour_le_moral", "CLIP_Evolution_of_Get_Lucky_[Daft_Punk_Chronologic_Cover]", "Daft_Punk_ft_Rodgers,_Pharrell_&_Jackson-DJ_Sandstorm_Mashup", "Daft_Punk_'Get_Lucky'_Covers_Mix_(@TheKevinRyder_remix)", "Être_Chanceux_(Get_Lucky_french_version)", "Evolution_of_Get_Lucky_[Daft_Punk_Chronologic_cover_by_PV_NOVA]", "Get_Lucky_(Acapella_&_Beatbox_Cover)", "Get_Lucky_(Acapella_Cover_by_Oliver_Age_24)", "Get_Lucky_-_A_Cappela_Cover-JB_Craipeau", "Get_Lucky_(Accordion_Cover_by_Olavsky)", "Get_Lucky_acoustic_cover_(tunisian_style)", "Get_Lucky_(A_cover_by_Andre_B.)", "Get_Lucky_-_Bass_Cover", "Get_Lucky_-_Beats_Antique_Cover_-_feat._Charles_Butler_-_Video_MasHuP", "Get_Lucky_(Chacarera)___Despiertos_para_ponerla_(HD)", "Get_Lucky-choir!_choir!_choir!_sings_Daft_Punk_(ft._Pharrell)", "Get_Lucky_cover_(Electronic_vs._Live_Instruments)_by_KNOWER", "Get_Lucky_(Daft_Punk_Cover)-Brett_Domino_Trio", "Get_Lucky_(Daft_Punk_ft._Pharrell)-The_Sons_of_Pitches", "Get_Lucky_(Full_Video)", "Get_Lucky-George_Barnett", "Get_Lucky_(Grand_Piano_Cover)", "Get_Lucky_LIVE_Cover_w__Looping", "Get_Lucky_(Miracles_of_Modern_Science_orchestral_cover)", "Get_Lucky", "GET_LUCKY", "Get_Lucky_Piano_Cover-Daft_Punk_Pianist", "Get_Lucky_-_Saxophone_Duet", "GET_LUCKY_-_SOUL_TRAIN_LINE_1970_-_2013", "Get_Lucky_vs._Bee_Gees_&_Justice", "Shredded_Version_(Parody_by_Topito.com)", "White_People_Dancing_to_Daft_Punk_(Get_Lucky)"];

$(document).ready(function() {

	soundManager.setup({
		url : 'swf',
		flashVersion : 9, // optional: shiny features (default = 8)
		preferFlash : true,
		onready : function() {
			soundManager.createSound({
				id : 'loop',
				url : 'audio/getLuckyLoop.mp3',
				autoLoad : true,
				autoPlay : true,
				loops : 65536,
				volume : 20
			});
		}
	});

	function fadeInSound(soundID, amount) {
		var s = soundManager.getSoundById(soundID);
		var vol = s.volume;
		if (vol == 20)
			return false;
		s.setVolume(Math.min(20, vol + amount));
		setTimeout(function() {
			fadeInSound(soundID, amount);
		}, 20);
	}

	function fadeOutSound(soundID, amount) {
		var s = soundManager.getSoundById(soundID);
		var vol = s.volume;
		if (vol == 0)
			return false;
		s.setVolume(Math.max(0, vol + amount));
		setTimeout(function() {
			fadeOutSound(soundID, amount);
		}, 20);
	}

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

	var defaultCamera = new THREE.Vector3(0, 0, 700);
	var targetCamera = new THREE.Vector3(163, -80, 700);

	var video, image, imageContext, texture, materialV;
	var savedMaterial;

	var animMesh = new Array();

	var seekingPos = false;
	var userSeeking = false;

	var startTimeStamp = 0;

	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(35, $(document).width() / $(document).height(), 1, 10000);
		mouse2d = new THREE.Vector3(0, 0, 1);

		camera.position.x = 136;
		camera.position.y = -80;
		camera.position.z = 800;
		camera.rotation.x = 0;
		camera.rotation.y = 0;
		camera.rotation.z = 0;
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

		for (var i = 0; i < 128; i++) {
			imgUrl = img_list[i % img_list.length];
			material[i] = new THREE.MeshBasicMaterial({
				map : THREE.ImageUtils.loadTexture('stream/img/ttl_' + imgUrl + '.png')
			});
			geometry[i] = new THREE.PlaneGeometry(128, 72);
			mesh[i] = new THREE.Mesh(geometry[i], material[i]);
			mesh[i].name = imgUrl;
			mesh[i].position.x = 476 - 160 * (i % 8);
			mesh[i].position.y = 600 - 100 * Math.floor(i / 8);
			mesh[i].rotation.x = 0;
			mesh[i].private_sign = (Math.random() < .5 ? -1 : 1);
			scene.add(mesh[i]);
		};

		var cubePlus = new THREE.PlaneGeometry(8, 8);
		cubeMesh = new THREE.Mesh(cubePlus, new THREE.MeshBasicMaterial({
			map : THREE.ImageUtils.loadTexture('img/play.png'),
			color : 0x606060,
			opacity : .7,
			transparent : true
		}));
		cubeMesh.position.x = 0;
		cubeMesh.position.y = 0;
		cubeMesh.position.z = 1000;
		scene.add(cubeMesh);

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
		renderer.setSize($(document).width(), $(document).height());
		$(window).unload(function() {
			$(renderer.domElement).remove();
			renderer = null;
		});

		document.body.appendChild(renderer.domElement);

	}

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	function render() {
		// find intersections

		if (video.readyState === video.HAVE_ENOUGH_DATA) {
			imageContext.drawImage(video, 0, 0);
			if (texture)
				texture.needsUpdate = true;
		}

		function gotoTarget(current, target) {
			if (current < target)
				current += (target - current) / 16;
			if (target < current)
				current -= (current - target) / 16;
			return current;
		}

		for (var i = 0; i < 128; i++) {
			if (.1 < Math.abs(mesh[i].rotation.y))
				mesh[i].private_sign = -mesh[i].private_sign;
			mesh[i].rotation.y += ((mesh[i].private_sign * .12) - mesh[i].rotation.y) / 14;
		}

		camera.position.x = gotoTarget(camera.position.x, targetCamera.x);
		camera.position.y = gotoTarget(camera.position.y, targetCamera.y);
		camera.position.z = gotoTarget(camera.position.z, targetCamera.z);

		if ((video.paused) && (INTERSECTED != null)) {
			if (cubeMesh.position.z < 190)
				cubeMesh.position.z += (190 - cubeMesh.position.z) / 4;
		} else {
			if (-10 < cubeMesh.position.z)
				cubeMesh.position.z -= 16;
		}

		for (var i = 0; i < animMesh.length; i++) {
			if (0 < animMesh[i].position.z)
				animMesh[i].position.z -= animMesh[i].position.z / 16;
			else
				animMesh.splice(i, 1);
		}

		if (INTERSECTED)
			if (INTERSECTED.position.z < 120)
				INTERSECTED.position.z += (120 - INTERSECTED.position.z) / 4;

		sun.position = camera.position.clone();
		sun.position.z = 500;
		sun.position.normalize();
		renderer.render(scene, camera);
	}

	function startVideo(anIntersectedObj) {
		if (INTERSECTED) {
			video.pause();
			//video.currentTime = video.initialTime;
			INTERSECTED.material = savedMaterial;
			animMesh.push(INTERSECTED);
		}
		INTERSECTED = anIntersectedObj;
		anIntersectedObj.private_sign = 0;
		video.setAttribute('src', 'stream/' + INTERSECTED.name + '.mp4');
		targetCamera.x = INTERSECTED.position.x;
		targetCamera.y = INTERSECTED.position.y;
		targetCamera.z = 260;
		savedMaterial = INTERSECTED.material;
		INTERSECTED.material = materialV;
		video.addEventListener('ended', function(e) {
			stopVideo();
		},false);
		if (video.paused)
			video.play();
		fadeOutSound('loop', -1);
	}

	function stopVideo() {
		if (INTERSECTED) {
			INTERSECTED.material = savedMaterial;
			animMesh.push(INTERSECTED);
		}
		INTERSECTED.private_sign = -1;
		INTERSECTED = null;
		video.pause();
		video.setAttribute('src', '');
		targetCamera.z = 800;
		fadeInSound('loop', 1);
	}

	var findVideo = null;

	function pickStart(x, y, aTimestamp) {
		startTimeStamp = aTimestamp;

	}

	function pickStop(x, y, timestamp) {
		if ((x < $(document).width()) && (y < $(document).height())) {
			mousetrack.x = x;
			mousetrack.x = y;
			if ((timestamp - startTimeStamp) < 150) {

				mouse.x = (x / $(document).width() ) * 2 - 1;
				mouse.y = -(y / $(document).height() ) * 2 + 1;
				var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
				projector.unprojectVector(vector, camera);

				var normVector = vector.subSelf(camera.position).normalize();

				var ray = new THREE.Ray(camera.position, normVector);

				var intersects = ray.intersectScene(scene);
				findVideo = null;
				if (intersects.length > 0) {
					// Intersection
					if ((INTERSECTED != intersects[0].object) && (cubeMesh != intersects[0].object)) {
						// New intersected object
						findVideo = intersects[0].object;
						startVideo(findVideo);
						cubeMesh.position = INTERSECTED.position.clone();
						cubeMesh.position.z -= 100;
					} else {
						// Current intersected object
						if (video.paused) {
							video.play();
						} else {
							video.pause();
						}
					}
				} else {
					stopVideo();
				}
			}
		}
	}

	function pickMove(x, y) {

		if (INTERSECTED) {

		} else {
			if (Math.abs(x - mousetrack.x) < 50)
				targetCamera.x -= (x - mousetrack.x) / 2;
			if (Math.abs(y - mousetrack.y) < 50)
				targetCamera.y += (y - mousetrack.y) / 2;

			if (450 < targetCamera.y)
				targetCamera.y = 450;
			if (targetCamera.y < -750)
				targetCamera.y = -750;
			if (targetCamera.x < -380)
				targetCamera.x = -380;
			if (200 < targetCamera.x)
				targetCamera.x = 200;

		}
		mousetrack.x = x;
		mousetrack.y = y;
	}

	var startTimeStamp = 0;
	document.addEventListener('touchstart', function(event) {
		// pickStart(event.targetTouches[0].pageX, event.targetTouches[0].pageY, event.timeStamp);
	});

	document.addEventListener('touchend', function(event) {
		// pickStop(event.changedTouches[0].pageX, event.changedTouches[0].pageY, event.timeStamp);
	});
	document.addEventListener('touchmove', function(event) {
		// pickMove(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
	});
	var mouseDown = false;

	document.addEventListener('mousemove', function(event) {
		event.preventDefault();
		if (mouseDown)
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
	init();
	animate();

	window.addEventListener('resize', onWindowResize, false);

	function onWindowResize() {
		camera.aspect = $(document).width() / $(document).height();
		camera.updateProjectionMatrix();
		renderer.setSize($(document).width(), $(document).height());
	}

});
