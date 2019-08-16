import {scene} from './initScene.js'
import * as THREE from 'three'

class Car{
    constructor(maze,bodycolor,startCell = 0,camera = null){
        this.nowCell = startCell;
        this.width = 10;
        this.body = this.buildBody(bodycolor);
        this.maze = maze;
        this.rot = 0;
        this.speed = 0;

        if(camera){
            camera.position.set(-40,60,0);
            camera.lookAt(this.body.position.clone().add(new THREE.Vector3(-5,100,0)).sub(camera.position));
            this.body.add(camera);
        }
        
        this.body.position.copy(this.maze.getNodeToPos(startCell));

        scene.add(this.body);
    }

    buildBody(bodycolor){
        let body = new THREE.Object3D();
        let a = new THREE.Mesh(new THREE.CylinderGeometry(this.width,this.width,10,64),new THREE.MeshBasicMaterial({color: new THREE.Color(bodycolor)}));
        let b = new THREE.Mesh(new THREE.BoxGeometry(this.width * 2,10,6),new THREE.MeshBasicMaterial({color: new THREE.Color(bodycolor)}));
        b.position.set(this.width,0,0);
        a.add(b);
        a.position.y = 5;

        body.add(a);

        return body;
    }

    update(dt,keyboard){
        keyboard.update();

        if(keyboard.pressed('right')){
            this.rot -= 0.03;
        }
        if(keyboard.pressed('left')){
            this.rot += 0.03;
        }
        if(keyboard.pressed('up')){
            this.speed += 0.2;
        }
        if(keyboard.pressed('down')){
            this.speed -= 0.2;
        }

        let vel = new THREE.Vector3(this.speed, 0, 0);
        vel.applyAxisAngle(new THREE.Vector3(0,1,0), this.rot);
        
        this.body.rotation.y = this.rot;
        let nextPos = this.body.position.clone().add(vel.clone().multiplyScalar(dt));
        if(this.checkNextPos(nextPos)){
            this.body.position.add(vel.clone().multiplyScalar(dt));

            let j = Math.floor(nextPos.x / this.maze.width);
            let i = Math.floor(nextPos.z / this.maze.width);
            this.nowCell = i * this.maze.n + j;
        }
        else this.speed /= 2;
        
    }

    checkNextPos(nextPos){
        let mazeWidth = this.maze.width * this.maze.n;
        let mazeDepth = this.maze.width * this.maze.m;
        if(nextPos.x >= 0 + this.width && nextPos.z >= 0 + this.width && nextPos.x <= mazeWidth - this.width && nextPos.z <= mazeDepth - this.width){
            let dir = [[1,1],[-1,1],[1,-1],[-1,-1]];

            for(let k = 0; k < 4; k++){
                let j = Math.floor((nextPos.x + dir[k][0] * this.width) / this.maze.width);
                let i = Math.floor((nextPos.z + dir[k][1] * this.width) / this.maze.width);

                let nextCell = i * this.maze.n + j;
                if(nextCell !== this.nowCell && !this.maze.check(nextCell,this.nowCell))
                    return false;
            }
            
            return true;
        }

        return false;
    }
}

export default Car;