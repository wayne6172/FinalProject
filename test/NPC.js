import * as THREE from 'three'
import {scene} from './initScene.js'
import Car from './Car.js'


// 注意，使用A star時 this.target要從主程式設定
class NPC extends Car{
    constructor(maze,bodycolor,textName ,startCell = 0, traversMode = 0,camera = null){
        super(maze,bodycolor,textName,startCell,camera);

        this.NPCStateTable = Object.freeze({"initState" : 1,"findNextPoint" : 2,"GoToPoint" : 3});
        this.NPCState = this.NPCStateTable.initState;
        this.isTraverse = new Array(maze.m * maze.n);   // use to random DFS
        this.targetNode = new THREE.Vector3();
        this.target = 0;
        this.stackPath = [];        // use to random DFS
        this.frontNode = -1;        // use to left traverse
        this.speed = 120;
        this.traversMode = traversMode;
        this.traversModeTable = Object.freeze({"left": 0,"right": 1,"random": 2,"Astar": 3});
        this.AstarPath = [];
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

        if(this.targetNode.clone().sub(this.body.position).length() < 5){
            this.nowCell = this.target;
            return true;
        }
        return false;
    }

    initAstarPath(){
        let openList = [];
        let closeList = [];
        openList.push({NodeName: 0, NodeValue: 0, Parent: -1});
        while(openList.length > 0){
            let n = openList[0];
            let pos = 0;
            for(let i = 1; i < openList.length; i++){
                if(n.NodeValue > openList[i].NodeValue){
                    n = openList[i];
                    pos = i;
                }
            }
            openList.splice(pos,1);

            closeList.push(n);

            if(n.NodeName === this.target){
                let now = this.target;

                for(let i = closeList.length - 1; i >= 0;){
                    while(i >= 0 && closeList[i].NodeName !== now)i--;
                    if(now === this.nowCell)break;

                    this.AstarPath.push(now);
                    now = closeList[i].Parent;
                }
                document.getElementById('hint').innerHTML = '最短路徑為' + this.AstarPath.length;
                return;
            }

            for(let i = 0; i < 4; i++){
                if(this.maze.graph[n.NodeName][i] !== null){
                    let dis = n.NodeValue + 1;
                    let ref = Math.abs(Math.floor(this.target / this.maze.n) - Math.floor(this.maze.graph[n.NodeName][i] / this.maze.n)) + Math.abs(this.target % this.maze.n - this.maze.graph[n.NodeName][i] % this.maze.n);
                    
                    let find = false;
                    for(let j = 0; j < openList.length; j++){
                        if(openList[j].NodeName === this.maze.graph[n.NodeName][i]){
                            find = true;
                            openList[j].NodeValue = openList[j].NodeValue > dis + ref ? dis + ref : openList[j].NodeValue;
                        }
                    }
                    for(let j = 0; j < closeList.length; j++){
                        if(closeList[j].NodeName === this.maze.graph[n.NodeName][i])
                            find = true;
                    }

                    if(!find){
                        let temp = {NodeName: this.maze.graph[n.NodeName][i], NodeValue: dis + ref, Parent: n.NodeName};
                        openList.push(temp);
                    }
                }
            }
        }
        
    }

    findNextPoint_Astar(){
        if(this.AstarPath.length === 0)return false;
        this.target = this.AstarPath.pop();
        this.targetNode.copy(this.maze.getNodeToPos(this.target));
        return true;
    }

    update(dt){
        let res;
        switch (this.NPCState) {
            case this.NPCStateTable.initState:
                switch(this.traversMode){
                    case this.traversModeTable.Astar:
                        this.initAstarPath();
                    break;
                    default:
                        this.isTraverse.fill(false);
                        this.isTraverse[this.nowCell] = true;   
                    break;
                }
                this.NPCState = this.NPCStateTable.findNextPoint;
            case this.NPCStateTable.findNextPoint:
                switch(this.traversMode){
                    case this.traversModeTable.left:
                        res = this.findNextPoint_Left();
                    break;
                    case this.traversModeTable.right:
                        res = this.findNextPoint_Right();
                    break;
                    case this.traversModeTable.Astar:
                        res = this.findNextPoint_Astar();
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