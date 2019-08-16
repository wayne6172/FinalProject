import * as THREE from 'three'
import {scene} from './initScene.js'
import Car from './Car.js'

class NPC extends Car{
    constructor(maze,bodycolor,startCell = 0, traversMode = 0,camera = null){
        super(maze,bodycolor,startCell,camera);

        this.NPCStateTable = Object.freeze({"initState" : 1,"findNextPoint" : 2,"GoToPoint" : 3});
        this.NPCState = this.NPCStateTable.initState;
        this.isTraverse = new Array(maze.m * maze.n);
        this.targetNode = new THREE.Vector3();
        this.target = 0;
        this.stackPath = [];        // use to random DFS
        this.frontNode = -1;        // use to left traverse
        this.speed = 60;
        this.traversMode = traversMode;
        this.traversModeTable = Object.freeze({"left": 0,"right": 1,"random": 2});
    }

    // use random DFS, it can't use to dynamic maze, except init all traversal
    findNextPoint_Random(){
        this.isTraverse[this.nowCell] = true;

        let node, find = false;
        for(let i = 0; i < this.maze.graph[this.nowCell].length; i++){
            if(this.maze.graph[this.nowCell][i] !== null && !this.isTraverse[this.maze.graph[this.nowCell][i]]){
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

    // use Left, it can use to dynamic maze
    findNextPoint_Left(){
        let node;
        
        node = (this.maze.graph[this.nowCell].indexOf(this.frontNode) + 3) % 4;
        for(let i = 0; i < 4; i++, node = (node + 3) % 4){
            if(this.maze.graph[this.nowCell][node] !== null)
                break;
        }
        
        this.frontNode = this.nowCell;
        this.target = this.maze.graph[this.nowCell][node];
        this.targetNode.copy(this.maze.getNodeToPos(this.target));


        return true;
    }

    findNextPoint_Right(){
        let node;
        
        node = (this.maze.graph[this.nowCell].indexOf(this.frontNode) + 1) % 4;
        for(let i = 0; i < 4; i++, node = (node + 1) % 4){
            if(this.maze.graph[this.nowCell][node] !== null)
                break;
        }
        
        this.frontNode = this.nowCell;
        this.target = this.maze.graph[this.nowCell][node];
        this.targetNode.copy(this.maze.getNodeToPos(this.target));


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
                switch(this.traversMode){
                    case this.traversModeTable.left:
                        res = this.findNextPoint_Left();
                    break;
                    case this.traversModeTable.right:
                        res = this.findNextPoint_Right();
                    break;
                }
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