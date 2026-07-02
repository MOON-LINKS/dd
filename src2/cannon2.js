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
camera.position.set(0, 5, 15)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(5, 10, 5)
scene.add(ambientLight, directionalLight)

/* workspace */
const world = new CANNON.World()
world.gravity.set(0, -9.18, 0)

//floor
const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: '#777' })
)
floorMesh.rotation.x = -Math.PI / 2
scene.add(floorMesh)

const floorObjectMaterial = new CANNON.Material('floor')
const floorBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: floorObjectMaterial
})
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
)
world.addBody(floorBody)

//sphere
const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2),
    new THREE.MeshStandardMaterial()
)
sphereMesh.position.y = 2
scene.add(sphereMesh)

const sphereObjectMaterial = new CANNON.Material('sphere')
const sphereBody = new CANNON.Body({
    mass: 1,
    material: sphereObjectMaterial,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(0, 2, 0),
})
world.addBody(sphereBody)

//contact
const contactMaterial1 = new CANNON.ContactMaterial(
    floorObjectMaterial, sphereObjectMaterial,
    { friction: 0.5, restitution: 1 }
)
world.addContactMaterial(contactMaterial1)

//click forces
window.addEventListener('click', function () {
    sphereBody.applyImpulse(
        new CANNON.Vec3(0, 0, -10), 
        new CANNON.Vec3(0, 0, 0))
    sphereBody.applyLocalImpulse(new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        10,
        (Math.random() - 0.5) * 10
    ), sphereBody.position)
    sphereBody.applyForce(
        new CANNON.Vec3(5, 0, 0),
        sphereBody.position
    )
    sphereBody.applyLocalForce(
        new CANNON.Vec3(0, 0, -10),
        new CANNON.Vec3(0, 0, 0)
    )
})

//constraints
const constraint=new CANNON.PointToPointConstraint(
    floorBody,new CANNON.Vec3(0,0,0), //place on floor
    sphereBody,new CANNON.Vec3(0,3,0) //place on the sphere
)
world.addConstraint(constraint)

//dumbbell example with fixed distances
const distanceConstraint=new CANNON.DistanceConstraint(bodyA,bodyB,3)

//attaching 2 parts of a vehicle
const lockConstraint= new CANNON.LockConstraint(bodyA, bodyB)

//cut a rope
world.removeConstraint(constraint)

//collide
sphereBody.addEventListener('collide',(event)=>{
    event.body //body involved in collision
    event.target //body in the listener

    event.contact //contact details
    event.contact.bi // body A in the collision
    event.contact.bj // body B in the collision
    event.contact.ni // collision normal vector (direction of impact)
    event.contact.ri // contact point relative to body A's center
    event.contact.rj // contact point relative to body B's center
    event.contact.getImpactVelocityAlongNormal()  
    // returns a number — speed of impact along the collision normal
    // most commonly used value for impact strength
})


world.broadphase = new CANNON.NaiveBroadphase()
world.broadphase = new CANNON.SAPBroadphase(world)
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

    /* workspace tick */
    world.step(1 / 60, elapsed, 3)
    sphereMesh.position.copy(sphereBody.position)
    sphereMesh.quaternion.copy(sphereBody.quaternion)

    /* */

    controls.update()
    renderer.render(scene, camera)
}
tick()