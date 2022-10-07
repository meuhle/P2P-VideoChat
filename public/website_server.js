var User_list= [];
var on_call =[];
var socket_list = [];
var connection;
//SOCKET ------------------------
const express = require('express');
const app = express();
const http = require('http');
const server= http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
    var disconnected;
    //console.log(String(socket.client.id));
    for(var i=0;i<User_list.length;i++){
      if(User_list[i].includes(String(socket.client.id))){
        var s = User_list[i].split(':');
        var peer = s[1];
        disconnected = peer;
        User_list.splice(i,1);
        for(var i=0;i<on_call.length;i++){
          if(on_call[i].includes(peer)){
            on_call.splice(i,1);
          }
        }

      }
      console.log(disconnected)
      io.emit("close",disconnected)
      /*for(var v=0;v<on_call.length;v++){
        if(User_list[i].includes(on_call[v])){
          var s = User_list[i].split(':');
          var socket = s[3];
          const soc = await io.in(socket_list[u]).fetchSockets();
              for(const st of soc){
                st.emit('close',disconnected);
              }
        }
      }*/
    }
    
    //console.log(User_list.toString());
  });
  socket.on('register', (user)=>{
    //console.log("user name:" + user[0]);
    //console.log("user pw:" + user[1]);
    var cmd = "DECLARE @responseMessage NVARCHAR(250) EXEC dbo.AddUser @pUsername = '"+user[0]+"',@pPassword = '"+user[1]+"', @pPeer = '"+user[2]+"', @responseMessage = @responseMessage OUTPUT SELECT @responseMessage";
    const request = new Request(cmd, (err,rowCount)=>  {
      if (err) {
        console.error(err.message);
      } else {
        //console.log(`${rowCount} row(s) returned`);
      }
    }
  );
  connection.execSql(request);
  });

  socket.on('login', (user)=>{
    var cmd = "DECLARE @responseMessage NVARCHAR(250) EXEC dbo.Login @pUsername = '"+user[0]+"',@pPassword = '"+user[1]+"',@pPeer = '"+user[2]+"',@responseMessage =@responseMessage OUTPUT SELECT @responseMessage";
    const request = new Request(cmd, (err,rowCount)=>  {
      if (err) {
        console.error(err.message);
      } else {
        //console.log(`${rowCount} row(s) returned`);
        var us = user[0] + ":" + user[2] + ":" + socket.client.id +":" + socket.id;  //username peer socket.client socket
        if(!User_list.includes(us)){
          socket_list.push(socket.id);
          User_list.push(us);
        }
      }
    }
  );
  connection.execSql(request);
  });

  
  socket.on('refresh', ()=>{
    //console.log("list: "+ User_list.toString());
    io.emit('userlist',User_list)
  });

  socket.on('onCall', async (peerList)=>{
    for (var t=0;t<peerList.length;t++){
      if(on_call.length==0){
        on_call.push(peerList[t]);
      }else{
        if(!on_call.includes(peerList[t])){
            on_call.push(peerList[t]);
        }
        }
      }
    var sock = io.allSockets();
    //console.log(sock);
    //console.log("Sock lenght: "+ sock.length)
    //console.log(sock);
    //console.log(User_list);
    //console.log(on_call);
    for(var i=0;i<on_call.length;i++){   //per ogni peer incall
      for(var v=0;v<User_list.length;v++){ //per ogni utente server
        var s = User_list[v].split(':'); //splitta stringa server
        //console.log("s[0] = "+ s[0]);
        //console.log("s[1] = "+ s[1]);
        //console.log("s[2] = "+ s[2]);
        //console.log("s[3] = "+ s[3]);
        //console.log("on_call[i] : "+ on_call[i]);
        if (s[1].includes(on_call[i])){ //se peer oncall è nella stringa del server
          //console.log("trovata");
          for (var u=0; u<socket_list.length;u++){ //per ogni socket 
            //console.log("socket[u] = "+ socket_list[u]);
            if(socket_list[u].includes(s[3])){  //se socket contiene socket peer
              //console.log(sock[u])
              const soc = await io.in(socket_list[u]).fetchSockets();
              for(const st of soc){
                st.emit('inCall',on_call);
              }
              //console.log("so: "+so[0]);
              //so[0].emit('inCall',on_call);  //doing this
            }
          }
        }
      }
    }
  });

  socket.on("child", (child)=>{
    console.log("figlio: "+ child);
  })
  
});

//SOCKET END------------

//--------------DB---------------
const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
    authentication: {
      options: {
        userName: "Alex", 
        password: "SQLAlex.22" 
      },
      type: "default"
    },
    server: "localhost", 
    options: {
      database: "Poker", 
      encrypt: true,
      trustServerCertificate: true  //importante
    }
  };
function DB(){
  connection = new Connection(config);
  
  // Attempt to connect and execute queries if connection goes through
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connessione avvenuta con successo")
    }
  });
  
  connection.connect();
}
DB();
//DB END------------------------------------

var fs = require('fs');
const { SocketAddress } = require('net');
var index = fs.readFileSync(__dirname+'/index.html');

server.listen(8080, ()=> {
  console.log("Listening on 8080");
});