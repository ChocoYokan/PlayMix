updateSeekBar();
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player, duration;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'M7lc1UVf-VE',
        playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onStateChange,
        }
    });
}

function onPlayerReady(event) {
    const videoData = event.target.getVideoData();
    const musicTitle = document.getElementById('music-title');
    const musicSinger = document.getElementById('music-singer');
    musicTitle.innerHTML = videoData["title"];
    musicSinger.innerHTML = videoData["author"];

    duration = player.getDuration();
    const durationLabel = document.getElementById('duration');
    durationLabel.innerHTML = secToTime(duration);
}

const imgPlay = document.getElementById('img-play');
let videoStatus = 2;
function onStateChange(event) {
    videoStatus = event["data"];
    if (videoStatus === 1) {
        imgPlay.src = "../static/pause.svg";
    }
    if (videoStatus === 2) {
        imgPlay.src = "../static/play.svg";
    }
}

const slider = document.getElementById('slider');
const timeLabel = document.getElementById('time');
let isMousePressed = false;
function Update() {
    if (!isMousePressed) {
        const currentTime = player.getCurrentTime();
        timeLabel.innerHTML = secToTime(currentTime);
        slider.value = (currentTime / duration) * 100;
        updateSeekBar();
    }
}

const playButton = document.getElementById('btn-play');
playButton.addEventListener('click', () => {
    if (videoStatus === 1) {
        player.pauseVideo();
    }
    if (videoStatus === 2) {
        player.playVideo();
    }
});

slider.addEventListener('input', () => {
    const val = slider.value;
    timeLabel.innerHTML = secToTime((val / 100.0) * duration);
    player.seekTo(Math.round((val / 100.0) * duration), false);
    updateSeekBar();
});
slider.addEventListener('change', () => {
    const val = slider.value;
    player.seekTo(Math.round((val / 100.0) * duration), true);
    updateSeekBar();
});

slider.addEventListener('mousedown', () => {
    isMousePressed = true;
})

slider.addEventListener('mouseup', () => {
    isMousePressed = false;
})

const homeButton = document.getElementById('btn-home');
homeButton.addEventListener('click', () => {
    reset();
    const home = document.getElementById('main-home');
    home.style.display = 'block';
});

const searchButton = document.getElementById('btn-search');
searchButton.addEventListener('click', () => {
    reset();
    const search = document.getElementById('main-search');
    search.style.display = 'block';
});

function reset() {
    const main = document.querySelectorAll('.main-content');
    main.forEach(e => {
        e.style.display = 'none';
    })
}

//シークバー装飾用
function updateSeekBar() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');

    rangeInputs.forEach(slider => {
        const min = slider.min
        const max = slider.max
        const val = slider.value

        slider.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
    });
}

const rangeInputs = document.querySelectorAll('input[type="range"]');

function handleInputChange(e) {
    let target = e.target
    if (e.target.type !== 'range') {
        return;
    }
    const min = target.min
    const max = target.max
    const val = target.value

    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
}

rangeInputs.forEach(input => {
    input.addEventListener('input', handleInputChange)
})

//秒数から"時間:分:秒"に変換する関数
function secToTime(second) {
    let ret;
    const hour = Math.floor(Number(second) / 3600);
    const min = Math.floor(Number(second) % 3600 / 60);
    const sec = ('00' + Math.floor(Number(second) % 60)).slice(-2);
    if (hour > 0) ret += `${hour}:`
    ret = `${min}:${sec}`;
    return ret;
}

setInterval(Update, 500);