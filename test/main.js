import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import {scene, initScene} from './initScene.js'
import {Maze} from './Maze.js'
import KeyboardState from './keyboard.js'
import Car from './Car.js'

var camera, renderer, stats, clock, controls, maze;
var raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(),pickables = [];
var car;
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

    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableKeys = false;

    document.body.appendChild(renderer.domElement);
	
    maze = new Maze(10,10,50,5,50);
    
    maze.wall.forEach(function(e){
        pickables.push(e);
    });

    car = new Car(maze,camera);

    let t = new THREE.Mesh(new THREE.CylinderGeometry(15,15,100,64), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    t.position.set(475,50,475);

    scene.add(t);
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

    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
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