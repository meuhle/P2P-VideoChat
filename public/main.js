const { PeerServer } = require('peer');
const socket = require('socket.io');


window.addEventListener("load", function(event){
    var peer_id;
    var username;
    var conn;
    
   /** var peer = new Peer({
        host: "localhost",
        port: 9000,
        path: '/peerjs',
        debug: 3,
        config: {
            'iceServers': [
                { url: 'stun:stun1.l.google.com:19302' },
                
            ]
        }
    });*/
    var peer = new Peer()

    peer.on('open', function (id) {
        document.getElementById("show-peer").innerHTML = id;
    });

    document.getElementById("AddUser").addEventListener('click', (e)=> {
        let user = document.getElementById("text_name").value
        let pw = document.getElementById("text_pw").value
    
        socket.emit('Register', {
            nome : user,
            password: pw
            })
        });



},false);