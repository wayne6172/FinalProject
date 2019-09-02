import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import {scene, initScene} from './initScene.js'
import {Maze} from './Maze.js'
import KeyboardState from './keyboard.js'
import Car from './Car.js'
import HUD from './HUD.js'
import NPC from './NPC.js'
import Stats from 'stats-js'
import THREE_Text from './text2D.js'

var camera, renderer, stats, clock, controls, maze, hud, stats = new Stats();
var raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(),pickables = [];
var car, npc, npc2,npc3,npc4;
var keyboard = new KeyboardState();
var mazeWidth = 50, mazeSize = 20, cameraFar = 300;
var light;

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousedown',onMouseDown,false);

init();
animate();

function init() {
    initScene();
    
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);
	
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, cameraFar);
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
	
    maze = new Maze(mazeSize,mazeSize,mazeWidth,5,mazeWidth);
    
    maze.wall.forEach(function(e){
        pickables.push(e);
    });

    car = new Car(maze,'green',null,0,camera);
    hud = new HUD(car.body,mazeWidth * mazeSize);
    ////
    let t = new THREE.Mesh(new THREE.CylinderGeometry(5,5,100,64), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    t.position.set(475,50,475);

    scene.add(t);

    let loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
        './texture/road/418-418.jpg',
        function(texture){
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(mazeSize,mazeSize);
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(mazeWidth * mazeSize,mazeWidth * mazeSize), new THREE.MeshPhongMaterial({map: texture}))
            plane.rotation.x = -Math.PI / 2;
            plane.position.set(mazeWidth * mazeSize / 2,0,mazeWidth * mazeSize / 2);

            plane.receiveShadow = true;
            scene.add(plane);
        },undefined,function(xhr) {console.log('error loader texture');}
    );

    
    ////

    npc = new NPC(maze,'red','',5,0);
    npc2 = new NPC(maze,'blue','',13,1);
    

    //scene.fog = new THREE.Fog(0xffffff,500,700);
    scene.background = new THREE.Color( 0x222222 );
    scene.fog = new THREE.Fog( 0x222222, cameraFar - 50, cameraFar );
    
    // light
    light = new THREE.DirectionalLight(0xaaaaaa);
    light.castShadow = true;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
    light.shadow.camera.left = light.shadow.camera.top = - (mazeWidth * mazeSize / 2 + 150);
    light.shadow.camera.right = light.shadow.camera.bottom = (mazeWidth * mazeSize / 2 + 150);
    light.shadow.camera.near = 1;
    light.shadow.camera.far = (mazeWidth * mazeSize / 2 + 150);
    light.shadow.bias = -0.01;

    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFShadowMap;

    light.position.set((mazeWidth * mazeSize / 2 + 50),200,(mazeWidth * mazeSize / 2 + 50));
    light.target.position.set((mazeWidth * mazeSize / 2),0,(mazeWidth * mazeSize / 2));
    scene.add(light.target);
    scene.add(light,new THREE.AmbientLight(0x888888));
    //scene.add(new THREE.CameraHelper(light.shadow.camera));
    // light end

    document.getElementById('info').innerHTML = '迷宮為' + mazeSize + 'x' + mazeSize;

    // BFS 

    npc3 = new NPC(maze,'orange','NPC3',0,3);
    npc4 = new NPC(maze,'white','NPC3',0,4);
    npc4.target = npc3.target = mazeSize * mazeSize - 1;
    BFS_TEST(0);
}

function BFS_TEST(start_node){
    let queue = [],sum = 0;
    let isTraverse = new Array(maze.m * maze.n);
    isTraverse.fill(false);

    queue.push([start_node, 0]);
    //isTraverse[start_node] = true;
    while(queue.length > 0){
        let now = queue.shift();

        if(isTraverse[now[0]])continue;
        isTraverse[now[0]] = true;
        sum++;

        if(now[0] == npc3.target){
            document.getElementById("Dijkstra’s_Algorithm_hint").innerHTML = 'Dijkstra’s Algorithm最短路徑長度為' + 
                now[1] + ' 參考cells數為(黑色): ' + sum;
            return;
        }

        for(let i = 0; i < 4; i++){
            if(maze.graph[now[0]][i] !== null && !isTraverse[maze.graph[now[0]][i]])
                queue.push([maze.graph[now[0]][i], now[1] + 1]);
        }
        
        let shit = new THREE.Mesh(new THREE.SphereGeometry(5,8,6), new THREE.MeshBasicMaterial({color: new THREE.Color('black')}));
        shit.position.copy(maze.getNodeToPos(now[0]).add(new THREE.Vector3(10,0,0)));
        scene.add(shit);
    }
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    stats.update();
    var dt = clock.getDelta();
    car.update(dt,keyboard);
    npc2.update(dt);
    npc.update(dt);

    npc3.update(dt);
    npc4.update(dt);

    requestAnimationFrame(animate);
    render();
}

function render() {
    var WW = window.innerWidth;
    var HH = window.innerHeight;

    //renderer.shadowMap.enabled = true;
    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, WW * 0.5, HH);
    renderer.setScissor(0, 0, WW * 0.5, HH);
    renderer.clear();
    renderer.render(scene,camera);

    //renderer.shadowMap.enabled = false;
    renderer.setViewport(WW * 0.5, 0, WW * 0.5, HH);
    renderer.setScissor(WW * 0.5, 0, WW * 0.5, HH);
    renderer.clear();
    renderer.render(scene,hud.cameraHUD2);
    renderer.render(hud.sceneHUD,hud.cameraHUD1);
}

function onMouseDown(e){
    e.preventDefault();
    mouse.x = (e.clientX / (window.innerWidth / 2)) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(pickables);
    if(intersects.length > 0){
        console.log(intersects[0]);
        
        if('mazeData' in intersects[0].object){
            pickables.splice(pickables.indexOf(intersects[0].object),1);
            scene.remove(intersects[0].object);
            maze.removeWall(intersects[0].object.mazeData);
        }
        
    }

}