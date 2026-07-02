import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const canvas=document.querySelector('canvas')

let sizes={
    width:window.innerWidth,
    height:window.innerHeight
}
const scene=new THREE.Scene()
const camera=new THREE.PerspectiveCamera(45,sizes.width/sizes.height,0.1,100)
camera.position.z=10
scene.add(camera)


/*
workspace start
*/
const textureLoader=new THREE.TextureLoader()

const particleColorTexture=textureLoader.load('./textures/aerial_rocks_02_diff_4k.jpg')

const ambientLight=new THREE.AmbientLight('#fff',0.5)
scene.add(ambientLight)

//particles
const count=500
const positions=new Float32Array(count*3)
const colors=new Float32Array(count*3)
for(let i=0;i<count*3;i++){
    positions[i]=(Math.random()-0.5) *10
    colors[i]=Math.random()
}

const particlesGeometry=new THREE.BufferGeometry()
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions,3)
)
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors,3)
)
const particlesMaterial=new THREE.PointsMaterial({
    size:.5,
    vertexColors:true,
    //transparent:true,
    //map:particleColorTexture,
    depthWrite:false,
    sizeAttenuation:true,
    blending:THREE.AdditiveBlending
})
const particles=new THREE.Points(particlesGeometry,particlesMaterial)
scene.add(particles)


const cube=new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({})
)
scene.add(cube)
/*
workspace end
*/
const renderer=new THREE.WebGLRenderer({canvas})
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
renderer.setSize(sizes.width,sizes.height)

window.addEventListener('resize',function(){
    sizes={
        width:window.innerWidth,
        height:window.innerHeight
    }
    camera.aspect=sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.render(scene,camera)
})
console.log(particlesGeometry.attributes)
const clock= new THREE.Clock()
const tick=()=>{
    requestAnimationFrame(tick)
    const elapsed=clock.getElapsedTime()
    for(let i=0;i<count; i++){
        const x=particlesGeometry.attributes.position.getX(i)
        particlesGeometry.attributes.position.setY(i,Math.sin(elapsed + x))
        particlesGeometry.attributes.color.setXYZ(
            i,
            Math.abs(Math.sin(elapsed + x)),
            Math.abs(Math.sin(elapsed + x + 2)),
            Math.abs(Math.sin(elapsed + x + 4))
            
        )
    }
    particlesGeometry.attributes.position.needsUpdate=true
    particlesGeometry.attributes.color.needsUpdate=true
    renderer.render(scene,camera)
}
tick()