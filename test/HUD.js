import * as THREE from 'three'
import myPlaneTimeVertex from './GLSL/myPlaneTimeVertex.glsl'
import myPlaneTimeFragment from './GLSL/myPlaneTimeFragment.glsl'
import myMinimapVertex from './GLSL/myMinimapVertex.glsl'
import myMinimapFragment from './GLSL/myMinimapFragment.glsl'

class HUD{
    constructor(mazeTotalWidth,gameTime) {
        this.centerMaxSize = 1000;
        this.centerSet = new Array(this.centerMaxSize);
        this.centerSet3 = new Array(this.centerMaxSize);

        this.nowCenterSet = 0;
        for(let i = 0; i < this.centerMaxSize; i++){
            this.centerSet[i] = new THREE.Vector2();
            this.centerSet3[i] = new THREE.Vector3();
        }

        this.initHUD(mazeTotalWidth);
        this.initScrene();
        this.gameTime = gameTime;
        this.time = gameTime;
        this.alertTime = gameTime * 0.1;

        //target.add(this.cameraHUD2);
    }

    initHUD(mazeTotalWidth){
        mazeTotalWidth /= 2;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        this.sceneHUD = new THREE.Scene();
        this.initSceneHUD(windowWidth,windowHeight);

        this.cameraHUD1 = new THREE.OrthographicCamera(-windowWidth / 2,windowWidth / 2,windowHeight / 2,-windowHeight / 2,1,50);
        this.cameraHUD2 = new THREE.OrthographicCamera(-windowWidth / 6, windowWidth / 6, windowHeight / 6, -windowHeight / 6, -50, 350);
        this.cameraHUD3 = new THREE.OrthographicCamera(-mazeTotalWidth, mazeTotalWidth, mazeTotalWidth, -mazeTotalWidth, -50, 350);

        this.cameraHUD2.position.set(mazeTotalWidth,15,mazeTotalWidth);
        this.cameraHUD2.up.set(1,0,0);
        this.cameraHUD2.lookAt(new THREE.Vector3(mazeTotalWidth,0,mazeTotalWidth));
        this.cameraHUD1.position.set(0,0,10);

        this.cameraHUD3.up.set(1,0,0);
        this.cameraHUD3.position.set(mazeTotalWidth,15,mazeTotalWidth);
        this.cameraHUD3.lookAt(new THREE.Vector3(mazeTotalWidth,0,mazeTotalWidth));

        /*var box = new THREE.Mesh(new THREE.BoxGeometry(500,500,5), new THREE.MeshNormalMaterial());
        this.sceneHUD.add(box);*/

        let width = window.innerWidth / 2;
        let height = window.innerHeight / 2;

        this.sceneMinimapHUD = new THREE.Scene();
        this.cameraMinimapHUD = new THREE.OrthographicCamera(-width - 0.5,width + 0.5,height + 0.5,-height - 0.5,1,10);
        this.cameraMinimapHUD.position.z = 5;

        let lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(
            new THREE.Vector3(-width, -height, 0),
            new THREE.Vector3(width, -height, 0),
            new THREE.Vector3(width, height, 0),
            new THREE.Vector3(-width, height, 0),
            new THREE.Vector3(-width, -height, 0)
        );
        let line = new THREE.Line(lineGeo,
            new THREE.LineBasicMaterial({
                color: 0xffffff
            })
        );

        this.sceneMinimapHUD.add(line);
    }

    initSceneHUD(width,height){
        let loader = new THREE.TextureLoader();
        var texture = loader.load('./texture/bomb.png');

        let plane = new THREE.Mesh(new THREE.PlaneGeometry(80,80), new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture
        }))
        plane.position.set(-width / 32 * 15,-height / 16 * 7,0);
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
            vertexShader: myPlaneTimeVertex,
            fragmentShader: myPlaneTimeFragment
        });

        let timePlane = new THREE.Mesh(new THREE.PlaneGeometry((width / 4 - 70) * 2, 40), 
                this.planeTimeMat);
        timePlane.position.set(-width / 32 * 8,-height / 16 * 7,0);
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
                minRange: {type: "f", value: 30},
                maxRange: {type: "f", value: 125},
                texture: {type: "t", value: this.rtTexture},
                center: {type: "v2v", value: this.centerSet}
            },
            vertexShader: myMinimapVertex,
            fragmentShader: '#define CENTER_MAX  ' + this.centerMaxSize + '\n' + myMinimapFragment} 
        );
        var plane = new THREE.PlaneBufferGeometry( 300,300 );  // width, height
        var quad = new THREE.Mesh (plane, this.rttmaterial);
        this.sceneScrene.add (quad);

        //this.centerSet[0] = new THREE.Vector2(1200,50);
        //this.centerSet[1] = new THREE.Vector2(1300,50);
        
    }

    updateTime(dt){
        this.time -= dt;
        this.planeTimeMat.uniforms.pos.value = (window.innerWidth / 4 - 70) + -((window.innerWidth / 4 - 70) * 2) * (this.gameTime - this.time) / this.gameTime;

        if(this.time < this.alertTime)
            this.planeTimeMat.uniforms.color.value.set(1,0,0);
        else 
            this.planeTimeMat.uniforms.color.value.set(0,1,0);
    }

    updateMiniMapPos(playPosX,playPosZ,rot){
        this.cameraHUD2.position.set(playPosX,15,playPosZ);
        this.cameraHUD2.rotation.z = rot + Math.PI / 2 * 3;

        //console.log(playPosX + ' ' + 15 + ' ' + playPosZ);
    }

    updateCenter(playPosX,playPosZ,rot,maze,openBigMap){
        let playXPercent = 0.5;
        let playYPercent = 0.5;
        let playMiniMapX;
        let playMiniMapY;

        this.centerSet3[this.nowCenterSet].set(playPosX,0,playPosZ);

        for(let i = 0; i < this.centerMaxSize; i++){
            let prePos = this.centerSet3[i].clone();
            let nowPos = new THREE.Vector3(playPosX,0,playPosZ);

            if(openBigMap){
                let t = prePos.sub(new THREE.Vector3(maze.n * maze.width / 2,0,maze.m * maze.width / 2))
                playXPercent = t.z / (maze.n * maze.width) + 0.5;
                playYPercent = t.x / (maze.m * maze.width) + 0.5;
                
                playMiniMapX = window.innerHeight * playXPercent + (window.innerWidth - window.innerHeight) * 0.5;
                playMiniMapY = window.innerHeight * playYPercent;

                this.rttmaterial.uniforms.minRange.value = 20.0;
                this.rttmaterial.uniforms.maxRange.value = 100.0;
            }
            else {
                let t = prePos.clone().sub(nowPos).applyAxisAngle(new THREE.Vector3(0,1,0),-rot);
            
                playXPercent = t.z / (window.innerWidth / 3) + 0.5;
                playYPercent = t.x / (window.innerHeight / 3) + 0.5;
                
                playMiniMapX = window.innerWidth * 0.3 * playXPercent + window.innerWidth * 0.7;
                playMiniMapY = window.innerHeight * 0.3 * playYPercent;

                this.rttmaterial.uniforms.minRange.value = 30.0;
                this.rttmaterial.uniforms.maxRange.value = 125.0;
            } 

            this.rttmaterial.uniforms.center.value[i].copy(new THREE.Vector2(playMiniMapX,playMiniMapY));
        }
        
        this.nowCenterSet++;
        this.nowCenterSet %= this.centerMaxSize;
    }
}

export default HUD