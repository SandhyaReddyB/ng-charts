// Configuration
const PORT = 8080;
const MESSAGE_RATE = 5;  // Messages per second;


const TIMEOUT = 1000 / MESSAGE_RATE;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const readline = require('readline');

app.use(express.static('public'));

io.on('connection', function (socket) {
    console.log('user connected');
    var buffer = [];
    var rl = readline.createInterface({
        input: fs.createReadStream('data/Time_HKLD.csv')
    });

    rl.on('line', function (line) {
        var arr = line.split(',');
        buffer.push({timestamp: arr[0], hkld: arr[1]});
    }).on('close', function () {});

    socket.on('disconnect', function () {
        console.log('user disconnected');
        rl.close();
        buffer = [];
    });

    var shift = function () {
        if(rl.input.closed && !buffer.length) {
            return;
        }
        if(buffer.length) {
            socket.emit('data', buffer.shift());
        }
        setTimeout(shift, TIMEOUT);
    };

    shift();
});

server.listen(PORT, function(){
    console.log('Server started. Browse http://localhost:' + PORT);
});
