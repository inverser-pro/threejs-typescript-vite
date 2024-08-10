// import GUI from 'lil-gui'
import './style.css'
import {
  // AmbientLight,
  // AxesHelper,
  // BoxGeometry,
  Clock,
  GridHelper,
  // LoadingManager,
  Mesh,
  MeshLambertMaterial,
  // MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  // PointLightHelper,
  Scene,
  WebGLRenderer,
} from 'three'
// import { DragControls } from 'three/examples/jsm/controls/DragControls'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
// import * as animations from './helpers/animations'
// import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import {loadModel} from './utils/loader'
import settings from './utils/settings'
// import CarFunc from './utils/CarFunc'

// let canvas: HTMLElement
let renderer: WebGLRenderer
  , scene: Scene
  // , loadingManager: LoadingManager
  // , ambientLight: AmbientLight
  , pointLight: PointLight
  // , cube: Mesh
  , camera: PerspectiveCamera
  // , cameraControls: OrbitControls
  // , dragControls: DragControls
  // , axesHelper: AxesHelper
  // , pointLightHelper: PointLightHelper
  , clock: Clock
  , stats: Stats
  // , gui: GUI

// const animation = { enabled: true, play: true }



init()
animate()

function init() {

    const canvas: HTMLElement = document.querySelector(`canvas.${settings.canvasClass}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()

    // console.log(model);

    // Light — PointLight
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(pointLight)
    

/*     const sideLength = 1
        , cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
        , cubeMaterial = new MeshStandardMaterial({
          color: '#f69f1f',
          metalness: 0.5,
          roughness: 0.7,
        })
    cube = new Mesh(cubeGeometry, cubeMaterial)
    cube.castShadow = true
    cube.position.y = 0.5 */

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

    // scene.add(cube)
    scene.add(plane)

    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(2, 2, 5)

    // cameraControls = new OrbitControls(camera, canvas)
    // cameraControls.target = cube.position.clone()
    // cameraControls.enableDamping = true
    // cameraControls.autoRotate = false
    // cameraControls.update()

    const model = loadModel(settings.model1,scene,camera,pointLight);

  {
    const gridHelper = new GridHelper(9999, 9999, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    scene.add(gridHelper)
  }

  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

/*   if (animation.enabled && animation.play) {
    animations.rotate(cube, clock, Math.PI / 3)
    animations.bounce(cube, clock, 1, 0.5, 0.5)
  } */

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  // cameraControls.update()

  renderer.render(scene, camera)
}
