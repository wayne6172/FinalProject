import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import {scene, initScene} from './initScene.js'
import {Maze} from './Maze.js'
import KeyboardState from './keyboard.js'
import Car from './Car.js'
import HUD from './HUD.js'
import NPC from './NPC.js'

var camera, renderer, stats, clock, controls, maze, hud;
var raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(),pickables = [];
var car, npc, npc2;
var keyboard = new KeyboardState();

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousedown',onMouseDown,false);

init();
animate();

function init() {
	initScene();
	
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 10, 10000);
    scene.add(camera);

    var gridXZ = new THREE.GridHelper(500, 10, 'red', 'white');
    //scene.add(gridXZ);
    gridXZ.position.set(250, 0, 250);
    //gridXZ.rotation.x = Math.PI / 2;
    scene.add(new THREE.AxisHelper(50));


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x888888);
    renderer.autoClear = false;

    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableKeys = false;

    document.body.appendChild(renderer.domElement);
	
    maze = new Maze(5,5,50,5,50);
    
    maze.wall.forEach(function(e){
        pickables.push(e);
    });

    car = new Car(maze,'green',0,camera);
    hud = new HUD(car.body);
    ////
    let t = new THREE.Mesh(new THREE.CylinderGeometry(15,15,100,64), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    t.position.set(475,50,475);

    scene.add(t);

    let plane = new THREE.Mesh(new THREE.PlaneGeometry(500,500), new THREE.MeshBasicMaterial({color: 0xc6793c}))
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(250,0,250);
    scene.add(plane);
    ////

    npc = new NPC(maze,'red',5,0);
    npc2 = new NPC(maze,'blue',13,1);
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    var dt = clock.getDelta();
    car.update(dt,keyboard);
    npc2.update(dt);
    npc.update(dt);

    requestAnimationFrame(animate);
    render();
}

function render() {
    var WW = window.innerWidth;
    var HH = window.innerHeight;

    renderer.setScissorTest(true);
    renderer.setViewport(0,0,WW,HH);
    renderer.setScissor(0,0,WW,HH);
    renderer.clear();
    renderer.render(scene,camera);

    renderer.setViewport(WW * 0.7, 0, WW * 0.3, HH * 0.3);
    renderer.setScissor(WW * 0.7, 0, WW * 0.3, HH * 0.3);
    renderer.clear();
    renderer.render(scene,hud.cameraHUD2);
    renderer.render(hud.sceneHUD,hud.cameraHUD1);
}

function onMouseDown(e){
    e.preventDefault();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(pickables);
    if(intersects.length > 0){
        console.log(intersects[0]);
        
        if('mazeData' in intersects[0].object){
            scene.remove(intersects[0].object);
            maze.removeWall(intersects[0].object.mazeData);
        }
        
    }

}