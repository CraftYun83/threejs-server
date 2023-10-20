import * as THREE from 'three';

let scene = new THREE.Scene();
const objectLoader = new THREE.ObjectLoader();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 5

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}

animate();

// Initiate Websocket

const ws = new WebSocket("ws://localhost:6942");

ws.addEventListener("open", () =>{
    return false;
});
 
ws.addEventListener('message', (data) => {
    try {
        var data = JSON.parse(data.data);
        if (data.type == "update") {
            var objectSerialized = JSON.parse(data.objects)
            var objectData = data.data
            scene = objectLoader.parse(objectSerialized)
            scene.traverse((object) => {
                if ( object.isMesh ) {
                    var data = objectData[object.uuid]
                    object.rotation.fromArray(data.rotation);
                    object.position.fromArray(data.position)
                    console.log(data)
                }
            })
            renderer.render( scene, camera );
        }
    } catch {}
});