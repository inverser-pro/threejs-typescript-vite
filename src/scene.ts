import './style.css'
import {
  Clock,
  GridHelper,
  Mesh,
  MeshLambertMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import {loadModel} from './utils/loader'
import settings from './utils/settings'
let renderer: WebGLRenderer
  , scene: Scene
  , pointLight: PointLight
  , camera: PerspectiveCamera
  // , clock: Clock
  , stats: Stats
  , cameraControls: OrbitControls
;
const DEBUG = 0;

init()
animate()

function init() {
    const canvas: HTMLElement = document.querySelector(`canvas.${settings.canvasClass}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene();

    // освещение на сцене — PointLight
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(2, 2, 2)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(pointLight)

    // пол
    const planeGeometry = new PlaneGeometry(9999, 9999)
        , planeMaterial = new MeshLambertMaterial({
          color: 'gray',
          emissive: 'teal',
          emissiveIntensity: 0.2,
          side: 1,
        })
        , plane = new Mesh(planeGeometry, planeMaterial)
    plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true;
    plane.position.y=-.01

    scene.add(plane)

    // камера
    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(0, 2, 5)
    if(DEBUG){
      cameraControls = new OrbitControls(camera, canvas)
      cameraControls.enableDamping = true
      cameraControls.autoRotate = false
      cameraControls.update()
    }
  // загрука и добавление GLB модели на сцену
  /* const model =  */loadModel(settings.model1,scene,camera,pointLight);

  { // добавляем сетку
    const gridHelper = new GridHelper(9999, 9999, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    scene.add(gridHelper)
  }

  { // время и статистика частоты отрисовки сцены
    new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }
  if(DEBUG) cameraControls.update()

  renderer.render(scene, camera)
}
