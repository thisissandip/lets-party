let videoplayer;
let adTimer;
let myid;
let roomid;
let iamhost = false;

const socket = io('http://localhost:5000/');

socket.on('whoami', function ({ id }) {
	// console.log('myid', id);
	myid = id;
});

function checkIsAdPlayng() {
	adTimer = setInterval(() => {
		let isAd = document.querySelector('.ad-cta-wrapper');
		if (isAd === null) {
			getVideoPlayer();
		}
	}, 1000);
}

function getVideoPlayer() {
	clearInterval(adTimer);

	videoplayer = document.querySelector('video');
	videoplayer.removeAttribute('autoplay');

	//keep listening to the hosts videoplayer events, only host can control the play pause and seek
	if (iamhost) {
		setInterval(() => {
			syncVideoStates();
		}, 1000);
	}
}

function syncVideoStates() {
	let videoState = {
		hosttime: videoplayer?.currentTime,
		isHostPaused: videoplayer?.paused,
	};
	socket.emit('videoStates', { videoState, roomid });
}

// listen to other video player states

socket.on('videoStates', ({ isHostPaused, hosttime }) => {
	// sync video player pause and play
	if (isHostPaused) {
		videoplayer?.pause();
	} else {
		videoplayer?.play();
	}

	let diffOfSeek = videoplayer?.currentTime - hosttime;

	// sync time if user is behind by more than 10 s (in case of poor connection)
	// or if the user is forward 10s than everyone
	if (diffOfSeek < -10 || diffOfSeek > 10) {
		videoplayer.currentTime = hosttime;
	}
});

/* HTML OUTPUT ON BROWSER */

const hostbutton = document.createElement('div');
hostbutton.innerHTML = 'Start New Room';

const status = document.createElement('div');
status.id = 'status-container';

const main_container = document.createElement('DIV');
const roomlabel = document.createElement('DIV');
const input = document.createElement('INPUT');
const joinbutton = document.createElement('DIV');

hostbutton.id = 'host-btn';
main_container.classList.add('main-container');
roomlabel.id = 'room-label';
input.id = 'room-id-input';
input.placeholder = 'Enter Room Code';
joinbutton.id = 'join-btn';

roomlabel.innerHTML = `OR`;
joinbutton.innerHTML = `Join`;

main_container.appendChild(hostbutton);
main_container.appendChild(roomlabel);
main_container.appendChild(input);
main_container.appendChild(joinbutton);
main_container.appendChild(status);

document.querySelector('body').appendChild(main_container);

hostbutton.addEventListener('click', () => {
	socket.emit('joinmetothisroom', myid);
	roomid = myid;
	iamhost = true;
});

joinbutton.addEventListener('click', () => {
	if (input !== null) {
		socket.emit('joinmetothisroom', input.value);
		roomid = input.value;
	}
});

socket.on('joinmetothisroomsuccess', (msg) => {
	let thecode = `<code class="roomcode">${msg}</code>`;

	roomlabel.style.display = 'none';
	input.style.display = 'none';
	joinbutton.style.display = 'none';
	hostbutton.style.display = 'none';
	if (iamhost) {
		status.innerHTML = `You are in room ${thecode} Tell everyone to join here!`;
	} else {
		status.innerHTML = `You are in room ${thecode}`;
	}
	//main_container.style.display = 'none';

	setTimeout(() => {
		socket.emit('msg', { data: 'hey', roomid });
	}, 10000);

	checkIsAdPlayng();
});

socket.on('msg', (msg) => {
	console.log(msg);
});
