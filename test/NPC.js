import * as THREE from 'three'
import {scene} from './initScene.js'
import Car from './Car.js'

class NPC extends Car{
    constructor(maze,camera = null,startCell = 0){
        super(maze,camera,startCell);

        this.NPCStateTable = Object.freeze({"initState" : 1,"findNextPoint" : 2,"GoToPoint" : 3});
        this.NPCState = this.NPCStateTable.initState;
        this.isTraverse = new Array(maze.m * maze.n);
        this.targetNode = new THREE.Vector3();
        this.target = 0;
        this.stackPath = [];
        this.speed = 60;
    }

    findNextPoint(){
        // use DFS

        this.isTraverse[this.nowCell] = true;

        let node, find = false;
        for(let i = 0; i < this.maze.graph[this.nowCell].length; i++){
            if(!this.isTraverse[this.maze.graph[this.nowCell][i]]){
                this.stackPath.push(this.nowCell);
                node = this.maze.graph[this.nowCell][i];
                find = true;
                break;
            }
        }

        if(!find && this.stackPath.length == 0){
            return false;
        }
        else if(!find){
            node = this.stackPath[this.stackPath.length - 1]
            this.stackPath.pop();
        }

        this.target = node;
        this.targetNode.copy(this.maze.getNodeToPos(node));

        return true;
    }

    GoToPoint(dt){
        let vel = this.targetNode.clone().sub(this.body.position).normalize().multiplyScalar(dt * this.speed);
        
        this.body.position.add(vel);

        this.body.rotation.y = Math.acos(vel.x / vel.length());
        if(vel.z > 0)
            this.body.rotation.y *= -1;

        if(this.targetNode.clone().sub(this.body.position).length() < 3){
            this.nowCell = this.target;
            return true;
        }
        return false;
    }

    update(dt){
        let res;
        switch (this.NPCState) {
            case this.NPCStateTable.initState:
                this.isTraverse.fill(false);
                this.isTraverse[this.nowCell] = true;
                this.NPCState = this.NPCStateTable.findNextPoint;
            case this.NPCStateTable.findNextPoint:
                res = this.findNextPoint();
                if(res)
                    this.NPCState = this.NPCStateTable.GoToPoint;
                else {
                    this.NPCState = this.NPCStateTable.initState;
                    break;
                }
                    
            case this.NPCStateTable.GoToPoint:
                res = this.GoToPoint(dt);
                if(res)
                    this.NPCState = this.NPCStateTable.findNextPoint;
            break;
        }
    }
}

export default NPC