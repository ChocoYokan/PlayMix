let duration, videoStatus = 2, isMousePressed = false;
updateSeekBar();

const spotify = document.getElementById('spotify');
spotify.addEventListener('click', async () => {
    await window.require.oauthSpotify();
});

let youtubePlayer, mediaType = "Spotify", playingMediaId;

//------Youtube処理用------

function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube', {
        playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
        },
        events: {
            'onStateChange': onStateChange,
        }
    });
}

function onStateChange(event) {
    if (event["data"] === 1) {
        const videoData = youtubePlayer.getVideoData();
        setMediaInfo(videoData["title"], videoData["author"]);
        setDuration(youtubePlayer.getDuration());
    }
    setVideoStatus(event["data"]);
}

function setYoutubeVideo(code) {
    mediaType = "Youtube";
    youtubePlayer.loadVideoById({ "videoId": code });
}

function setSpotifyMusic(code) {
    mediaType = "Spotify";
    const token = await window.require.getSpotifyAccesssToken();
}

const playButton = document.getElementById('btn-play');
playButton.addEventListener('click', async () => {
    if (mediaType === "Youtube") {
        if (videoStatus === 1) {
            youtubePlayer.pauseVideo();
        }
        if (videoStatus === 2) {
            youtubePlayer.playVideo();
        }
    }
    if (mediaType === "Spotify") {
        const token = await window.require.getSpotifyAccesssToken();
        const res_devices = await fetch("https://api.spotify.com/v1/me/player/devices", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const devices = await res_devices.json();

        if (videoStatus === 1) {
            await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${devices['devices'][0].id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            setVideoStatus(2);
        } else if (videoStatus === 2) {
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${devices['devices'][0].id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({})
            });
            setVideoStatus(1);
        }
    }
});

const slider = document.getElementById('slider');
slider.addEventListener('input', () => {
    const val = slider.value;
    youtubePlayer.seekTo(Math.round((val / 100.0) * duration), false);
    updateSeek(val);
});
slider.addEventListener('change', () => {
    const val = slider.value;
    youtubePlayer.seekTo(Math.round((val / 100.0) * duration), true);
    updateSeek(val);
});
slider.addEventListener('mousedown', () => {
    isMousePressed = true;
})

slider.addEventListener('mouseup', () => {
    isMousePressed = false;
})

function Update() {
    if (!isMousePressed) {
        updateCurrentTime(youtubePlayer.getCurrentTime());
    }
    console.log(videoStatus);
}

//------共通の処理用関数------

function setMediaInfo(title, author) {
    const musicTitle = document.getElementById('music-title');
    const musicSinger = document.getElementById('music-singer');
    musicTitle.innerHTML = title;
    musicSinger.innerHTML = author;
}

function setDuration(d) {
    const durationLabel = document.getElementById('duration');
    durationLabel.innerHTML = secToTime(d);
    duration = d;
}

function setVideoStatus(status) {
    const imgPlay = document.getElementById('img-play');
    if (status === 1) {
        imgPlay.src = "../static/pause.svg";
    }
    if (status === 2) {
        imgPlay.src = "../static/play.svg";
    }
    videoStatus = status;
}

function updateCurrentTime(time) {
    const timeLabel = document.getElementById('time');
    timeLabel.innerHTML = secToTime(time);
    const slider = document.getElementById('slider');
    slider.value = (time / duration) * 100;
    updateSeekBar();
}

function updateSeek(val) {
    const timeLabel = document.getElementById('time');
    timeLabel.innerHTML = secToTime((val / 100.0) * duration);
    updateSeekBar();
}

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
    const min = target.min
    const max = target.max
    const val = target.value
    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
}
rangeInputs.forEach(input => {
    input.addEventListener('input', handleInputChange)
})

setInterval(Update, 500);