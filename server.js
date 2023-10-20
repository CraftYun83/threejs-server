const express = require("express")
const expressWs = require("express-ws")
const http = require("http");
const THREE = require("three");

let port = 6942;
let app = express();
let server = http.createServer(app).listen(port);    
let players = []
let scene;

function update(packet) {
    players.forEach((websocket) => {
        websocket.send(packet)
    })
}

function serializeScene() {
    return JSON.stringify(scene.toJSON())
}

// Three.JS Scene

scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

function animate() {
	cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    var serializedScene = serializeScene();
    var packet = {
        type: "update",
        objects: serializedScene,
        data: {}
    }

    scene.traverse( function( object ) {
        if ( object.isMesh ) {
            packet.data[object.uuid] = {
                rotation: object.rotation.toArray(),
                position: object.position.toArray()
            }
        };
    } );
    update(JSON.stringify(packet));
    setTimeout(animate, 3/50)
}

animate();

// Websocket Route

expressWs(app, server);

app.ws('/', async function(ws, req) {
    console.log("Joined")
    players.push(ws)
    ws.on('message', async function(msg) {
        players.forEach((player) => {
            player.send(msg)
        })
    });
    ws.on("close", function(err) {
        players.splice(players.indexOf(ws), 1);
        console.log("Disconnected")
    })
});