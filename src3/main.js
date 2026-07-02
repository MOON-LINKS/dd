import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('canvas')
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 1000)
camera.position.z=15
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(5, 10, 5)
scene.add(ambientLight, directionalLight)

/* workspace */
let phase='lantern'

const lanternGroup=new THREE.Group()
scene.add(lanternGroup)
const loader= new GLTFLoader()
loader.load('./models/lantern.glb',(gltf)=>{
    const lantern= gltf.scene
    lantern.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set('#226119')
      child.material.emissive.set('#070606')
      child.material.emissiveIntensity = 10.0
      //console.log(`--- Mesh #${meshCount}: "${child.name}" ---`)
      //console.log('Position:', child.position)
      //console.log('Geometry:', child.geometry)
      //console.log('Material name:', child.material.name)
      //console.log('Material type:', child.material.type)
      //console.log('Color:', child.material.color)
      //console.log('Has texture map:', !!child.material.map)
      //console.log('Opacity:', child.material.opacity)
      //console.log('Transparent flag:', child.material.transparent)
      //console.log('Emissive:', child.material.emissive)
      //console.log('Full material object:', child.material)
    }
  })
  lantern.position.y=0.5
  lantern.scale.set(2.5,2.5,2.5)
    lanternGroup.add(lantern)
})
const glow = new THREE.PointLight('#00ff66', 5, 5)
glow.position.set(0, -1, 0)  
lanternGroup.add(glow)
//skeleton hand
loader.load('./models/skeleton-hand.glb',(gltf)=>{
    const skeleton=gltf.scene
    skeleton.traverse((child)=>{
        if(child.isMesh){
        child.material.emissive.set('#070606')
      child.material.emissiveIntensity = 10.0
child.material.color.set('#226119')
        }
    })
    console.log(skeleton.scale, new THREE.Box3().setFromObject(skeleton).getSize(new THREE.Vector3()))
    
    skeleton.position.set(-0.5,0,0)
    skeleton.scale.set(0.25, 0.25, 0.25)
    skeleton.rotation.y =Math.PI/16
    skeleton.rotation.z =-Math.PI/8
    skeleton.rotation.x =-Math.PI/4
    scene.add(skeleton)
})
/* */

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
})

const clock = new THREE.Clock()
let currentTime = 0
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()
    const deltaTime = elapsed - currentTime
    currentTime = elapsed

    controls.update()
    renderer.render(scene, camera)
}
tick()