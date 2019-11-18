import * as THREE from 'three'
import { PlaneGeometry, MeshBasicMaterial } from 'three';

var temp;
class HUD{
    constructor(target,mazeTotalWidth) {
        this.centerMaxSize = 800;
        this.centerSet = new Array(this.centerMaxSize);
        this.centerSet3 = new Array(this.centerMaxSize);

        this.nowCenterSet = 0;
        for(let i = 0; i < this.centerMaxSize; i++){
            this.centerSet[i] = new THREE.Vector2();
            this.centerSet3[i] = new THREE.Vector3();
        }

        this.initHUD(mazeTotalWidth);
        this.initScrene();
        this.time = 60;

        //target.add(this.cameraHUD2);
    }

    initHUD(mazeTotalWidth){
        mazeTotalWidth /= 2;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        this.sceneHUD = new THREE.Scene();
        this.initSceneHUD(windowWidth,windowHeight);

        this.cameraHUD1 = new THREE.OrthographicCamera(-windowWidth / 2,windowWidth / 2,windowHeight / 2,-windowHeight / 2,1,50);
        this.cameraHUD2 = new THREE.OrthographicCamera(-mazeTotalWidth / 2, mazeTotalWidth / 2, mazeTotalWidth / 2, -mazeTotalWidth / 2, -350, 350);
        this.cameraHUD2.position.set(mazeTotalWidth,15,mazeTotalWidth);
        this.cameraHUD2.up.set(1,0,0);
        this.cameraHUD2.lookAt(new THREE.Vector3(mazeTotalWidth,0,mazeTotalWidth));
        this.cameraHUD1.position.set(0,0,10);

        /*var box = new THREE.Mesh(new THREE.BoxGeometry(500,500,5), new THREE.MeshNormalMaterial());
        this.sceneHUD.add(box);*/
    }

    initSceneHUD(width,height){
        let loader = new THREE.TextureLoader();
        var texture = loader.load('../texture/bomb.png');

        let plane = new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture
        }))
        plane.position.set(width / 4,height / 8 * 3,0);
        this.sceneHUD.add(plane);

        this.planeTimeMat = new THREE.ShaderMaterial({
            uniforms: {
              'color': {
                type: 'v3',
                value: new THREE.Vector3(0, 1, 0)
              },
              'pos': {
                type: 'f',
                value: -(width / 4 - 70)
              }
            },
            vertexShader: document.getElementById( 'myPlaneTimeVertexShader' ).textContent,
            fragmentShader: document.getElementById( 'myPlaneTimeFragmentShader' ).textContent
        });

        let timePlane = new THREE.Mesh(new THREE.PlaneGeometry((width / 4 - 70) * 2, 40), 
                this.planeTimeMat);
        timePlane.position.set(0,height / 8 * 3,0);
        this.sceneHUD.add(timePlane);
    }

    initScrene(){
        this.sceneScrene = new THREE.Scene();
        this.cameraScrene = new THREE.OrthographicCamera(-150,150,150,-150,-10,10);
        this.rtTexture = new THREE.WebGLRenderTarget( 
            window.innerWidth * 0.3, window.innerHeight * 0.3, 
            { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } 
        );

        this.rttmaterial = new THREE.ShaderMaterial( {
            uniforms: {
                gran: {type: "f", value: 100},
                texture: {type: "t", value: this.rtTexture},
                center: {type: "v2v", value: this.centerSet}
            },
            vertexShader: document.getElementById( 'myVertexShader' ).textContent,
            fragmentShader: '#define CENTER_MAX  ' + this.centerMaxSize + '\n' + document.getElementById( 'myFragmentShader' ).textContent} 
        );
        var plane = new THREE.PlaneBufferGeometry( 300,300 );  // width, height
        var quad = new THREE.Mesh (plane, this.rttmaterial);
        this.sceneScrene.add (quad);

        //this.centerSet[0] = new THREE.Vector2(1200,50);
        //this.centerSet[1] = new THREE.Vector2(1300,50);
        
    }

    updateTime(dt){
        this.time -= dt;
        this.planeTimeMat.uniforms.pos.value = -(window.innerWidth / 4 - 70) + ((window.innerWidth / 4 - 70) * 2) * (60 - this.time) / 60;
    }

    updateMiniMapPos(playPosX,playPosZ,rot){
        this.cameraHUD2.position.set(playPosX,15,playPosZ);
        this.cameraHUD2.rotation.z = rot + Math.PI / 2 * 3;

        //console.log(playPosX + ' ' + 15 + ' ' + playPosZ);
    }

    updateCenter(playPosX,playPosZ,rot,maze){
        let playXPercent = 0.5;
        let playYPercent = 0.5;
        let playMiniMapX;
        let playMiniMapY;

        this.centerSet3[this.nowCenterSet].set(playPosX,0,playPosZ);

        for(let i = 0; i < this.centerMaxSize; i++){
            let prePos = this.centerSet3[i].clone();
            let nowPos = new THREE.Vector3(playPosX,0,playPosZ);

            let t = prePos.clone().sub(nowPos).applyAxisAngle(new THREE.Vector3(0,1,0),-rot);

            playXPercent = t.z / (maze.n * maze.width / 2) + 0.5;
            playYPercent = t.x / (maze.m * maze.width / 2) + 0.5;
              
            playMiniMapX = window.innerWidth * 0.3 * playXPercent + window.innerWidth * 0.7;
            playMiniMapY = window.innerHeight * 0.3 * playYPercent;

            this.rttmaterial.uniforms.center.value[i].copy(new THREE.Vector2(playMiniMapX,playMiniMapY));
        }
        
        this.nowCenterSet++;
        this.nowCenterSet %= this.centerMaxSize;
    }
}

export default HUD