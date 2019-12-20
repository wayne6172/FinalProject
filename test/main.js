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
import $ from 'jquery'
import GLTFLoader from 'three-gltf-loader'

var robotModel = {};
var enemyModel;


var canStart = 0;
var camera, renderer, stats, clock, maze, hud, stats = new Stats();
var exit, gameState = "Init", text;
var systemTime = 0.0, angle = 0.0;
var raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(),pickables = [];
var car, npcs = [], npcEx;
var keyboard = new KeyboardState();
var mazeWidth = 70, mazeSize = 15, cameraFar = 1500; // 550
var FinalLine;
var light;
var openBigMap = false;
var removeWall = [];
var isremoveWall = 2;
var gameTime = 120;

$("#StartGame").click(function(e){
    if(canStart == 1){
        initGame();
        gameState = "Game";
    }
});

$('#info').click(function(e){
    clock.stop();
    alert("使用方向鍵上下左右可以控制機器人\n使用\"M\"可以打開大地圖\n可以藉由滑鼠點擊牆壁一次來移除牆，但只有兩次喔\n\n小心別被NPC抓到，會暫時倒地一陣子\n\n找到出口旗幟並走到吧，加油！！！");
    clock.start();
});

$('#BackGame').click(function(e){
    initStart();
    gameState = "Init";
});

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousedown',onMouseDown,false);

let loaderInit = [];

loaderInit.push(new Promise(function(resolve,reject){
    var loader = new GLTFLoader();
    loader.load('./model/RobotExpressive.glb', (gltf) => {
        console.log('load complete');
        resolve(gltf);
    }, (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (error) => {
        reject(error);
    });
}));

for(let i = 0; i < 5; i++){
    loaderInit.push(new Promise(function(resolve,reject){
        var loader = new GLTFLoader();
        loader.load('./model/Soldier.glb', (gltf) => {
            console.log('load complete');
            resolve(gltf);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            reject(error);
        });
    }));
}

function initRobot(robot){
    robotModel.body = robot.scene;

    robotModel.actions = {};
    robotModel.mixer = new THREE.AnimationMixer(robot.scene);

    robotModel.states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
    robotModel.emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

    for(let i = 0; i < robot.animations.length; i++){
        let clip = robot.animations[i];
        let action = robotModel.mixer.clipAction(clip);
        robotModel.actions[clip.name] =  action;

        if(robotModel.emotes.indexOf(clip.name) >= 0 || robotModel.states.indexOf(clip.name) >= 4){
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        }
    }
}

function initEnemy(res){
    enemyModel = new Array(res.length);

    for(let i = 0; i < res.length; i++){
        enemyModel[i] = {};
        enemyModel[i].body = res[i].scene;
        enemyModel[i].actions = {};

        enemyModel[i].mixer = new THREE.AnimationMixer(res[i].scene);
        enemyModel[i].states = [ 'Idle', 'Run', 'TPose', 'Walk'];

        for(let j = 0; j < res[i].animations.length; j++){
            let clip = res[i].animations[j];
            let action = enemyModel[i].mixer.clipAction(clip);
            enemyModel[i].actions[clip.name] = action;
        }
    }
}

Promise.all(loaderInit).then(function(res){
    console.log(res);
    canStart = 1;
    initRobot(res[0]);
    res.shift();

    initEnemy(res);

    init();
    mainAnimate();
});


/*
loaderInit.then(function(robot){
    

    init();
    mainAnimate();
})*/

function onunloadEvent(){
    console.log('x');
}

function init() {
    initScene();
    scene.background = new THREE.Color( 0x222222 );

    document.addEventListener('offline',onunloadEvent,false);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);
	
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, cameraFar);
    camera.position.set(mazeSize * mazeWidth / 2,500,mazeSize * mazeWidth / 2);
    camera.lookAt(new THREE.Vector3());
    scene.add(camera);


    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x888888);
    renderer.autoClear = false;

    document.body.appendChild(renderer.domElement);
    
    maze = new Maze(mazeSize,mazeSize,mazeWidth,5,50);

    light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set((mazeWidth * mazeSize / 2 + 50),200,(mazeWidth * mazeSize / 2 + 50));
    light.target.position.set((mazeWidth * mazeSize / 2),0,(mazeWidth * mazeSize / 2));
    scene.add(light.target);
    scene.add(light,new THREE.AmbientLight(0x444444));

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

    let nextPos = Math.floor((Math.random() * mazeSize * mazeSize));
    npcEx = new NPC(maze,robotModel,'',3,0,nextPos,camera);
    npcEx.speed = 120;

    let mat = loader.load('./texture/FinalLine.png');

    FinalLine = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshBasicMaterial({
        map: mat,
        transparent: true,
        side: THREE.DoubleSide
    }));
    exit = nextPos;
    FinalLine.position.copy(maze.getNodeToPos(exit));
    FinalLine.position.y = 5;
    FinalLine.rotation.x = -Math.PI / 2;

    scene.add(FinalLine);


    scene.fog = new THREE.Fog( 0x222222, 550 - 50, 550 );
}

function initStart(){
    document.getElementById("EndGame").style.display = "none";
    document.getElementById("InitGame").style.display = "inline";

    pickables = [];

    car.body.remove(camera);
    camera.position.set(mazeSize * mazeWidth / 2,150,mazeSize * mazeWidth / 2);
    camera.lookAt(new THREE.Vector3());
    scene.add(camera);

    maze.wall.forEach(function(e){
        scene.remove(e);
    });

    scene.remove(car.body);
    npcs.forEach(function(e){
        scene.remove(e.body);
    });
    npcs = [];

    scene.remove(FinalLine);

    maze = new Maze(mazeSize,mazeSize,mazeWidth,5,50);
    camera.far = 550;
    camera.updateProjectionMatrix();


    let nextPos = Math.floor((Math.random() * mazeSize * mazeSize));
    npcEx = new NPC(maze,robotModel,'',3,0,nextPos,camera);
    npcEx.speed = 120;

    let loader = new THREE.TextureLoader();
    let mat = loader.load('./texture/FinalLine.png');

    FinalLine = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshBasicMaterial({
        map: mat,
        transparent: true,
        side: THREE.DoubleSide
    }));
    exit = Math.floor(Math.random() * mazeSize * mazeSize);
    FinalLine.position.copy(maze.getNodeToPos(exit));
    FinalLine.position.y = 5;
    FinalLine.rotation.x = -Math.PI / 2;

    npcEx.target = exit;
    scene.add(FinalLine);


}

function initGame(){
    document.getElementById("InitGame").style.display = "none";
    document.getElementById("InGame").style.display = "inline";
    systemTime = 0;

    camera.far = 550;
    camera.updateProjectionMatrix();

    maze.wall.forEach(function(e){
        pickables.push(e);
    });

    car = new Car(maze,robotModel,null,0,camera);
    hud = new HUD(mazeWidth * mazeSize,gameTime);
    ////
    scene.remove(FinalLine);
    scene.remove(npcEx.body);

    let loader = new THREE.TextureLoader();
    let mat = loader.load('./texture/FinalLine.png');

    FinalLine = new THREE.Mesh(new THREE.PlaneGeometry(100,200), new THREE.MeshBasicMaterial({
        map: mat,
        transparent: true,
        side: THREE.DoubleSide
    }));
    let where = Math.floor(Math.random() * 2);
    if(where === 0)
        exit = (mazeSize - 1) + (Math.floor(mazeSize * Math.random()) * mazeSize);
    else
        exit = (mazeSize - 1) * mazeSize + Math.floor(mazeSize * Math.random())

    FinalLine.position.copy(maze.getNodeToPos(exit));
    FinalLine.position.y = 50;

    scene.add(FinalLine);

    //// NPC

    npcs = [];
    npcs.push(
        //new NPC(maze,enemyModel[0],'NPC1',0,Math.floor((Math.random() * mazeSize * mazeSize))),
        //new NPC(maze,enemyModel[1],'NPC2',1,Math.floor((Math.random() * mazeSize * mazeSize))),
        new NPC(maze,enemyModel[0],'NPC1',3,exit,Math.floor((Math.random() * mazeSize * mazeSize))),
        new NPC(maze,enemyModel[1],'NPC2',4,exit,Math.floor((Math.random() * mazeSize * mazeSize))),
        new NPC(maze,enemyModel[2],'NPC3',3,exit,Math.floor((Math.random() * mazeSize * mazeSize))),
        //new NPC(maze,'black','NPC5',5,Math.floor((Math.random() * mazeSize * mazeSize)),Math.floor((Math.random() * mazeSize * mazeSize)))
    );
    


    // create skybox

    //creataSkybox();
}

function creataSkybox(){
    let loader = new THREE.TextureLoader();
    let texture_ft = new THREE.TextureLoader().load('/image/heather_ft.jpg');
    let texture_bk = new THREE.TextureLoader().load('/image/heather_bk.jpg');
    let texture_up = new THREE.TextureLoader().load('/image/heather_up.jpg');
    let texture_dn = new THREE.TextureLoader().load('/image/heather_dn.jpg');
    let texture_rt = new THREE.TextureLoader().load('../image/heather_rt.jpg');
    let texture_lf = new THREE.TextureLoader().load('../image/heather_lf.jpg');

    let materialArray = [];
    materialArray.push(
        new THREE.MeshBasicMaterial({map: texture_ft}),
        new THREE.MeshBasicMaterial({map: texture_bk}),
        new THREE.MeshBasicMaterial({map: texture_up}),
        new THREE.MeshBasicMaterial({map: texture_dn}),
        new THREE.MeshBasicMaterial({map: texture_rt}),
        new THREE.MeshBasicMaterial({map: texture_lf})
    );

    materialArray.forEach(function(e){
        e.side = THREE.BackSide;
    })

    let skyGeo = new THREE.BoxGeometry(2000,2000,2000);
    let skyBox = new THREE.Mesh(skyGeo,materialArray);

    scene.add(skyBox);
}

function initAnimate(dt){
    npcEx.update(dt);

    if(npcEx.NPCState === npcEx.NPCStateTable.WaintingTarget){
        scene.remove(FinalLine);

        let loader = new THREE.TextureLoader();
        let mat = loader.load('./texture/FinalLine.png');

        FinalLine = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshBasicMaterial({
            map: mat,
            transparent: true,
            side: THREE.DoubleSide
        }));
        exit = Math.floor(Math.random() * mazeSize * mazeSize);
        FinalLine.position.copy(maze.getNodeToPos(exit));
        FinalLine.position.y = 5;
        FinalLine.rotation.x = -Math.PI / 2;

        scene.add(FinalLine);
        npcEx.target = exit;
        npcEx.NPCState = npcEx.NPCStateTable.initState;
    }
}

function gameAnimate(dt){
    
    if(gameState === "Game")
        systemTime += dt;

    if(keyboard.up('M'))
        openBigMap = !openBigMap;

    if(!openBigMap){
        car.update(dt,keyboard,pickables);

        npcs.forEach(function(e){
            e.update(dt,car.nowCell);
            if(e.NPCState === e.NPCStateTable.WaintingTarget){
                e.target = Math.floor(Math.random() * mazeSize * mazeSize);
                e.NPCState = e.NPCStateTable.initState;
            }
        });


        if(car.nowCell === exit){
            gameState = "End";
        }

        npcs.forEach(function(e){
            if(e.catchMode && car.state.stateName === "Dead"){
                e.catchMode = false;
                e.NPCState = e.NPCStateTable.WaintingTarget;
                e.changeText(e.textName);
            }

            if(car.nowCell === e.nowCell && car.state.stateName !== "Dead"){
                car.state.stateName = "Dead";
                car.state.keepTime = 3;
                e.catchMode = false;
                e.NPCState = e.NPCStateTable.WaintingTarget;
                e.changeText(e.textName);
            }
        });
    }

}

function mainAnimate() {
    var dt = clock.getDelta();

    stats.update();
    keyboard.update();

    if(gameState === "Init"){
        initAnimate(dt);
    }
    else if(gameState === "Game"){
        gameAnimate(dt);
        let dir = car.body.getWorldPosition(new THREE.Vector3()).clone().sub(FinalLine.getWorldPosition(new THREE.Vector3()));
        dir.y = 0;
        let angle = Math.atan2(dir.x,dir.z);
        FinalLine.rotation.y = angle;
        //console.log(angle);

        if(systemTime > gameTime){
            gameState = "End";
            openBigMap = false;
        }
    }
    else if(gameState === "End"){
        gameAnimate(dt);

        document.getElementById('InGame').style.display = "none";
        document.getElementById('EndGame').style.display = "inline";
        document.getElementById('EndInfo').innerHTML = "遊戲結束！ 花費時間為 "
            + Math.floor(systemTime / 60) + '分 ' + Math.floor(systemTime % 60) + "秒";
    }

    

    requestAnimationFrame(mainAnimate);
    render(dt);
}

function render(dt) {
    var WW = window.innerWidth;
    var HH = window.innerHeight;

    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, WW, HH);
    renderer.setScissor(0, 0, WW, HH);
    renderer.clear();
    renderer.render(scene,camera);

    //renderer.shadowMap.enabled = false;
    
    if(gameState === "Game"){
        renderer.render(hud.sceneHUD,hud.cameraHUD1);
        let playPos = car.body.position.clone();

        if(removeWall.length > 0){
            let len = removeWall.length;
            for(let i = 0; i < len; ){
                let find = false;
                removeWall[i].position.y -= 0.8;
                if(removeWall[i].position.y < -25){
                    scene.remove(removeWall[i]);
                    maze.removeWall(removeWall[i].mazeData);
                    find = true;
                    len--;
                }
                else i++;

                if(find)
                    removeWall.shift();
            }
        }
        
        if(!openBigMap){
            renderer.setViewport(WW * 0.7, 0, WW * 0.3, HH * 0.3);
            renderer.setScissor(WW * 0.7, 0, WW * 0.3, HH * 0.3);
            renderer.clear();
            renderer.render(hud.sceneMinimapHUD,hud.cameraMinimapHUD);
            renderer.setRenderTarget(hud.rtTexture);
            renderer.render(scene,hud.cameraHUD2);

            hud.updateMiniMapPos(playPos.x,playPos.z,car.body.rotation.y);
            hud.updateCenter(playPos.x,playPos.z,car.body.rotation.y,maze,openBigMap);

            renderer.setRenderTarget(null);
            renderer.render(hud.sceneScrene,hud.cameraScrene);
        }
        else {
           
            renderer.setViewport((WW - HH) * 0.5, 0, HH, HH);
            renderer.setScissor((WW - HH) * 0.5, 0, HH, HH);
            renderer.clear();
            renderer.render(hud.sceneMinimapHUD,hud.cameraMinimapHUD);
            renderer.setRenderTarget(hud.rtTexture);
            renderer.render(scene,hud.cameraHUD3);

            hud.updateMiniMapPos(playPos.x,playPos.z,car.body.rotation.y);
            hud.updateCenter(playPos.x,playPos.z,car.body.rotation.y,maze,openBigMap);

            renderer.setRenderTarget(null);
            renderer.render(hud.sceneScrene,hud.cameraScrene);
        }
        
        hud.updateTime(dt);
    }
}

function onMouseDown(e){
    e.preventDefault();

    mouse.x = (e.clientX / (window.innerWidth)) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(pickables);
    if(intersects.length > 0){
        console.log(intersects[0]);
        
        

        if('mazeData' in intersects[0].object){
            if(isremoveWall === 0)return;
            else isremoveWall--;
            
            pickables.splice(pickables.indexOf(intersects[0].object),1);
            removeWall.push(intersects[0].object);
        }
        
    }

}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}