console.log("lets write javascript");
let songs;
let currfolder;
let currentsong = new Audio();
function secondsTOMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {

        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li data-filename="${song}">
        <img src="img/music.svg" alt="music" srcset="">
        <div class="info">
            <div>${decodeURIComponent(song).replaceAll("-", " ")}</div>
            <div>nischal</div>
        </div>
        <div class="playnow">
            <img src="img/play.svg" alt="play" srcset="">
        </div>
    </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const filename = e.getAttribute("data-filename");
            console.log(filename);
            playMusic(filename);
        });
    });
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/songs/${currfolder}/` + encodeURIComponent(track);
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track).replaceAll("-", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the meta dat of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json `)
            let response = await a.json()
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <img src="img/play (1).svg" alt="play" fill="white" srcset="">
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="" srcset="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    })
}

async function main() {

    await displayAlbums()
    //get the list of all the songs
    await getsongs("cs")
    playMusic(songs[0], true);


    //attach an event listerner to play,next and pervious
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsTOMinutesSeconds(currentsong.currentTime)} / ${secondsTOMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentsong.currentTime / currentsong.duration) * 100}%`;
    })
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percentage = ((e.offsetX / e.target.getBoundingClientRect().width) * 100) + "%";
        document.querySelector(".circle").style.left = percentage + "%";
        currentsong.currentTime = (currentsong.duration * (parseFloat(percentage) / 100));
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        //document.querySelector(".hamburgercontent").style.left = "none";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-500px";
        //document.querySelector(".hamburgercontent").style.left = "none";
    })

    prev.addEventListener("click", () => {
    let currentFile = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFile);
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    let currentFile = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFile);
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    }
});

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(item.currentTarget.dataset.folder)
            playMusic(songs[0], false)
        })
    })

    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
            currentsong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
            currentsong.volume=0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value=20
        }
    })











}
main()
