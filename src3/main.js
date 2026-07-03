import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

gsap.registerPlugin(ScrollTrigger)

const canvas = document.querySelector('canvas')
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 15
scene.add(camera)


const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(5, 10, 5)
scene.add(ambientLight, directionalLight)

/* workspace */
const lanternGroup = new THREE.Group()
const particlesGroup = new THREE.Group()
const lobbyGroup = new THREE.Group()
const arGroup = new THREE.Group()

scene.add(lanternGroup, particlesGroup, lobbyGroup, arGroup)

let currentState = 'lantern'
lanternGroup.visible = true
particlesGroup.visible = false
lobbyGroup.visible = false
arGroup.visible = false
function showLantern() {
    lanternGroup.visible = true
    particlesGroup.visible = false
    lobbyGroup.visible = false
    arGroup.visible = false

}
function showParticles() {
    lanternGroup.visible = false
    particlesGroup.visible = true
    lobbyGroup.visible = false
    arGroup.visible = false

}

function showLobby() {
    lanternGroup.visible = false
    particlesGroup.visible = false
    lobbyGroup.visible = true
    arGroup.visible = false
}

function showAR() {
    lanternGroup.visible = false
    particlesGroup.visible = false
    lobbyGroup.visible = false
    arGroup.visible = true
}
const transitionTo = (newState) => {
    if (currentState === newState) return
    gsap.to(renderer.domElement, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            if (newState === 'lantern') showLantern()
            if (newState === 'particles') showParticles()
            if (newState === 'lobby') showLobby()
            if (newState === 'ar') showAR()
            gsap.to(renderer.domElement, { opacity: 1, duration: 0.5 })
            currentState = newState
        }
    })
}


const loader = new GLTFLoader()

//LANTERN
let lantern = null
let skeleton = null
//particles
let particles = null
const count = 500
const positions = new Float32Array(count * 3)
for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3 + 0] = (Math.random() - 0.5) * 40
    positions[i3 + 1] = Math.random() * 4 - 21
    positions[i3 + 2] = (Math.random() - 0.5) * 40
}
function loadModel(path) {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => resolve(gltf.scene))
    })
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particlesMaterial = new THREE.PointsMaterial({ size: 0.1, color: 'green', blending: THREE.AdditiveBlending })
const fontLoader = new FontLoader()
let nickname=null
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry('VioltHunter#EUNE', {
            font: font,
            size: 0.5,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        })
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
        nickname = new THREE.Mesh(textGeometry, textMaterial)
        particlesGroup.add(nickname)
    }
)


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
    lantern.position.y = 2
    lantern.scale.set(3, 3, 3)
    lanternGroup.add(lantern)
    // setup skeleton
    skeleton = skeletonModel
    skeleton.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = true
            child.material.color.set('#226119')
            child.material.emissive.set('#070606')
            child.material.emissiveIntensity = 10.0
            gsap.from(child.material, { opacity: 0, duration: 1, delay: 1 })
            gsap.from(child.position, { z: -5 }, '<')
        }
    })
    skeleton.position.set(-0.5, 0, 0)
    skeleton.scale.set(0.25, 0.25, 0.25)
    skeleton.rotation.set(-Math.PI / 4, Math.PI / 16, -Math.PI / 8)
    lanternGroup.add(skeleton)

    //particles

    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    const violetParticle = new THREE.Group()
    const nameTag=new TextGeom
    particlesGroup.add(particles, violetParticle)

    initTimelines()
    showLantern()
})

function initTimelines() {

    if (!lantern || !skeleton) return
    gsap.timeline({})
        .from(lantern.position, { y: 30 })
    gsap.timeline({
        scrollTrigger: {
            trigger: '.section-lantern',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            onLeave: () => transitionTo('particles'),
            onEnterBack: () => transitionTo('lantern')
        }
    })
        .to(camera.position, {
            z: 10,
            y: -20
        }, '<')
        .to(skeleton.position, {
            y: 5,
        }, '<')
        .to(lantern.scale, {
            x: 32,
            y: 32,
            z: 32
        }, '<')
        .to(lantern.rotation, {
            y: 4,
        }, '<')


    gsap.timeline({
        scrollTrigger: {
            trigger: '.section-particles',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            onLeave: () => transitionTo('lobby'),
            onEnterBack: () => transitionTo('particles')
        }
    })
        .to(camera.position, { z: 5, duration: 1 })
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
    }

    // particles state animations
    if (currentState === 'particles') {
        if (particles) {
            for (let i = 0; i < count; i++) {
                const i3 = i * 3
                const x = positions[i3 + 0]
                const baseY = positions[i3 + 1]

                particlesGeometry.attributes.position.setY(i, baseY + Math.sin(elapsed + x) * 0.005)
            }
            const baseSize = 0.1
            const amplitude = 0.03
            const speed = 0.3

            particlesMaterial.size = baseSize + Math.cos(elapsed * speed) * amplitude
            particlesGeometry.attributes.position.needsUpdate = true
        }

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
