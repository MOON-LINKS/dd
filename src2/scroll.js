import * as THREE from 'three'
import gsap from 'gsap'

let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const canvas = document.querySelector('canvas')

const scene = new THREE.Scene()
const cameraGroup=new THREE.Group()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
scene.add(cameraGroup)
cameraGroup.add(camera)

const light = new THREE.DirectionalLight('#fff', 3)
light.position.set(1, 1, 0)
scene.add(light)

const objectDistance = 4
const meshMaterial = new THREE.MeshToonMaterial({})
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.5),
    meshMaterial
)
const mesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(4, 16, 16),
    meshMaterial
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3, 0.5),
    meshMaterial
)
mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2
mesh1.position.y = - objectDistance * 0
mesh2.position.y = - objectDistance * 1
mesh3.position.y = - objectDistance * 2

scene.add(mesh1, mesh2, mesh3)
const meshSections = [mesh1, mesh2, mesh3]

const count = 500
const positions = new Float32Array(count * 3)
for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3 + 0] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = - (Math.random() * objectDistance * meshSections.length) + objectDistance / 2
    positions[i3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))


let scrollY = window.scrollY
let previousSection = 0
window.addEventListener('scroll', function () {
    scrollY = window.scrollY / sizes.height
    let currentSection = Math.round(scrollY)
    if (currentSection != previousSection) {
        gsap.to(meshSections[currentSection].rotation,{
            duration:1.5,
            x:'+= 6'
        })
        previousSection = currentSection
    }

})

let cursor = {}
cursor.x = 0
cursor.y = 0
window.addEventListener('mousemove', function (e) {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = e.clientY / sizes.height - 0.5
})

const clock = new THREE.Clock()
let currentTime=0
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()
    const deltaTime=elapsed-currentTime
    currentTime=elapsed
    for (let mesh of meshSections) {
        mesh.rotation.x += deltaTime * 0.001
    }
    cameraGroup.position.y=-scrollY*objectDistance
    const parallaxX=cursor.x
    const parallaxY=cursor.y

    camera.position.x+=(parallaxX-camera.position.x) *0.05
    camera.position.y+= -(parallaxY-camera.position.y) *0.05
    //and here we add smoothing 
    renderer.render(scene, camera)
}
tick()
window.addEventListener('resize', function () {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.render(scene, camera)
})