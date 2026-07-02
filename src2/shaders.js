import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const canvas = document.querySelector('canvas')

let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 10
scene.add(camera)


/*
workspace start
*/
const ambientLight = new THREE.AmbientLight('#fff', 0.5)
scene.add(ambientLight)


const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
/* const material = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `
}) */
const shaderMaterial = new THREE.ShaderMaterial(
    {
     uniforms:{
        uTime:{value:0}
     },
     vertexShader:`
     void main(){
       vec3 newPosition= position;

       gl_Position= projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);
     }
     `,
     fragmentShader:`
     void main(){
     
        gl_FragColor=vec4(1.0,1.0,1.0,1.0);
     }
     `
    }
)
const mesh = new THREE.Mesh(geometry, shaderMaterial)
scene.add(mesh)
/*
workspace end
*/
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
renderer.setSize(sizes.width, sizes.height)

window.addEventListener('resize', function () {
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    
    renderer.setSize(sizes.width, sizes.height)
    renderer.render(scene, camera)
})
const clock = new THREE.Clock()
const tick = () => {
    requestAnimationFrame(tick)
    const elapsed = clock.getElapsedTime()
shaderMaterial.uniforms.uTime=elapsed
   renderer.render(scene, camera)
}
tick()