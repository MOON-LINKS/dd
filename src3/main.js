import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const canvas = document.querySelector('canvas')
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 1000)
camera.position.z=15
scene.add(camera)


const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(5, 10, 5)
scene.add(ambientLight, directionalLight)

/* workspace */
const lanternGroup = new THREE.Group()
const lobbyGroup = new THREE.Group()
const arGroup = new THREE.Group()

scene.add(lanternGroup, lobbyGroup, arGroup)

let currentState = 'lantern'

function showLantern() {
    lanternGroup.visible = true
    lobbyGroup.visible = false
    arGroup.visible = false
    //lantern animations
    /* if(lantern){
        gsap.from(lantern.position,{y:-5, duration:1.5})
    }
    if(skeleton){
        gsap.from(skeleton.position,{x:-10, duration:1.5,ease: 'back.out' })
    } */
}

function showLobby() {
    lanternGroup.visible = false
    lobbyGroup.visible = true
    arGroup.visible = false
}

function showAR() {
    lanternGroup.visible = false
    lobbyGroup.visible = false
    arGroup.visible = true
}
const transitionTo=(newState)=>{
 if (currentState === newState) return
    gsap.to(renderer.domElement, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            if (newState === 'lantern') showLantern()
            if (newState === 'lobby') showLobby()
            if (newState === 'ar') showAR()
            gsap.to(renderer.domElement, {opacity: 1, duration: 0.5 })
            currentState = newState
        }
    })
}


const loader= new GLTFLoader()

//LANTERN
let lantern=null
let skeleton=null
function loadModel(path) {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => resolve(gltf.scene))
    })
}

Promise.all([
    loadModel('./models/lantern.glb'),
    loadModel('./models/skeleton-hand.glb')
]).then(([lanternModel, skeletonModel]) => {
    // setup lantern
    lantern = lanternModel
    lantern.traverse((child) => {
        if (child.isMesh) {
            child.material.color.set('#226119')
            child.material.emissive.set('#070606')
            child.material.emissiveIntensity = 10.0
        }
    })
    lantern.position.y = 0.5
    lantern.scale.set(2.5, 2.5, 2.5)
    lanternGroup.add(lantern)

    // setup skeleton
    skeleton = skeletonModel
    skeleton.traverse((child) => {
        if (child.isMesh) {
            child.material.color.set('#226119')
            child.material.emissive.set('#070606')
            child.material.emissiveIntensity = 10.0
        }
    })
    skeleton.position.set(-0.5, 0, 0)
    skeleton.scale.set(0.25, 0.25, 0.25)
    skeleton.rotation.set(-Math.PI/4, Math.PI/16, -Math.PI/8)
    lanternGroup.add(skeleton)

    // everything ready, init once
    initTimelines()
    showLantern()
})

function initTimelines(){

    if(!lantern || !skeleton) return

    gsap.timeline({
        scrollTrigger:{
            trigger:'.section-lantern',
            start:'top top',
            end:'bottom top',
            scrub:1,
            onLeave:()=>transitionTo('lobby'),
            onEnterBack: () => transitionTo('lantern')
        }
    })
    .from(lantern.position,{
        y:-5
    })
    .from(skeleton.position,{
        x:-10,
        ease:'back.out'
    })
    .to(lantern.scale,{
        x:4,
        y:4,
        z:4
    })
}
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


    // lantern state animations
    if (currentState === 'lantern') {
        // float particles
        // pulse purple soul
        // check proximity to soul
    }

    // lobby state animations
    if (currentState === 'lobby') {
        // raycaster hover detection
        // character idle animations
    }

    // ar state
    if (currentState === 'ar') {
        // crown sparkle particles
        // crown float animation
    }


    renderer.render(scene, camera)
}
tick()
