import * as THREE from 'three'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'



const canvas = document.getElementById('canvas')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 1
scene.add(camera)

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

// simple test mesh — a sphere on the forehead
const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    new THREE.MeshBasicMaterial({ color: 'gold' })
)
scene.add(crown)



const video = document.createElement('video')
video.autoplay = true
video.playsInline = true
document.body.appendChild(video)

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream
    }).catch((err) => {
        console.error('Camera access denied:', err)
    })


let faceLandmarker = null

async function setupFaceLandmarker() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1
    })
    renderLoop()
}
function renderLoop() {
    requestAnimationFrame(renderLoop)

    if (faceLandmarker && video.readyState >= 2) {
        const results = faceLandmarker.detectForVideo(video, performance.now())
        console.log(results)
        if (results.faceLandmarks.length > 0) {
            console.log('face detected:', results.faceLandmarks[0])
            const landmarks = results.faceLandmarks[0]
            const forehead = landmarks[10]

            crown.position.x = (forehead.x - 0.5) * 2
            crown.position.y = -(forehead.y - 0.5) * 2
            crown.position.z = -forehead.z

            //smile detection
            if (results.faceBlendshapes.length > 0) {
                const blendshapes = results.faceBlendshapes[0].categories
                const getBlend = (name) => blendshapes.find(b => b.categoryName == name)?.score ?? 0

                const smileLeft = getBlend('mouthSmileLeft')
                const smileRight = getBlend('mouthSmileRight')
                const avgSmile = (smileLeft + smileRight) / 2

                if (avgSmile > 0.5) {
                    crown.material.color.set('yellow')
                    crown.scale.setScalar(1 + avgSmile)
                } else {
                    crown.material.color.set('gold')
                    crown.scale.setScalar(1)
                }
            }
        }
    }
    renderer.render(scene, camera)
}
setupFaceLandmarker()



        /*
        video, canvas {
    transform: scaleX(-1);
}
function takePhoto() {
    // create a temporary canvas same size as screen
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = window.innerWidth
    tempCanvas.height = window.innerHeight
    const ctx = tempCanvas.getContext('2d')

    // draw video frame first (background)
    ctx.save()
    ctx.scale(-1, 1)  // mirror to match CSS transform
    ctx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height)
    ctx.restore()

    // draw Three.js canvas on top
    ctx.drawImage(canvas, 0, 0)

    // convert to image URL
    const imageURL = tempCanvas.toDataURL('image/png')
    return imageURL
}
        */
