const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
	res.send('<h1>Lets Party Server</h1>');
});

io.on('connection', (socket) => {
	socket.emit('whoami', { id: socket.id });
	// join to the room
	socket.on('joinmetothisroom', ({ roomid, name }) => {
		socket.join(roomid);
		socket.emit('joinmetothisroomsuccess', `${roomid} `);
		io.to(roomid).emit('someonejoined', name);
	});

	// tell everyone who are here in the room
	socket.on('tell_everyone_who_joined', ({ allusers, roomid }) => {
		io.to(roomid).emit('who_joined', allusers);
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
