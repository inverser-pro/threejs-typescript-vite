import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import settings from '../utils/settings'
import CarFunc from './CarFunc'

export function loadModel(
    path: string,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light
): Promise<THREE.Group>{
    const dracoLoader = new DRACOLoader();
    return new Promise((res,rej)=>{
        const loader = new GLTFLoader();
        dracoLoader.setDecoderPath(settings.dracoPath); // use a full url path
        loader.setDRACOLoader(dracoLoader);
        loader.load(path, (glb) => {
            CarFunc(glb.scene, scene, camera, light)
        }, undefined, rej)
    })
}