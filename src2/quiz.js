import * as THREE from 'three'
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
controls.enableDamping=true
/* */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 'rgb(163, 172, 219)' })
)
cube.position.y=2
cube.position.x=1
const ambientLight = new THREE.AmbientLight('#fff', 0.5)
const directionalLight = new THREE.DirectionalLight('#d3df91', 4)
directionalLight.position.set(2,5,0)
console.log(directionalLight.shadow.camera)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
const directionalLightShadowHelper=new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLight.shadow.camera.near=0.1
directionalLight.shadow.camera.far=10
directionalLight.shadow.camera.top=1
directionalLight.shadow.camera.right=1
directionalLight.shadow.camera.left=-1
directionalLight.shadow.camera.bottom=-1
directionalLight.target.position.set(0, 1, 0) 
const count = 300
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions,3)
)
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors,3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    sizeAttenuation:true,
    depthWrite:false
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)

const planeGeometry=new THREE.PlaneGeometry(5,5,100,100)
const planeMaterial=new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    uniforms:{
        uTime:{value:0}
    },
    vertexShader:`
    uniform float uTime;
    void main(){
        vec3 newPosition=position;
        newPosition.z += sin(position.x * 2.0 + uTime) * 0.3;
        gl_Position= projectionMatrix* modelViewMatrix * vec4(newPosition,1.0);
    }
    `,
    fragmentShader:`
    void main(){
        gl_FragColor=vec4(1.0,1.0,1.0,1.0);
    }
    `
})
const plane=new THREE.Mesh(planeGeometry,
    //planeMaterial
new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide })
)
plane.rotation.x=- Math.PI/2
plane.position.y=0

scene.add(cube, ambientLight, directionalLight, directionalLightHelper,directionalLightShadowHelper, particles,plane)
directionalLight.shadow.camera.updateProjectionMatrix()
//directional light helper should be updated
directionalLightShadowHelper.update()
//scene.add(directionalLight.target)
/* */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

//shadows
renderer.shadowMap.enabled=true
renderer.shadowMap.type=THREE.PCFSoftShadowMap

directionalLight.castShadow=true
cube.castShadow=true

plane.receiveShadow=true

window.addEventListener('resize', function () {
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    controls.update()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.render(scene, camera)
})
const clock = new THREE.Clock()
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()
    planeMaterial.uniforms.uTime.value=elapsed
    for(let i=0;i<count;i++){
       const positionX= particlesGeometry.attributes.position.getX(i)
       particlesGeometry.attributes.position.setY(i,Math.sin(positionX*elapsed)*0.2)
       particlesGeometry.attributes.color.setXYZ(i,
        Math.abs(Math.sin(elapsed + positionX )),
        Math.abs(Math.sin(elapsed + positionX +5)),
        Math.abs(Math.sin(elapsed + positionX +2)),
       )
    }
    particlesGeometry.attributes.position.needsUpdate=true
    particlesGeometry.attributes.color.needsUpdate=true

    //cube.position.y=Math.sin(elapsed)*.5

    controls.update()
    renderer.render(scene, camera)
}
tick()