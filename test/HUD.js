import * as THREE from 'three'

class HUD{
    constructor(target) {
        this.initHUD();

        target.add(this.cameraHUD2);
    }

    initHUD(){
        this.sceneHUD = new THREE.Scene();
        this.cameraHUD1 = new THREE.OrthographicCamera(-10.1,10.1,10.1,-10.1,1,50);
        this.cameraHUD2 = new THREE.OrthographicCamera(-250, 250, 250, -250, -350, 350);
        this.cameraHUD2.position.set(0,15,0);
        this.cameraHUD2.up.set(1,0,0);
        this.cameraHUD2.lookAt(new THREE.Vector3());


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