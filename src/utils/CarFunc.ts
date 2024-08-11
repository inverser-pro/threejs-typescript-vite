import * as THREE from 'three';

const CarFunc=(
    model: THREE.Group,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light
)=>{
    const acceleration: number        = .01;
    const deceleration: number        = 0.002;
    let isAccelerating: boolean   = false; // Флаг для отслеживания ускорения
    let stringAngle : number        = 0;
    const velocity    : THREE.Vector3 = new THREE.Vector3(0,0,0);
    const direction   : THREE.Vector3 = new THREE.Vector3(0,0,1);
    const wheels: THREE.Object3D[]    = [];
    const wheelGroupFL: THREE.Group   = new THREE.Group();
    const wheelGroupFR: THREE.Group   = new THREE.Group();

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
    
    scene.add(wheelGroupFL)
    scene.add(wheelGroupFR)

    function onKeyDown(e :KeyboardEvent){
        switch (e.key){
            case 'ArrowUp':
                accelerate(1);
                break;
            case 'ArrowDown':
                accelerate(-1);
                break;
            case 'ArrowLeft':
                steer(.2);
                break;
            case 'ArrowRight':
                steer(-.2);
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
        stringAngle = val;
        steerWheel(stringAngle);
    }

    function steerWheel(angle: number){
        wheelGroupFL.rotation.y = angle;
        wheelGroupFR.rotation.y = angle;
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

    function moveCar(direction: THREE.Vector3, delta: number){
        var t=model.position.addScaledVector(direction,delta)
        light.position.addScaledVector(direction,delta)
        wheelGroupFL.position.addScaledVector(direction,delta)
        wheelGroupFR.position.addScaledVector(direction,delta)
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

        // Рассчитать новое направление и движение
        const direction = new THREE.Vector3();
        model.getWorldDirection(direction);
        direction.multiplyScalar(moveSpeed);

        // Применить движение
        model.position.add(direction);

        // Поворот автомобиля в зависимости от угла поворота
        model.rotation.y += turnAngle;

    }
    animate();
}
export default CarFunc;