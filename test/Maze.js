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
    }

    initMaze(m,n,width,thickness,wallHeight){
        this.initData(m,n);

        let loader = new THREE.TextureLoader();
        loader.crossOrigin = '';
        let textureOutX = loader.load('./texture/wall/1000-1000-2.jpg');
        let textureOutY = loader.load('./texture/wall/1000-1000-2.jpg');
        let textureOutZ = loader.load('./texture/wall/1000-1000-2.jpg');
        let textureInZ = loader.load('./texture/wall/1000-1000-2.jpg');
        let textureInY = loader.load('./texture/wall/1000-1000-2.jpg');

        textureOutX.wrapS = textureOutX.wrapT = textureOutY.wrapS = textureOutY.wrapT = textureOutZ.wrapS = textureOutZ.wrapT = THREE.RepeatWrapping;
        textureOutX.repeat.set(thickness / wallHeight, 1);
        textureOutY.repeat.set(n, 50 / 1000);
        textureOutZ.repeat.set(n, 1);

        textureInY.repeat.set(1,50 / 1000);

        let matArrayOut = [];
        matArrayOut.push(new THREE.MeshPhongMaterial({map: textureOutX}),
            new THREE.MeshPhongMaterial({map: textureOutX}),
            new THREE.MeshPhongMaterial({map: textureOutY}),
            new THREE.MeshPhongMaterial({map: textureOutY}),
            new THREE.MeshPhongMaterial({map: textureOutZ}),
            new THREE.MeshPhongMaterial({map: textureOutZ})
        );

        let matArrayIn = [];
        matArrayIn.push(new THREE.MeshPhongMaterial({map: textureOutX}),
            new THREE.MeshPhongMaterial({map: textureOutX}),
            new THREE.MeshPhongMaterial({map: textureInY}),
            new THREE.MeshPhongMaterial({map: textureInY}),
            new THREE.MeshPhongMaterial({map: textureInZ}),
            new THREE.MeshPhongMaterial({map: textureInZ})
        );

        var topWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),matArrayOut);
        var bottomWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),matArrayOut);
        var leftWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),matArrayOut);
        var rightWall = new THREE.Mesh(new THREE.BoxGeometry(n * width,wallHeight,thickness),matArrayOut);
        
        leftWall.rotation.y = rightWall.rotation.y = Math.PI / 2;

        topWall.position.set(n * width / 2,wallHeight / 2,0);
        bottomWall.position.set(n * width / 2,wallHeight / 2,m * width);
        leftWall.position.set(0,wallHeight / 2,m * width / 2);
        rightWall.position.set(n * width, wallHeight / 2, m * width / 2);

        scene.add(topWall,bottomWall,leftWall,rightWall);
        this.wall.push(topWall,bottomWall,leftWall,rightWall);

        var i;
        /*init Graph use adjency list*/
        
        for(i = 0; i < m * n; i++){
            var temp = new Array(4);
            temp.fill(null);

            if(i - n >= 0) // top
                temp[0] = i - n;
            if(i % n !== 0) // left
                temp[1] = i - 1;
            if(i + n < m * n) // bottom
                temp[2] = i + n; 
            if((i + 1) % n !== 0) // right
                temp[3] = i + 1;
            
            this.graph.push(temp);
        }
        
        ///////////row/////////////
        for (i = 0; i < this.row.length; i++) {
            let wallclone = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thickness), matArrayIn);
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

            this.graph[left][this.graph[left].indexOf(right)] = null;
            this.graph[right][this.graph[right].indexOf(left)] = null;
        }
        ////////////////col/////////////////////  
        for (i = 0; i < this.col.length; i++) {
            let wallclone = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thickness), matArrayIn);
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

            this.graph[top][this.graph[top].indexOf(bottom)] = null;
            this.graph[bottom][this.graph[bottom].indexOf(top)] = null;
        }

        this.wall.forEach(function(e){
            e.traverse(function(t){
                if(t instanceof THREE.Mesh)
                    t.castShadow = t.receiveShadow = true;
            })
        });
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

        while(walls.length > 75){
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

        this.pushInGraph(a,b);
        this.pushInGraph(b,a);
        
        
        return;
        var start = a;

        var path = [];
        for(let i = 0; i < 4; i++){
            if(this.graph[a][i] !== null){
                let x = DFS(this.graph,a,this.graph[a][i]);
                if(x !== -1){
                    path.push(x);
                    break;
                }
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

        this.graph[a][this.graph[a].indexOf(b)] = null;
        this.graph[b][this.graph[b].indexOf(a)] = null;
        
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
            console.log(now);
            if(now === start)return now;
            else {
                for(let i = 0; i < 4; i++){
                    if(data[now][i] !== null && data[now][i] !== front){
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

    getNodeToPos(n){
        let x = (n % this.n * this.width) + this.width / 2;
        let z = (Math.floor(n / this.n) * this.width) + this.width / 2;
        
        return new THREE.Vector3(x,0,z);
    }

    pushInGraph(a,b){
        if(a - this.n === b)
            this.graph[a][0] = b;
        else if(a - 1 === b)
            this.graph[a][1] = b;
        else if(a + this.n === b)
            this.graph[a][2] = b;
        else if(a + 1 === b)
            this.graph[a][3] = b;
        else console.log("pushInGraph function Error!!!");
    }
}

export {Maze}