"use strict";

let duration, videoStatus = 2, isMousePressed = false;

const init = () => {
    loadPlaylist();
}

init();
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

const truncate = (str, len=22) => str.length <= len ? str: (str.substr(0, len)+"...");

const search = document.getElementById('search');
const search_text = document.getElementById('search_text');
search.addEventListener('click', () => {
    // fetch('http://127.0.0.1:8000/api/search/?w='+ search_text.value)
    //     .then(response => response.json())
    //     .then(data => {
            // console.log(data);
            const data = {
                "results": [
                    {
                        "title": "[手書き]BADAPPLE!!　Fullﾊﾞｰｼﾞｮﾝ[完成]",
                        "url": "https://www.nicovideo.jp/watch/sm5058847",
                        "thumb": "https://nicovideo.cdn.nimg.jp/thumbnails/5058847/5058847",
                        "content_type": "nikoniko"
                    },
                    {
                        "title": "【邦楽BadApple!!】傷林果",
                        "url": "https://www.nicovideo.jp/watch/sm15183453",
                        "thumb": "https://nicovideo.cdn.nimg.jp/thumbnails/15183453/15183453",
                        "content_type": "nikoniko"
                    },
                    {
                        "title": "【それっぽく歌ってみました】邦楽BadApple!!-傷林果-【杏ノ助】",
                        "url": "https://www.nicovideo.jp/watch/sm15766933",
                        "thumb": "https://nicovideo.cdn.nimg.jp/thumbnails/15766933/15766933",
                        "content_type": "nikoniko"
                    },
                    {
                        "title": "BadApple!!PVを全てリンゴで再現してみた。",
                        "url": "https://www.nicovideo.jp/watch/sm9837984",
                        "thumb": "https://nicovideo.cdn.nimg.jp/thumbnails/9837984/9837984",
                        "content_type": "nikoniko"
                    },
                    {
                        "title": "【第7回MMD杯本選】BadApple!! feat.Miku＆Teto",
                        "url": "https://www.nicovideo.jp/watch/sm15356011",
                        "thumb": "https://nicovideo.cdn.nimg.jp/thumbnails/15356011/15356011",
                        "content_type": "nikoniko"
                    },
                    {
                        "title": "Bad Apple!! - Full Version w/video [Lyrics in Romaji, Translation in English]",
                        "url": "https://www.youtube.com/watch?v=9lNZ_Rnr7Jc",
                        "thumb": "https://i.ytimg.com/vi/9lNZ_Rnr7Jc/default.jpg",
                        "content_type": "youtube"
                    },
                    {
                        "title": "【東方】Bad Apple!!　ＰＶ【影絵】",
                        "url": "https://www.youtube.com/watch?v=RRFAMMwJxJw",
                        "thumb": "https://i.ytimg.com/vi/RRFAMMwJxJw/default.jpg",
                        "content_type": "youtube"
                    },
                    {
                        "title": "【BadApple!!】傷林果 【ShouRinka】",
                        "url": "https://www.youtube.com/watch?v=dx76YPgZviE",
                        "thumb": "https://i.ytimg.com/vi/dx76YPgZviE/default.jpg",
                        "content_type": "youtube"
                    },
                    {
                        "title": "Bad Apple!! feat.nomico　full",
                        "url": "https://www.youtube.com/watch?v=VbspAk-7g0M",
                        "thumb": "https://i.ytimg.com/vi/VbspAk-7g0M/default.jpg",
                        "content_type": "youtube"
                    },
                    {
                        "title": "【東方影繪】Bad Apple ＰＶ【彩版】",
                        "url": "https://www.youtube.com/watch?v=Je5OMIuI5mU",
                        "thumb": "https://i.ytimg.com/vi/Je5OMIuI5mU/default.jpg",
                        "content_type": "youtube"
                    },
                    {
                        "title": "Bad Apple!!",
                        "url": "https://open.spotify.com/track/3urItfkvXw8tPjwNs2lXdd",
                        "thumb": "https://i.scdn.co/image/ab67616d0000b2737d80e26b06c19ea155052923",
                        "content_type": "spotify"
                    },
                    {
                        "title": "BADAPPLE JUICE",
                        "url": "https://open.spotify.com/track/4t3EmCmWspjWR1t4xZxaBD",
                        "thumb": "https://i.scdn.co/image/ab67616d0000b273a329f5bff2c414a7818a2d08",
                        "content_type": "spotify"
                    },
                    {
                        "title": "Bad Apple!! - English Remaster",
                        "url": "https://open.spotify.com/track/64flSHeka6CUoz8XgCmgiT",
                        "thumb": "https://i.scdn.co/image/ab67616d0000b273fb75b75655918b909275fc79",
                        "content_type": "spotify"
                    },
                    {
                        "title": "Brain On Drugs (feat. Nino White Badapple)",
                        "url": "https://open.spotify.com/track/2LF3s6SvSCl2VYfNK2FNr9",
                        "thumb": "https://i.scdn.co/image/ab67616d0000b2733bb923b1f298a7c7dc5be78e",
                        "content_type": "spotify"
                    },
                    {
                        "title": "Bad Apple!! feat.nomico",
                        "url": "https://open.spotify.com/track/57JRZbE80MLsYbmb24cPee",
                        "thumb": "https://i.scdn.co/image/ab67616d0000b273c58e8c7222bea9bcc7782c1d",
                        "content_type": "spotify"
                    }
                ]
            }
            const result_content = document.getElementById("search_result");
            result_content.innerHTML = ``
            result_content.innerHTML += `<h1 class="text-4xl font-bold">Youtube</h1>`
            let row_y = document.createElement("div");
            row_y.classList.add("flex", "overflow-x-auto", "mt-2");
            for(let i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'youtube'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5", "hover");
                    let id = `y${i}`;
                    col.innerHTML = `
                        <div class="hover-img"><img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52"></div>
                        <p>${data.results[i].title}</p>
                        <div class="hover-text">
                            <p class="text1">${truncate(data.results[i].title)}</p>
                            <button
                                id="${id}"
                                class="content button p-0 w-10 h-10 bg-red-600 rounded-full hover:bg-red-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none">
                                <svg viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="w-6 h-6 inline-block">
                                    <path fill="#FFFFFF" d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                                            C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                                            C15.952,9,16,9.447,16,10z" />
                                </svg>
                            </button>
                            <input id="${id}Title" type="hidden" value="${data.results[i].title}">
                            <input id="${id}Type" type="hidden" value="youtube">
                            <input id="${id}Thumb" type="hidden" value="${data.results[i].thumb}">
                            <input id="${id}Url" type="hidden" value="${data.results[i].url}">
                        </div>
                    `
                    row_y.appendChild(col);
                }
            }
            result_content.appendChild(row_y);

            result_content.innerHTML += `<h1 class="text-4xl font-bold">ニコニコ動画</h1>`
            let row_n = document.createElement("div");
            row_n.classList.add("flex", "overflow-x-auto", "mt-2");
            for(let i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'nikoniko'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5", "hover");
                    let id = `n${i}`;
                    col.innerHTML = `
                        <div class="hover-img"><img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52"></div>
                        <p>${data.results[i].title}</p>
                        <div class="hover-text">
                            <p class="text1">${truncate(data.results[i].title)}</p>
                            <button
                                id="${id}"
                                class="content button p-0 w-10 h-10 bg-red-600 rounded-full hover:bg-red-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none">
                                <svg viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="w-6 h-6 inline-block">
                                    <path fill="#FFFFFF" d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                                            C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                                            C15.952,9,16,9.447,16,10z" />
                                </svg>
                            </button>
                            <input id="${id}Title" type="hidden" value="${data.results[i].title}">
                            <input id="${id}Type" type="hidden" value="nikodo">
                            <input id="${id}Thumb" type="hidden" value="${data.results[i].thumb}">
                            <input id="${id}Url" type="hidden" value="${data.results[i].url}">
                        </div>
                    `
                    row_n.appendChild(col);
                }
            }
            result_content.appendChild(row_n);

            result_content.innerHTML += `<h1 class="text-4xl font-bold">Spotify</h1>`
            let row_s = document.createElement("div");
            row_s.classList.add("flex", "overflow-x-auto", "mt-2");
            for(let i=0; i<data.results.length; i++){
                if(data.results[i].content_type == 'spotify'){
                    let col = document.createElement("div");
                    col.classList.add("flex-none", "w-60", "mr-5", "hover");
                    let id = `s${i}`;
                    col.innerHTML = `
                        <div class="hover-img"><img src="${data.results[i].thumb}"  alt=""  class="w-52 h-52"></div>
                        <p>${data.results[i].title}</p>
                        <div class="hover-text">
                            <p class="text1">${truncate(data.results[i].title)}</p>
                            <button
                                id="${id}"
                                class="content button p-0 w-10 h-10 bg-red-600 rounded-full hover:bg-red-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none">
                                <svg viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="w-6 h-6 inline-block">
                                    <path fill="#FFFFFF" d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                                            C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                                            C15.952,9,16,9.447,16,10z" />
                                </svg>
                            </button>
                            <input id="${id}Title" type="hidden" value="${data.results[i].title}">
                            <input id="${id}Type" type="hidden" value="spotify">
                            <input id="${id}Thumb" type="hidden" value="${data.results[i].thumb}">
                            <input id="${id}Url" type="hidden" value="${data.results[i].url}">
                        </div>
                    `
                    row_s.appendChild(col);
                }
            }
            result_content.appendChild(row_s);
        // });
        
    var trigger = document.querySelectorAll(".content");

    trigger.forEach(function(target) {
        target.addEventListener('click', addContent);
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
        const contents = playlist.contents;
        const contentsDom = contents.map( (content) => {
            return `
            <div class="flex-none w-60 mr-5 hover">
                <div class="hover-img"><img src="${content.thumbnail}"  alt=""  class="w-52 h-52"></div>
                <div class="hover-text">
                    <p class="text1">${truncate(content.name)}</p>
                </div>
            </div>
            `
        })
        if (contents.length < 1) {
            return "" //コンテンツが一つもないものは表示されない
        } else {
            return `
            <h1 class="text-4xl font-bold">${playlist.name}</h1>
            <div class="flex overflow-x-auto mt-2">
                ${contentsDom.join("")}
            </div>
            `
        }
    });
    playlistsDom.innerHTML = domData.join("");
}

// プレイリストの追加
const addPlaylistForm = document.getElementById('addPlaylistForm');
addPlaylistForm.addEventListener('submit', async (event) => {
     event.preventDefault();
     const form = document.forms['addPlaylist'];
     const name = form.elements['name'].value;
     const is_created = await window.electronAPI.addPlaylist(name);
     if (is_created) {
        playlistModal.classList.add("hidden"); //モーダルを閉じる
        overlay.classList.add("hidden");
        loadPlaylist();
     }
 });
    
/**
 * PlayListModal
 */
const playlistModal = document.getElementById("playlistModal"); //modalを指定
const overlay = document.querySelector(".overlay"); //overlayを指定
const addPlaylist = document.getElementById("addPlaylist");
// const btnCloseModals = document.querySelectorAll(".close-modal"); //modalを閉じるボタンを指定

//modalの開くボタンと閉じるボタンをクリックした時の処理
addPlaylist.addEventListener("click", () => {
    playlistModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
});
// btnCloseModals.forEach(function(btnCloseModal) {
//     btnCloseModal.addEventListener("click", () => {
//         playlistModal.classList.add("hidden");
//         contentModal.classList.add("hidden");
//         overlay.classList.add("hidden");
//     });
// });

/**
 * Content
 */

// コンテンツの追加
let name, contentType, thumbnail, url;
async function addContent(e) {
    const id = this.id;
    name = document.getElementById(`${id}Title`).value;
    contentType = document.getElementById(`${id}Type`).value;
    thumbnail = document.getElementById(`${id}Thumb`).value;
    url = document.getElementById(`${id}Url`).value;

    //Modalを生成
    const FormBody = document.getElementById("contentFormBody");
    const playlistData = await window.electronAPI.loadPlaylist();
    const contentDom = playlistData.map( (playlist) => { return `
        <div class="form-check">
            <input class="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" 
                type="radio" 
                name="playlistGroup" 
                value="${playlist.id}"
                id="${playlist.id}" required>
            <label class="form-check-label inline-block text-gray-800" for="${playlist.id}">
                ${playlist.name}
            </label>
        </div>
    `});

    FormBody.innerHTML = contentDom.join("");

    const openContentModal = () => {
        contentModal.classList.remove("hidden");
        overlay.classList.remove("hidden");
    }
    openContentModal();
}

// コンテンツの保存ボタンが押されたとき
const addContentForm = document.getElementById('addContentForm');
addContentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const radioGroup = document.getElementsByName("playlistGroup");
    const len = radioGroup.length;
    let checkedPlaylist = "";

    for (let i = 0; i < len; i++) {
        if(radioGroup.item(i).checked) {
            checkedPlaylist = radioGroup.item(i).value;
        }
    }

    const content = {
        playlist: checkedPlaylist,
        name: name,
        url: url,
        content_type: contentType,
        thumbnail: thumbnail,
        order: 0, //並び順はとりあえず保留
    }

    const is_created = await window.electronAPI.addContent(content);
    if (is_created) {
        contentModal.classList.add("hidden");
        overlay.classList.add("hidden");
        loadPlaylist();
    }
 });

// プレイリスト選択モーダル表示ContentModal
const contentModal = document.querySelector("#ContentModal");

setInterval(Update, 500);