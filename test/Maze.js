import * as THREE from 'three'
import {scene} from './initScene.js'

class Maze{
    // 製作一個M X N的迷宮，每個寬度為width，牆壁厚度為thickness，其高度為wallHeight
    constructor(m,n,width,thickness,wallHeight){
        this.m = m;
        this.n = n;
        this.width = width;
        this.thickness = thickness;
        this.wallHeight = wallHeight;
        this.row = [];
        this.col = [];
        this.wall = [];
        this.graph = [];

        this.initMaze(m,n,width,thickness,wallHeight);


        console.log(this.graph);
    }

    initMaze(m,n,width,thickness,wallHeight){
        this.initData(m,n);

        //var totalinWall = new THREE.Object3D();
        //var mat = new THREE.MeshNormalMaterial();
        var insideWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thickness), new THREE.MeshNormalMaterial());
        
        var topWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),new THREE.MeshNormalMaterial());
        var bottomWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),new THREE.MeshNormalMaterial());
        var leftWall = new THREE.Mesh(new THREE.BoxGeometry(thickness,wallHeight,m * width),new THREE.MeshNormalMaterial());
        var rightWall = new THREE.Mesh(new THREE.BoxGeometry(thickness,wallHeight,m * width),new THREE.MeshNormalMaterial());
        
        topWall.position.set(n * width / 2,wallHeight / 2,0);
        bottomWall.position.set(n * width / 2,wallHeight / 2,m * width);
        leftWall.position.set(0,wallHeight / 2,m * width / 2);
        rightWall.position.set(n * width, wallHeight / 2, m * width / 2);

        scene.add(topWall,bottomWall,leftWall,rightWall);
        this.wall.push(topWall,bottomWall,leftWall,rightWall);

        var i;
        /*init Graph use adjency list*/
        
        for(i = 0; i < m * n; i++){
            var temp = [];

            if(i - n >= 0) // top
                temp.push(i - n);
            if(i % n !== 0) // left
                temp.push(i - 1);
            if((i + 1) % n !== 0) // right
                temp.push(i + 1);
            if(i + n < m * n) // bottom
               temp.push(i + n); 
            
            this.graph.push(temp);
        }
        
        ///////////row/////////////
        for (i = 0; i < this.row.length; i++) {
            let wallclone = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thickness), new THREE.MeshNormalMaterial());
            wallclone.position.x = (this.row[i][1]) * width;
            wallclone.position.z = this.row[i][0] * width + (width / 2);
            wallclone.position.y = wallHeight / 2;
            wallclone.rotation.y = Math.PI / 2;

            // update graph
            let left = (this.row[i][1] - 1) + n * this.row[i][0];
            let right = this.row[i][1] + n * this.row[i][0];

            wallclone.mazeData = {
                isRow: true,
                frontPoint: left,
                nextPoint: right
            }

            this.wall.push(wallclone);
            scene.add(wallclone);

            this.graph[left].splice(this.graph[left].indexOf(right),1);
            this.graph[right].splice(this.graph[right].indexOf(left),1);
        }
        ////////////////col/////////////////////  
        for (i = 0; i < this.col.length; i++) {
            let wallclone = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thickness), new THREE.MeshNormalMaterial());
            wallclone.position.z = (this.col[i][1]) * width;
            wallclone.position.x = this.col[i][0] * width + (width / 2);
            wallclone.position.y = wallHeight / 2;
            //wallclone.rotation.y = Math.PI/2;

            // update graph
            let top = (this.col[i][1] - 1) * n + this.col[i][0];
            let bottom = this.col[i][1] * n + this.col[i][0];

            wallclone.mazeData = {
                isRow: false,
                frontPoint: top,
                nextPoint: bottom
            }

            this.wall.push(wallclone);
            scene.add(wallclone);

            this.graph[top].splice(this.graph[top].indexOf(bottom),1);
            this.graph[bottom].splice(this.graph[bottom].indexOf(top),1);
        }
    }

    // use kruskal's algorithm
    initData(m,n){
        var sets = [];
        var walls = [];

        for(let i = 0; i < m * n; i++)
            sets.push(i);
        
        for(let i = 0; i < m; i++){
            for(let j = 1; j < n; j++){
                walls.push([0,i,j]);
            }
        }

        for(let i = 0; i < n; i++){
            for(let j = 1; j < m; j++){
                walls.push([1,i,j]);
            }
        }

        while(walls.length > 0){
            let choose = Math.floor((walls.length * Math.random()));
            let a,b;

            //console.log('walls length: ' + walls.length);
            //console.log('choose:' + choose);
            if(walls[choose][0] === 0){
                a = walls[choose][1] * n + walls[choose][2] - 1;
                b = walls[choose][1] * n + walls[choose][2];
            }
            else {
                a = (walls[choose][2] - 1) * n + walls[choose][1];
                b = walls[choose][2] * n + walls[choose][1];
            }

            if(sets[a] === -1 || sets[b] === -1 || !Union_set(a,b)){
                if(walls[choose][0] === 0)
                    this.row.push([walls[choose][1],walls[choose][2]]);
                else
                    this.col.push([walls[choose][1],walls[choose][2]]);
            }
            
            let temp = walls[choose];
            walls[choose] = walls[walls.length - 1];
            walls[walls.length - 1] = temp;

            walls.pop();
        }


        function Union_set(x,y){
            var a = find(x);
            var b = find(y);

            if(a !== b){
                sets[b] = a;
                return true;
            }
            else return false;
        }

        function find(n){
            if(n == sets[n])
                return n;
            return sets[n] = find(sets[n]);
        }
    }


    /*
        data = {isRow, frontPoint, nextPoint}
    */
    removeWall(data){       //還沒做出row,col的刪除，pickable的刪除狀況，
        let a = data.frontPoint;
        let b = data.nextPoint;

        
        let x = Math.floor(a / this.n);
        let y = a % this.n + 1;

        if(b - a === 1){
            let i;
            for(i = 0; i < this.row.length; i++)
                if(this.row[i][0] === x && this.row[i][1] === y)
                    break;
            this.row.splice(i,1);
        }
        else {
            let i;
            for(i = 0; i < this.col.length; i++)
                if(this.col[i][0] === x && this.col[i][1] === y)
                    break;
            this.col.splice(i,1);
        }

        this.graph[a].push(b);
        this.graph[b].push(a);
        
        var start = a;

        var path = [];
        for(let i = 0; i < this.graph[a].length; i++){
            let x = DFS(this.graph,a,this.graph[a][i]);
            if(x !== -1){
                path.push(x);
                break;
            }
        }

        let choose = Math.floor((path.length * Math.random()));
        if(choose + 1 === path.length){
            a = path[choose];
            b = path[0];
        }
        else {
            a = path[choose];
            b = path[choose + 1];
        }

        if(a > b){
            let temp = a;
            a = b;
            b = temp;
        }

        this.graph[a].splice(this.graph[a].indexOf(b),1);
        this.graph[b].splice(this.graph[b].indexOf(a),1);

        let wallclone = new THREE.Mesh(new THREE.BoxGeometry(this.width, this.wallHeight, this.thickness), new THREE.MeshNormalMaterial());

        if(b - a === 1){      //add row
            let x = Math.floor(a / this.n);
            let y = a % this.n + 1;
            

            this.row.push([x,y]);
            
            wallclone.position.x = y * this.width;
            wallclone.position.z = x * this.width + (this.width / 2);
            wallclone.position.y = this.wallHeight / 2;
            wallclone.rotation.y = Math.PI / 2;

            wallclone.mazeData = {
                isRow: true,
                frontPoint: a,
                nextPoint: b
            }
        }
        else {          //add col
            let x = a % this.n;
            let y = Math.floor(a / this.n) + 1;

            this.col.push([x,y]);

            wallclone.position.z = y * this.width;
            wallclone.position.x = x * this.width + (this.width / 2);
            wallclone.position.y = this.wallHeight / 2;

            wallclone.mazeData = {
                isRow: false,
                frontPoint: a,
                nextPoint: b
            }
        }
        
        scene.add(wallclone);
        this.wall.push(wallclone);

        function DFS(data,front,now){
            if(now === start)return now;
            else {
                for(let i = 0; i < data[now].length; i++){
                    if(data[now][i] !== front){
                        var x = DFS(data,now,data[now][i]);

                        if(x !== -1){
                            path.push(x);
                            return now;
                        }
                    }
                }
                return -1;
            }
        }
    }

    check(a,b){
        if(this.graph[a].indexOf(b) < 0)
            return false;
        return true;
    }
}

export {Maze}