import * as THREE from 'three';

const CarFunc=(
    model: THREE.Group,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light
)=>{

    let acceleration: number        = .01;
    let stringAngle : number        = 0;
    let velocity    : THREE.Vector3 = new THREE.Vector3(0,0,0);
    let direction   : THREE.Vector3 = new THREE.Vector3(0,0,1);
    let wheels: THREE.Object3D[]    = [];

    scene.add(model);
    model.translateY(-.025)
    
    window.addEventListener('keydown', e=>onKeyDown(e));
    window.addEventListener('keyup', e=>onKeyUp(e));

    model.traverse(child => {
        if(child?.name?.includes('wheel')){
            wheels.push(child);
        }
    })

    function onKeyDown(e :KeyboardEvent){
        switch (e.key){
            case 'ArrowUp':
                accelerate(1);
                break;
            case 'ArrowDown':
                accelerate(-1);
                break;
            case 'ArrowLeft':
                steer(.1);
                break;
            case 'ArrowRight':
                steer(-.1);
                break;
        }
    }

    function onKeyUp(e :KeyboardEvent){
        switch (e.key){
            case 'ArrowUp':
            case 'ArrowDown':
                accelerate(0);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                steer(0);
                break;
        }
    }

    function accelerate(val: number){
        velocity.z += val * acceleration;
        
    }

    function steer(val: number){
        stringAngle = val;
        steerWheel(stringAngle);
    }

    function steerWheel(angle: number){
        wheels[0].rotation.y = angle;
        wheels[1].rotation.y = angle

        // const axis = new THREE.Vector3(-1, 0, 0); // Вектор оси, например, Y-ось
        // angle = Math.PI / 2 * angle; // Угол поворота в радианах (например, 45 градусов)

        // // Создаем кватернион для поворота
        // const quaternion = new THREE.Quaternion();
        // quaternion.setFromAxisAngle(axis, angle);

        // // Применяем кватернион к модели
        // wheels[0].quaternion.multiplyQuaternions(quaternion, model.quaternion);
        // wheels[1].quaternion.multiplyQuaternions(quaternion, model.quaternion);

    }

    function update(delta: number){
        velocity.multiplyScalar(1); // Замедление
        const moveVector = direction.clone().multiplyScalar(velocity.z * delta);
        moveCar(moveVector, delta*1400)

        if(velocity.z !== 0){
            rotateWheel(velocity.z)
        }
    }

    function moveCar(direction: THREE.Vector3, delta: number){
        var t=model.position.addScaledVector(direction,delta)
        light.position.addScaledVector(direction,delta)
        camera.position.addScaledVector(direction,delta)
        camera.lookAt(t)
    }

    function rotateWheel(speed: number){
        wheels.forEach(wheel=>{
            wheel.rotation.x+=speed
        })
    }

    const clock=new THREE.Clock

    function animate() {
        /* const */var delta = clock.getDelta();
        update(delta)
        requestAnimationFrame(animate)
    }
    animate();
}
export default CarFunc;