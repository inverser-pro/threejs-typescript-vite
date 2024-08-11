import * as THREE from 'three';

const CarFunc=(
    model: THREE.Group,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light
)=>{
    const acceleration: number      = .01;
    const deceleration: number      = 0.002;
    let isAccelerating: boolean     = false; // Флаг для отслеживания ускорения
    let stringAngle : number        = 0;
    let stringAngleCar : number     = 0;
    const rotateMoveCoe : number    = .01;
    const maxAngle : number         = .5;
    const velocity : THREE.Vector3  = new THREE.Vector3(0,0,0);
    const direction : THREE.Vector3 = new THREE.Vector3(0,0,1);
    const car: THREE.Group          = new THREE.Group();
    const wheels: THREE.Object3D[]  = [];
    const wheelGroupFL: THREE.Group = new THREE.Group();
    const wheelGroupFR: THREE.Group = new THREE.Group();

    scene.add(model);
    model.translateY(-.025)
    
    window.addEventListener('keydown', e=>onKeyDown(e));
    window.addEventListener('keyup', e=>onKeyUp(e));

    model.traverse(child => {
        if(child?.name?.includes('wheel')){
            wheels.push(child);
        }
    })

    function microFn(e: THREE.Object3D,grp: THREE.Group){
            // Вычисляем центр колеса
            const box = new THREE.Box3().setFromObject(e)
                , center = box.getCenter(new THREE.Vector3());
            // Перемещаем группу в центр колеса
            grp.position.copy(center);
            // Перемещаем колесо так, чтобы его центр совпал с началом координат группы
            e.position.sub(center);
            // Добавляем колесо в группу
            grp.add(e);
    }

    wheels.forEach(e=>{
        if (e?.name === 'wheelRF') {
            microFn(e,wheelGroupFR)
        } else if (e?.name === 'wheelLF') {
            microFn(e,wheelGroupFL)
        }
    })

    car.add(model, wheelGroupFL, wheelGroupFR)
    
    // scene.add(wheelGroupFL)
    // scene.add(wheelGroupFR)
    scene.add(car)

    // const box = new THREE.Box3().setFromObject(model)
    //             , center = box.getCenter(new THREE.Vector3());
    // // Перемещаем группу в центр колеса
    // car.position.copy(center);
    // // Перемещаем колесо так, чтобы его центр совпал с началом координат группы
    // model.position.sub(center);
    // // Добавляем колесо в группу
    // car.add(model);
    

    function onKeyDown(e :KeyboardEvent){
        switch (e.key){
            case 'ArrowUp':
                accelerate(1);
                break;
            case 'ArrowDown':
                accelerate(-1);
                break;
            case 'ArrowLeft':
                steer(1);
                break;
            case 'ArrowRight':
                steer(-1);
                break;
        }
    }

    function onKeyUp(e: KeyboardEvent){
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

    function accelerate(val: number) {
        if (val > 0) {
            // Разгон вперед
            isAccelerating = true;
            velocity.z += val * acceleration;
            if (velocity.z > .3) {
                velocity.z = .3;
            }
        } else if (val < 0) {
            // Торможение или движение назад
            isAccelerating = true;
            if (velocity.z <= 0) {
                // Если скорость уже отрицательная, разгоняем назад
                velocity.z += val * acceleration;
                if (velocity.z < -.2) {
                    velocity.z = -.2;
                }
            } else {
                // Если автомобиль движется вперед, сначала тормозим
                velocity.z += val * acceleration;
                if (velocity.z < 0) {
                    velocity.z = 0;
                }
            }
        }
        steerCar()
    }

    function stop() {
        if (velocity.z > 0) {
            // Плавное торможение вперед
            velocity.z -= deceleration;
            if (velocity.z < 0) {
                velocity.z = 0;
            }
        } else if (velocity.z < 0) {
            // Плавное торможение назад
            velocity.z += deceleration;
            if (velocity.z > 0) {
                velocity.z = 0;
            }
        }
    }

    function steer(val: number){
        if(val===1){
            stringAngle+=rotateMoveCoe
            if(stringAngle > .maxAngle)
                stringAngle=maxAngle
        }else if(val===-1){
            stringAngle-=rotateMoveCoe
            stringAngleCar-=rotateMoveCoe
            if(stringAngle < -maxAngle)
                stringAngle=-maxAngle
        }
        stringAngleCar=stringAngle // Запомним поворот колёс
        steerWheel(stringAngle);
    }

    function steerWheel(angle: number){
        wheelGroupFL.rotation.y = angle;
        wheelGroupFR.rotation.y = angle;
        steerCar()
    }

    function steerCar(){
        if( stringAngleCar < 0)stringAngleCar -= rotateMoveCoe// В пределах 0
        if( stringAngleCar > 0)stringAngleCar += rotateMoveCoe// В пределах 0
        if(velocity.z > 0){
            car.rotation.y = stringAngleCar;
            car.position.x = stringAngleCar;
        }
    }

    car.add(camera,light)
    function moveCar(direction: THREE.Vector3, delta: number){
        var t=car.position.addScaledVector(direction,delta)
        // light.position.addScaledVector(direction,delta)
        // wheelGroupFL.position.addScaledVector(direction,delta)
        // wheelGroupFR.position.addScaledVector(direction,delta)
        // camera.position.addScaledVector(direction,delta)
        camera.lookAt(t)
    }

    function rotateWheel(speed: number){
        wheels.forEach(wheel=>{
            wheel.rotation.x+=speed
        })
    }

    function update(delta: number){
        velocity.multiplyScalar(1); // Замедление
        const moveVector = direction.clone().multiplyScalar(velocity.z * delta);
        moveCar(moveVector, delta*1400)

        if(velocity.z !== 0){
            rotateWheel(velocity.z)
        }

        if (isAccelerating) {
            // Если нажата кнопка, остановка не производится
            isAccelerating = false;
        } else {
            // Постепенно останавливаем автомобиль, если кнопка не нажата
            stop();
        }
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