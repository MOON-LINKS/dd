import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('canvas')
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
scene.add(camera)

const controls=new OrbitControls(camera,canvas)

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(3, 5, 3)
scene.add(ambientLight, directionalLight)
/* workspace */
const world= new CANNON.World()
world.gravity.set(0,-9.18,0)

//CANNON material
const groundMaterial = new CANNON.Material('ground')
const sphereMaterial = new CANNON.Material('sphere')

//floor
const floorMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial({color:'#777'})
)
floorMesh.rotation.x=-Math.PI / 2
scene.add(floorMesh)

const floorBody=new CANNON.Body({
    mass:0,
    shape:new CANNON.Plane()
})
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1,0,0),
    -Math.PI/2
)
floorBody.material=groundMaterial
world.addBody(floorBody)
//sphere
let objects=[]
const sphereGeometry=new THREE.SphereGeometry(0.5)
const sphereMaterialMesh=new THREE.MeshStandardMaterial({ color: 'red' })



window.addEventListener('click', (e) => {
    const randomX = (Math.random() - 0.5) * 5
    const randomZ = (Math.random() - 0.5) * 5
    const sphereMesh = new THREE.Mesh(sphereGeometry,sphereMaterialMesh)
    
    scene.add(sphereMesh)
    const sphereBody=new CANNON.Body({
    mass:1,
    shape:new CANNON.Sphere(0.5),
    position:new CANNON.Vec3(randomX, 5, randomZ)
    })
    sphereBody.material=sphereMaterial
    world.addBody(sphereBody)

    objects.push({mesh:sphereMesh,body:sphereBody})
})
world.addContactMaterial(new CANNON.ContactMaterial(
    groundMaterial,sphereMaterial,
    {friction:0.3,restitution:0.3}
))


/* */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))


window.addEventListener('resize', function () {
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    controls.update()
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.render(scene, camera)
})
const clock = new THREE.Clock()
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()

    world.step(1/60,elapsed,3)
    for(let object of objects){
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    
    

    controls.update()
    renderer.render(scene, camera)
}
tick()