class AnimateKey{
	constructor(){
    	this.start = null;
        this.end = null;
    }
    
    update(){
    	let move = this.end.clone().sub(this.start).multiplyScalar(0.08);
       	move = this.start.clone().add(move);
        
        return move;
    }
}

export default AnimateKey