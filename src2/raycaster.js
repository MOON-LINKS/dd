import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('canvas')
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 5, 15)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(5, 10, 5)
scene.add(ambientLight, directionalLight)

/* workspace */
const geometry = new THREE.SphereGeometry(1, 16, 16)
const material = new THREE.MeshStandardMaterial({ color: 'red' })

const sphere1 = new THREE.Mesh(geometry, material.clone())
const sphere2 = new THREE.Mesh(geometry, material.clone())
const sphere3 = new THREE.Mesh(geometry, material.clone())

sphere1.position.x = -4
sphere2.position.x = 0
sphere3.position.x = 4

scene.add(sphere1, sphere2, sphere3)
const objects = [sphere1, sphere2, sphere3]



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

const mouse = new THREE.Vector2()
window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / sizes.width)   * 2 - 1
    mouse.y = -(e.clientY / sizes.height) * 2 + 1
})

const raycaster = new THREE.Raycaster()

const clock = new THREE.Clock()
let currentTime = 0
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()
    const deltaTime = elapsed - currentTime
    currentTime = elapsed

    /* workspace tick */
    raycaster.setFromCamera(mouse, camera)
    const intersects=raycaster.intersectObjects(objects)
    objects.forEach(object=> object.material.color.set('red'))
    if(intersects.length>0){
        intersects[0].object.material.color.set('green')
    }
    /* */

    controls.update()
    renderer.render(scene, camera)
}
tick()