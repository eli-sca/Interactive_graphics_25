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