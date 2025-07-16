class SoundPlayer {
    constructor() {
        this.music = document.getElementById('backgroundMusic');
        this.folder_music = "./audio/soundtrack/"
    }

    load_track(track_name){
        this.music.currentTime = 0;
        this.music.src = this.folder_music + track_name;
        this.music.load();
    }

    playMusic() {
        this.music.play();
    }

    pauseMusic() {
        this.music.pause();
    }

}



////////////////////////////////////////////////////////
// Sounds

const expl_audio = document.getElementById('explosion_sound');
const rocket_audio = document.getElementById('rocket_sound');
document.getElementById('bg_fireworks_sound').volume = 0.2;
document.getElementById('backgroundMusic').volume = 0.5;

function explosion_sound() {
    if (sounds) {
        if(!expl_audio.paused){
            expl_audio.pause();
            expl_audio.currentTime = 0;
        }
        expl_audio.play();};
}

// function rocket_sound() {
//     if (sounds) {
//         if(!rocket_audio.paused){
//             rocket_audio.pause();
//             rocket_audio.currentTime = 0;
//         }
//         rocket_audio.play();};
// }

function bg_fireworks_sound_play() {
    document.getElementById('bg_fireworks_sound').play();
}

function bg_fireworks_sound_pause() {
    document.getElementById('bg_fireworks_sound').pause();
}

function stop_sounds() {
    expl_audio.pause();
    expl_audio.currentTime = 0;
    // rocket_audio.pause();
    // rocket_audio.currentTime = 0;
    bg_fireworks_sound_pause();
}