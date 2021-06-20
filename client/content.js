let videoplayer;
let adTimer;
let myid;
let roomid;
let iamhost = false;
let allusersinroom = [];

const socket = io('https://lets-party-server.herokuapp.com/');

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

// listen to hosts video player states

socket.on('videoStates', ({ isHostPaused, hosttime }) => {
	// sync video player pause and play
	if (isHostPaused) {
		videoplayer?.pause();
	} else {
		videoplayer?.play();
	}

	let diffOfSeek = videoplayer?.currentTime - hosttime;

	// sync time if any user is behind by more than 8 s (in case of poor connection)
	// or if any user is forward 8s than everyone
	if (diffOfSeek < -8 || diffOfSeek > 8) {
		videoplayer.currentTime = hosttime;
	}
});

/* HTML OUTPUT ON BROWSER */

const hostbutton = document.createElement('div');
hostbutton.innerHTML = 'Start New Room';

const status = document.createElement('div');
status.id = 'status-container';

const main_container = document.createElement('DIV');
const start_container = document.createElement('DIV');
const roomlabel = document.createElement('DIV');
const input = document.createElement('INPUT');
const nameinput = document.createElement('INPUT');
const joinbutton = document.createElement('DIV');
const closeBtn = document.createElement('div');

hostbutton.id = 'host-btn';
main_container.classList.add('main-container');
start_container.classList.add('start-container');

roomlabel.id = 'room-label';
input.id = 'room-id-input';
nameinput.id = 'name-id';
nameinput.placeholder = 'Enter display name';
input.placeholder = 'Enter room Code';
joinbutton.id = 'join-btn';
closeBtn.id = 'close-btn';

roomlabel.innerHTML = `OR`;
joinbutton.innerHTML = `Join`;
closeBtn.innerHTML = '❌';

start_container.appendChild(hostbutton);
start_container.appendChild(roomlabel);
start_container.appendChild(input);
start_container.appendChild(joinbutton);
start_container.appendChild(status);

start_container.appendChild(nameinput);

main_container.appendChild(start_container);
main_container.appendChild(closeBtn);

document.querySelector('body').appendChild(main_container);

hostbutton.addEventListener('click', () => {
	if (nameinput.value !== '') {
		localStorage.setItem('lets_party_uname', nameinput.value);
		socket.emit('joinmetothisroom', { roomid: myid, name: nameinput.value });
		roomid = myid;
		iamhost = true;
	} else {
		alert('Enter your display name');
	}
});

joinbutton.addEventListener('click', () => {
	if (input.value !== '' && nameinput.value !== '') {
		localStorage.setItem('lets_party_uname', nameinput.value);
		socket.emit('joinmetothisroom', {
			roomid: input.value,
			name: nameinput.value,
		});
		roomid = input.value;
	} else {
		alert('Enter your Code and Display Name');
	}
});

closeBtn.addEventListener('click', () => {
	main_container.style.right = '-100%';
});

socket.on('joinmetothisroomsuccess', (msg) => {
	let thecode = `<code class="roomcode">${msg}</code>`;

	roomlabel.style.display = 'none';
	input.style.display = 'none';
	joinbutton.style.display = 'none';
	hostbutton.style.display = 'none';
	nameinput.style.display = 'none';

	status.innerHTML = `Room Code: <br> ${thecode} <br> Tell everyone to join here! <br> <br> <br>`;

	/* 	setTimeout(() => {
		socket.emit('msg', { data: 'hey', roomid });
	}, 10000); */

	checkIsAdPlayng();
});

socket.on('someonejoined', (name) => {
	if (iamhost) {
		status.innerHTML += ` ${name} joined! <br>`;
		allusersinroom.push(name);
		socket.emit('tell_everyone_who_joined', {
			allusers: allusersinroom,
			roomid,
		});
	}
});

socket.on('who_joined', (allusers) => {
	if (!iamhost) {
		allusers?.forEach((user) => {
			status.innerHTML += ` ${user} joined! <br>`;
		});
	}
});

socket.on('msg', (msg) => {
	console.log(msg);
});

document.querySelector('body').appendChild(main_container);
