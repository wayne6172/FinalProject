import {scene} from './initScene.js'
import * as THREE from 'three'
import THREE_Text from './text2D.js'
import AnimateKey from './AnimateKey.js'

class Car{
    constructor(maze,model,textName = null,startCell = 0,camera = null){
        this.nowCell = startCell;
        this.width = 10;
        this.model = model

        this.text = null;
        this.body = this.buildBody(model,textName);
        this.maze = maze;
        this.rot = Math.PI / 2;
        this.speed = 0;
        this.camera = camera;
        this.animateKey = new AnimateKey();
        this.cameraLookPoint = new THREE.Object3D();
        this.cameraLookPoint.position.set(50,10,0);
        this.body.add(this.cameraLookPoint);
        this.state = {
            "stateName" : "Normal",
            "keepTime" : Infinity
        };
        //this.cameraLookPoint.add(new THREE.AxesHelper(30));
        //scene.add(this.cameraLookPoint);

        if(camera){
            camera.position.set(-80,70,0);
            camera.lookAt(this.cameraLookPoint.getWorldPosition(new THREE.Vector3()));
            this.body.add(camera);
        }
        
        this.body.position.copy(this.maze.getNodeToPos(startCell));

        scene.add(this.body);
    }

    changeText(text){
        this.body.remove(this.text);
        scene.remove(this.text);

        this.text = new THREE_Text.SpriteText2D("  " + text,{
            align: THREE_Text.textAlign.center,
            font: '40px Arial',
            fillStyle: '#ff0000',
            antialias: true
        });

        this.text.position.set(0,60,0);
        this.text.scale.set(0.5,0.5,0.5);
        scene.add(this.text);
        this.body.add(this.text);
    }

    buildBody(model,textName){
        let body = new THREE.Object3D();
        let mat = new THREE.TextureLoader().load('./texture/soft_shadow.png');

        let shadow = new THREE.Mesh(new THREE.PlaneGeometry(15.5,15.5),new THREE.MeshBasicMaterial({
            map: mat,
            transparent: true,
        }));

        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 3;
        
        

        body.add(model.body);
        body.add(shadow);

        if(this.model.actions['Running'] !== undefined){
            this.activeAction = this.model.actions['Running'];
            model.body.scale.set(5,5,5);
            model.body.rotation.y = Math.PI / 2;
        }
        else {
            this.activeAction = this.model.actions['Run'];
            model.body.scale.set(25,25,25);
            model.body.rotation.y = -Math.PI / 2;
        }
        this.activeAction.play();

        

        if(textName !== null){
            this.text = new THREE_Text.SpriteText2D("  " + textName,{
                align: THREE_Text.textAlign.center,
                font: '40px Arial',
                fillStyle: '#ff0000',
                antialias: true
            });

            this.text.position.set(0,60,0);
            this.text.scale.set(0.5,0.5,0.5);
            body.add(this.text);
        }

        body.traverse(function(e){
            if(e instanceof THREE.Mesh)
                e.castShadow = e.receiveShadow = true;
        });

        return body;
    }

    update(dt,keyboard,pickables){
        this.model.mixer.update(dt);
        if(this.state.stateName === "Normal")
            this.normalUpdate(keyboard,pickables);
        else if(this.state.stateName === "Dead"){
            if(this.state.keepTime < 0){        //0
                this.state.stateName = "Normal";    
                this.state.keepTime = Infinity;
            }
            else if(this.state.keepTime < 1){       // 0~1
                this.fadeToAction("Idle",1.0);
                this.state.keepTime -= dt;
            }
            else {      // >= 1
                this.fadeToAction("Death",0.5);
                this.state.keepTime -= dt;
            }
        }
    }

    normalUpdate(keyboard,pickables){
        var nextPos = this.body.position.clone();
        let action = "Idle";

        if(keyboard.pressed('right')){
            this.rot -= 0.06;
            action = "Walking";
        }
        if(keyboard.pressed('left')){
            this.rot += 0.06;
            action = "Walking";
        }
        if(keyboard.pressed('up')){
            nextPos = this.body.position.clone().add(new THREE.Vector3(2,0,0).applyAxisAngle(new THREE.Vector3(0,1,0), this.rot));
            action = "Running";
        }
        if(keyboard.pressed('down')){
            nextPos = this.body.position.clone().add(new THREE.Vector3(-2,0,0).applyAxisAngle(new THREE.Vector3(0,1,0), this.rot));
            action = "Running";
        }

        if(this.model !== null){
            this.fadeToAction(action,0.15)
        }

        this.body.rotation.y = this.rot;
        
        if(this.checkNextPos(nextPos)){
            this.body.position.copy(nextPos);

            let j = Math.floor(nextPos.x / this.maze.width);
            let i = Math.floor(nextPos.z / this.maze.width);
            this.nowCell = i * this.maze.n + j;
        }

        if(this.camera){
            this.animateKey.start = this.camera.position.clone();
            this.camera.position.set(-80,70,0);

            let rayCaster = new THREE.Raycaster(this.camera.getWorldPosition(new THREE.Vector3()),
                this.body.position.clone().sub(this.camera.getWorldPosition(new THREE.Vector3())).normalize());
            rayCaster.far = this.camera.position.length();
            var intersects = rayCaster.intersectObjects(pickables);

            let cameraIntPos = new THREE.Vector3(-80,70,0);
            if(intersects.length > 0){
                cameraIntPos.sub(new THREE.Vector3(-80,70,0).normalize().multiplyScalar(intersects[intersects.length - 1].distance));
                let x = cameraIntPos.x;
                let z = cameraIntPos.z;
                let len = new THREE.Vector3(-80,70,0).length()
                
                cameraIntPos.y = Math.sqrt(len * len - (x * x + z * z));
            }
            this.animateKey.end = cameraIntPos;
            this.camera.position.copy(this.animateKey.update());
            this.camera.lookAt(this.cameraLookPoint.getWorldPosition(new THREE.Vector3()));
        }
    }

    fadeToAction(name,duration){
        if(this.previousAction == this.model.actions[name])
            return;

        this.previousAction = this.activeAction;
        this.activeAction = this.model.actions[ name ];
        this.previousAction.fadeOut( duration );

        this.activeAction
            .reset()
            .setEffectiveTimeScale( 1 )
            .setEffectiveWeight( 1 )
            .fadeIn( duration )
            .play();
    }

    checkNextPos(nextPos){
        let mazeWidth = this.maze.width * this.maze.n;
        let mazeDepth = this.maze.width * this.maze.m;
        if(nextPos.x >= 0 + this.width && nextPos.z >= 0 + this.width && nextPos.x <= mazeWidth - this.width && nextPos.z <= mazeDepth - this.width){
            let dir = [[1,0],[0,1],[-1,0],[0,-1]];
            let t = 0;

            for(let k = 0; k < 4; k++){
                let j = Math.floor((nextPos.x + dir[k][0] * this.width) / this.maze.width);
                let i = Math.floor((nextPos.z + dir[k][1] * this.width) / this.maze.width);

                let nextCell = i * this.maze.n + j;
                

                if(Math.abs(nextCell - this.nowCell) <= 1 || Math.abs(nextCell - this.nowCell) % this.maze.n === 0){
                    if(nextCell !== this.nowCell && !this.maze.check(nextCell,this.nowCell)){
                        console.log(nextCell + ' ' + this.nowCell);
                        return false;
                    }
                }               
            }
            
            
            return true;
        }

        return false;
    }
}

export default Car;