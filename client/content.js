let videoplayer;
let adTimer;
let myid;
let roomid;
let iamhost = false;

const socket = io('http://localhost:5000/');

socket.on('whoami', function ({ id }) {
	console.log('myid', id);
	myid = id;
});

// check if ad is playing (for non sub users)
function init() {
	adTimer = setInterval(() => {
		let isAd = document.querySelector('.ad-cta-wrapper');
		if (isAd === null) {
			getVideoPlayer();
		}
	}, 10000);
}

init();

function getVideoPlayer() {
	clearInterval(adTimer);
	videoplayer = document.querySelector('video');
	//keep listening to the hosts videoplayer events
	setInterval(() => {
		syncVideoStates();
	}, 1000);
}

function syncVideoStates() {
	let videoState = {
		currentTime: videoplayer?.currentTime,
		isPaused: videoplayer?.paused,
	};
	socket.emit('videoStates', { videoState, roomid });
}

// listen to other video player states

socket.on('videoStates', ({ isPaused, syncCurrentTime }) => {
	let ismyvideopaused = videoplayer?.paused;
	let mycurrentTime = videoplayer?.currentTime;

	// sync video player pause and play
	if (isPaused) {
		videoplayer?.pause();
	} else {
		videoplayer?.play();
	}

	// sync video currentTime
	/* 		if (mycurrentTime !== currentTime) {
		videoplayer?.currentTime = currentTime;
	} */
});

/* HTML OUTPUT ON BROWSER */

const hostbutton = document.createElement('div');
hostbutton.innerHTML = 'Start Hosting';

const main_container = document.createElement('DIV');
const roomlabel = document.createElement('DIV');
const input = document.createElement('INPUT');
const button = document.createElement('DIV');

main_container.classList.add('ce_main');
roomlabel.id = 'room-label';
input.id = 'ce_input';
button.id = 'ce_button';

roomlabel.innerHTML = `Enter Room Id`;
button.innerHTML = `Join`;

main_container.appendChild(hostbutton);
main_container.appendChild(roomlabel);
main_container.appendChild(input);
main_container.appendChild(button);

document.querySelector('body').appendChild(main_container);

hostbutton.addEventListener('click', () => {
	socket.emit('joinmetothisroom', myid);
	roomid = myid;
	iamhost = true;
});

button.addEventListener('click', () => {
	if (input !== null) {
		socket.emit('joinmetothisroom', input.value);
		roomid = input.value;
	}
});

socket.on('joinmetothisroomsuccess', (msg) => {
	console.log(msg);
	console.log('Tell everyone to join here');
	main_container.style.display = 'none';

	setTimeout(() => {
		socket.emit('msg', { data: 'hey', roomid });
	}, 10000);
});

socket.on('msg', (msg) => {
	console.log(msg);
});
