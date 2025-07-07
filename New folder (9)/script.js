let currentAudio = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs
async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }

    return songs;
}

// Play music
const playmusic = (track) => {
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio("/songs/" + track + ".mp3");
    currentAudio.play();

    const playToggle = document.getElementById("playToggle");
    if (playToggle) {
        playToggle.src = "pause.svg";
    }

    currentAudio.onended = () => {
        if (playToggle) playToggle.src = "play.svg";
    };

    currentAudio.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentAudio.currentTime)} / ${secondsToMinutesSeconds(currentAudio.duration)}`
        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    });

    // Update the current song name in the UI
    const songNameElem = document.querySelector(".current-song-name");
    if (songNameElem) {
        songNameElem.innerText = track.replace(".mp3", "");
    }

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        if (currentAudio && currentAudio.duration) {
            currentAudio.currentTime = (percent / 100) * currentAudio.duration;
        }
    });
};

async function main() {
    let songs = await getSongs();
    let SONGul = document.querySelector(".songlist ul");

    for (const song of songs) {
        SONGul.innerHTML += `
            <li>
                <img src="music.svg" alt="">
                <div class="info">
                    <div class="songname">${song.replace(".mp3", "")}</div>
                    <div class="songartist">Umer</div>
                </div>
                <div class="playnow">
                    <span>play now</span>
                    <img src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Set click listeners
    document.querySelectorAll(".songlist ul li").forEach((li) => {
        li.addEventListener("click", () => {
            let songName = li.querySelector(".songname").innerText.trim();
            playmusic(songName);
        });
    });

    // Playbar toggle
    const playToggle = document.getElementById("playToggle");
    if (playToggle) {
        playToggle.addEventListener("click", () => {
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    playToggle.src = "pause.svg";
                } else {
                    currentAudio.pause();
                    playToggle.src = "play.svg";
                }
            }
        });
    }

    // Add transition to .left for smooth sliding
    const leftPanel = document.querySelector(".left");
    if (leftPanel) {
        leftPanel.style.transition = "left 0.3s ease, z-index 0s";
    }

    document.querySelector(".ham").addEventListener("click", () => {
        const left = document.querySelector(".left");
        left.style.left = "0";
        left.style.zIndex = "1000"; // Ensure .left is above .right
    });

const cross = document.querySelector(".close");
if (cross) {
    cross.style.transition = "all 0.5s ease-in-out";
}


    document.querySelector(".close").addEventListener("click", () => {
        const left = document.querySelector(".left");
        left.style.left = "-100%";
        left.style.zIndex = "-1"; // Reset z-index to hide it
    });
}

// ✅ Call main AFTER it's defined
main();
