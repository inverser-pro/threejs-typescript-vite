import * as THREE from 'three';

const CarFunc=(
    model: THREE.Group,
    scene: THREE.Scene,
    camera: THREE.Camera,
    light: THREE.Light,
)=>{
    const acceleration: number      = .01;   // ускорение
    const deceleration: number      = 0.002; // замедление
    let   isAccelerating: boolean   = false; // Флаг для отслеживания ускорения
    let   stringAngle : number      = 0;     // угол поворота колёс
    let   stringAngleCar : number   = 0;     // угол поворота авто, при наличии ненулевого угла поворота колёс
    const rotateMoveCoe : number    = .01;   // коэффициент вращения и поворота авто, при условии выше
    const maxAngle : number         = .5;    // максимальный угол поворота колёс
    const maxSpeedFront : number    = .3;    // максимальная скорость для авто вперёд
    const maxSpeedBack : number     = .2;    // ~ назад
    const velocity : THREE.Vector3  = new THREE.Vector3(0,0,0); // вектор перемещения авто (группы `car`)
    const direction : THREE.Vector3 = new THREE.Vector3(0,0,1); // вектор направления авто ~
    const car: THREE.Group          = new THREE.Group();        // группа для всех частей авто (авто + передние колёса)
    const wheels: THREE.Object3D[]  = [];                       // массив для колёс (находим их в GLB сцене)
    const wheelGroupFL: THREE.Group = new THREE.Group();        // группа, которая позволяет вращать левое колесов
    const wheelGroupFR: THREE.Group = new THREE.Group();        // ~ правое колесо

    model.translateY(-.025); // немного переместим авто вверх
    
    window.addEventListener('keydown', e=>onKeyDown(e)); // добавим прослушиватель события нажатия клавиш
    window.addEventListener('keyup',   e=>onKeyUp(e));   // ~ отжатия клавиш

    // пройдём по всем дочерним элементам сцены GLB,
    // чтобы найти все колёса
    model.traverse(child => {
        if(child?.name?.includes('wheel')){ // в Blender мы добавили имена всем колёсам, чтобы затем здесь их найти
            wheels.push(child);             // добавим в массив с колёсами каждое найденное колесо (имя начинается с wheel.. (ex.: `wheelLF`) )
        }
    })
    // микрофункция для перемещения центров колёс, чтобы их можно было вращать вокруг своей оси, а не вокруг оси группы (изначально в THREE.Vector3(0,0,0))
    function microFn(e: THREE.Object3D,grp: THREE.Group):void{
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
    // пройдём по всем колёсам в массиве и найдём только два передних, добавим их в отдельные группы, используя микрофункцию
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

    // функция прослушивания событий нажатия клавиш
    function onKeyDown(e :KeyboardEvent):void{
        switch (e.key){
            case 'ArrowUp': // кнопка вверх
                accelerate(1);
                break;
            case 'ArrowDown': // кнопка вниз
                accelerate(-1);
                break;
            case 'ArrowLeft': // влево
                steer(1);
                break;
            case 'ArrowRight': // вправо
                steer(-1);
                break;
        }
    }
    // функция прослушивания событий отжатия клавиш
    function onKeyUp(e: KeyboardEvent):void{
        switch (e.key){
            case 'ArrowUp':   // кнопка вверх
            case 'ArrowDown': // кнопка вниз
                accelerate(0);
                break;
            case 'ArrowLeft':  // влево
            case 'ArrowRight': // вправо
                steer(0);
                break;
        }
    }
    // фнукция для ускорения
    function accelerate(val: number):void {
        if (val > 0) { // при нажатой клавише вверх, мы добавляем скорость, но не более 
            // Разгон вперед
            isAccelerating = true; // если присутствует ускорение
            velocity.z += val * acceleration;
            if (velocity.z > maxSpeedFront) {
                velocity.z = maxSpeedFront;
            }
        } else if (val < 0) { // при нажатой клавише вниз, мы сначала замедляем авто (если было движение), затем направляем его назад
            // Торможение или движение назад
            isAccelerating = true; // если присутствует ускорение
            if (velocity.z <= 0) {
                // Если скорость уже отрицательная, разгоняем назад
                velocity.z += val * acceleration;
                if (velocity.z < -maxSpeedBack) {
                    velocity.z = -maxSpeedBack;
                }
            } else {
                // Если автомобиль движется то тормозим
                velocity.z += val * acceleration;
                if (velocity.z < 0) {
                    velocity.z = 0;
                }
            }
        }
        steerCar()
    }
    // функция плавного торможения
    function stop():void {
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
    // управление влево/вправо колёсами
    function steer(val: number):void{
        if(val===1){ // влево
            stringAngle+=rotateMoveCoe
            if(stringAngle > maxAngle)
                stringAngle = maxAngle
        }else if(val===-1){ // вправо
            stringAngle-=rotateMoveCoe
            stringAngleCar-=rotateMoveCoe
            if(stringAngle < -maxAngle)
                stringAngle = -maxAngle
        }
        stringAngleCar=stringAngle // Запомним поворот колёс для дальнейшего поворота авто
        steerWheel(stringAngle);
    }
    // функция поворота колёс по оси Y (управление)
    function steerWheel(angle: number):void{
        wheelGroupFL.rotation.y = angle; // поворачиваем только группу
        wheelGroupFR.rotation.y = angle; // поворачиваем только группу
        steerCar() // управляем авто (<>)
    }
    // функция поворота и перемещения авто
    function steerCar():void{
        if( stringAngleCar < 0)stringAngleCar -= rotateMoveCoe //.5
        if( stringAngleCar > 0)stringAngleCar += rotateMoveCoe
        if(velocity.z > 0){
            car.rotation.y = stringAngleCar;
            car.position.x = stringAngleCar;
        }
    }

    car.add(camera,light) // добавим, чтобы управлять светом и камерой вместе с авто (перемещать/вращать)
    // фнукция перемещения авто
    function moveCar(direction: THREE.Vector3, delta: number){
        var t=car.position.addScaledVector(direction,delta)
        camera.lookAt(t)
    }
    // функция вращения колёс по оси X (движение)
    function rotateWheel(speed: number){
        wheels.forEach(wheel=>{
            wheel.rotation.x+=speed
        })
    }
    // фнукция обновления данных
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

    const clock=new THREE.Clock; // просто время для отслежнивания изменений жизненного цикла приложения
    // функция анимирования сцены
    (function animate() {
        var delta = clock.getDelta(); // вычисляем дельту времени
        update(delta);
        requestAnimationFrame(animate); // рекурсивный вызов для продолжения анимации
    })();
}
export default CarFunc;