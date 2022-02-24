"use strict";

const init = () => {
    loadPlaylist();
}

init();

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

const search = document.getElementById('search');
const search_text = document.getElementById('search_text');
search.addEventListener('click', () => {
    fetch('http://127.0.0.1:8000/api/search/?w='+ search_text.value)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const result_content = document.getElementById("search_result");
            result_content.innerHTML = ``
            result_content.innerHTML += `<h1 class="text-4xl font-bold">Youtube</h1>`
            let row_y = document.createElement("div");
            row_y.classList.add("flex", "overflow-x-auto", "mt-2");
            for(i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'youtube'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5");
                    col.innerHTML = `<img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52">` +
                                    `<p>${data.results[i].title}</p>`
                    row_y.appendChild(col);
                }
            }
            result_content.appendChild(row_y);

            result_content.innerHTML += `<h1 class="text-4xl font-bold">ニコニコ動画</h1>`
            let row_n = document.createElement("div");
            row_n.classList.add("flex", "overflow-x-auto", "mt-2");
            for(i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'nikoniko'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5");
                    col.innerHTML = `<img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52">` +
                                    `<p>${data.results[i].title}</p>`
                    row_n.appendChild(col);
                }
            }
            result_content.appendChild(row_n);

            result_content.innerHTML += `<h1 class="text-4xl font-bold">Spotify</h1>`
            let row_s = document.createElement("div");
            row_s.classList.add("flex", "overflow-x-auto", "mt-2");
            for(i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'spotify'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5");
                    col.innerHTML = `<img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52">` +
                                    `<p>${data.results[i].title}</p>`
                    row_s.appendChild(col);
                }
            }
            result_content.appendChild(row_s);
        });
});

/**
 * PlayList
 */
// プレイリストのロード
const playlistsDom = document.getElementById('playlists');
async function loadPlaylist() {
    //
    const playlistData = await window.electronAPI.loadPlaylist();
    const domData = playlistData.map( (playlist) => {
        return `
        <h1 class="text-4xl font-bold">${playlist.name}</h1>
        <div class="flex overflow-x-auto mt-2">
            <div class="flex-none w-60 mr-5">
                <div class="w-52 h-52 bg-white"></div>
            </div>
        </div>
        `
    });
    playlistsDom.innerHTML = domData.join("");
}

// プレイリストの追加
const addPlaylistForm = document.getElementById('addPlaylistForm');
addPlaylistForm.addEventListener('submit', async (event) => {
     event.preventDefault();
     const form = document.forms['addPlaylist'];
     const name = form.elements['name'].value;
     const is_created = await window.electronAPI.addPlaylist(name, name);
     if (is_created) {
        closeModal();
        loadPlaylist();
     }
 });
    
/**
 * PlayListModal
 */
const modal = document.querySelector(".modal"); //modalを指定
const overlay = document.querySelector(".overlay"); //overlayを指定
const addPlaylist = document.getElementById("addPlaylist");
const btnCloseModal = document.querySelector(".close-modal"); //modalを閉じるボタンを指定

//modalとoverlayのhiddenクラスを消す（modalとoverlayが見えるようにする）処理
const openModal = () => {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

//modalとoverlayのhiddenクラスを追加する（modalとoverlayが見えないようにする）処理
const closeModal = () => {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

//modalの開くボタンと閉じるボタンをクリックした時の処理
addPlaylist.addEventListener("click", openModal);
btnCloseModal.addEventListener("click", closeModal);



setInterval(Update, 500);