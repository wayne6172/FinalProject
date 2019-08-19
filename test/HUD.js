import * as THREE from 'three'

class HUD{
    constructor(target,mazeTotalWidth) {
        this.initHUD(mazeTotalWidth);

        //target.add(this.cameraHUD2);
    }

    initHUD(mazeTotalWidth){
        mazeTotalWidth /= 2;
        this.sceneHUD = new THREE.Scene();
        this.cameraHUD1 = new THREE.OrthographicCamera(-10.1,10.1,10.1,-10.1,1,50);
        this.cameraHUD2 = new THREE.OrthographicCamera(-mazeTotalWidth, mazeTotalWidth, mazeTotalWidth, -mazeTotalWidth, -350, 350);
        this.cameraHUD2.position.set(mazeTotalWidth,15,mazeTotalWidth);
        this.cameraHUD2.up.set(1,0,0);
        this.cameraHUD2.lookAt(new THREE.Vector3(mazeTotalWidth,0,mazeTotalWidth));


        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(
            new THREE.Vector3(-10,-10,0),
            new THREE.Vector3(10,-10,0),
            new THREE.Vector3(10,10,0),
            new THREE.Vector3(-10,10,0),
            new THREE.Vector3(-10,-10,0),
        );

        var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color: 0xffffff}));
        this.sceneHUD.add(line);
    }
}

export default HUD