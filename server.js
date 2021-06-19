const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

const port = 5000 || process.env.PORT;

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
	socket.emit('whoami', { id: socket.id });
	// join to the room
	socket.on('joinmetothisroom', (roomid) => {
		socket.join(roomid);
		socket.emit('joinmetothisroomsuccess', `${roomid} `);
	});

	// check connection
	socket.on('msg', ({ data, roomid }) => {
		io.to(roomid).emit('msg', data);
	});

	// get video state
	socket.on('videoStates', ({ videoState, roomid }) => {
		io.to(roomid).emit('videoStates', videoState);
	});

	// disconnect
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(port, () => {
	console.log(`listening on ${port}`);
});
