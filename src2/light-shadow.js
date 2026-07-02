import * as THREE from 'three'

//canvas
const canvas=document.querySelector('canvas')

//sizes
let sizes={
    width:window.innerWidth,
    height:window.innerHeight
}

//scene
const scene=new THREE.Scene()

//camera
const camera=new THREE.PerspectiveCamera(45,sizes.width/sizes.height,0.1,100)
camera.position.z=10

/*
Lights
*/
const ambientLight=new THREE.AmbientLight('#000000',4)
scene.add(ambientLight)

const directionalLight=new THREE.DirectionalLight('#000000',5)
scene.add(directionalLight)

const pointLight=new THREE.PointLight('#000',5,30,5)
scene.add(pointLight)

const spotlight=new THREE.SpotLight('#000',5,20,Math.PI/2,0.5,10)
scene.add(spotlight)

const hemiSphereLight=new THREE.HemisphereLight('#000','#fff',5)
scene.add(hemiSphereLight)

//test meshes
const sphere=new THREE.Mesh(
    new THREE.SphereGeometry(1,16,16),
    new THREE.MeshStandardMaterial({color:'#ff00ff'})
)
sphere.position.y=1

const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({})
)
plane.rotation.x=-Math.PI/2

scene.add(sphere,plane)
/*
Shadows
*/
renderer.shadowMap.enabled=true
renderer.shadowMap.type=THREE.PCFSoftShadowMap

pointLight.castShadow=true
sphere.castShadow=true

plane.receiveShadow=true

pointLight.shadow.mapSize.width=512
pointLight.shadow.mapSize.height=512

//sky and fog
scene.fog=new THREE.FogExp2('#ccc',0.1)
//renderer
const renderer=new THREE.WebGLRenderer({canvas:canvas})
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))

const timer=new THREE.Timer()
const tick=()=>{
    requestAnimationFrame(tick)
    const elapsed=timer.getElapsed()
    timer.update()

    renderer.render(scene,camera)
}
tick()

window.addEventListener('resize',function(){
    sizes={
        width:window.innerWidth,
        height:window.innerHeight
    }
    camera.aspect=sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(2,this.window.devicePixelRatio))
    renderer.render(scene,camera)
})