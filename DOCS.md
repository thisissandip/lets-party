## Basics

```
io.on('connection', socket => {
socket.emit('request', ); // emit an event to the socket
io.emit('broadcast', ); // emit an event to all connected sockets
io.broadcast.emit('broadcast', ); // emit an event to all connected sockets except yourself
socket.on('reply', () => { }); // listen to the event
});
```
