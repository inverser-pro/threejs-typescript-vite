import * as THREE from 'three';

const CarFunc=(
    model: THREE.Group,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light
)=>{
    const acceleration: number      = .01;   // ускорение
    const deceleration: number      = 0.002; // замедление
    let   isAccelerating: boolean   = false; // Флаг для отслеживания ускорения
    let   stringAngle : number      = 0;     // угол поворота колёс
    let   stringAngleCar : number   = 0;     // угол поворота авто, при наличии ненулевого угла поворота колёс
    const rotateMoveCoe : number    = .01;   // коэффициент вращения и поворота авто, при условии выше
    const maxAngle : number         = .5;    // максимальный угол поворота колёс
    const velocity : THREE.Vector3  = new THREE.Vector3(0,0,0); // вектор перемещения авто (группы `car`)
    const direction : THREE.Vector3 = new THREE.Vector3(0,0,1); // вектор направления авто ~
    const car: THREE.Group          = new THREE.Group();        // группа для всех частей авто (авто + передние колёса)
    const wheels: THREE.Object3D[]  = [];                       // массив для колёс (находим их в GLB сцене)
    const wheelGroupFL: THREE.Group = new THREE.Group();        // группа, которая позволяет вращать левое колесов
    const wheelGroupFR: THREE.Group = new THREE.Group();        // ~ правое колесо

    model.translateY(-.025); // немного переместим авто вверх
    
    window.addEventListener('keydown', e=>onKeyDown(e)); // добавим прослушиватель события нажатия клавиш
    window.addEventListener('keyup', e=>onKeyUp(e));     // ~ отжатия клавиш

    // пройдём по всем дочерним элементам сцены GLB,
    // чтобы найти все колёса
    model.traverse(child => {
        if(child?.name?.includes('wheel')){ // в Blender мы добавили имена всем колёсам, чтобы затем здесь их найти
            wheels.push(child);             // добавим в массив с колёсами каждое найденное колесо (имя начинается с wheel.. (ex.: `wheelLF`) )
        }
    })
    // микрофункция для перемещения центров колёс, чтобы их можно было вращать вокруг своей оси, а не вокруг оси группы (изначально в THREE.Vector3(0,0,0))
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
    // проёдум по всем колёсам в массиве и найдём только два передних, добавим их в отдельные группы, используя микрофункцию
    wheels.forEach(e=>{
        if (e?.name === 'wheelRF') {
            microFn(e,wheelGroupFR)
        } else if (e?.name === 'wheelLF') {
            microFn(e,wheelGroupFL)
        }
    })
    // добавим все группы (авто и два передних колеса) к группе `car`
    car.add(model, wheelGroupFL, wheelGroupFR)
    scene.add(car) // добавим эту грппу на сцену

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
            if(stringAngle > maxAngle)
                stringAngle = maxAngle
        }else if(val===-1){
            stringAngle-=rotateMoveCoe
            stringAngleCar-=rotateMoveCoe
            if(stringAngle < -maxAngle)
                stringAngle = -maxAngle
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
        if( stringAngleCar < 0)stringAngleCar -= rotateMoveCoe //.5
        if( stringAngleCar > 0)stringAngleCar += rotateMoveCoe
        if(velocity.z > 0){
            car.rotation.y = stringAngleCar;
            car.position.x = stringAngleCar;
        }
    }

    car.add(camera,light)
    function moveCar(direction: THREE.Vector3, delta: number){
        var t=car.position.addScaledVector(direction,delta)
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
        var delta = clock.getDelta();
        update(delta)
        requestAnimationFrame(animate)
    }
    animate();
}
export default CarFunc;