import * as THREE from 'three';

const CarFunc=(model: THREE.Group, scene: THREE.Scene)=>{
    scene.add(model);
    console.log(model);
    model.translateY(1.148)
    
}
export default CarFunc;