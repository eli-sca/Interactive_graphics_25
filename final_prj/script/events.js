// Scandiuzzi Elisa 2069444

const overlay_go = document.getElementById('overlay_go');
const retryBtn = document.getElementById('retryBtn');
const changeLevelBtn = document.getElementById('changeLevelBtn');
const optionsBtn = document.getElementById('optionsBtn');
const finalScore = document.getElementById('finalScore');
const overlay_opt = document.getElementById('overlay_options');
const closeOptionsBtn = document.getElementById('closeOptionsBtn');
const soundCheckbox = document.getElementById("soundCheckbox");
const visualEffectsCheckbox = document.getElementById("visualEffectsCheckbox");
const staticBgCheckbox = document.getElementById("staticBgCheckbox");
const difficultySelect = document.getElementById("difficultySelect");


// Show game over window and set final score
function showGameOver(points) {
    finalScore.textContent = "POINTS: " + points; // show final points
    overlay_go.style.display = 'flex';
}

// Hide game over window
function hideGameOver() {
    overlay_go.style.display = 'none';
}

function showOptions(){
    overlay_opt.style.display = 'flex';
}

function closeOptions(){
    overlay_opt.style.display = 'none';
}


// Play again same level
retryBtn.addEventListener('click', () => {
    if (DEBUG) {console.log('Play again clicked!');}
    hideGameOver();
    game.restart_same_city();

});

closeOptionsBtn.addEventListener('click', () => {
    closeOptions();
});



changeLevelBtn.addEventListener('click', () => {
    if (DEBUG) {console.log('Change level clicked!');}
    // qui cambi livello o mostri menu livelli
    hideGameOver();
    document.getElementById('levelOverlay').style.display = 'flex';
});

optionsBtn.addEventListener('click', () => {
    if (DEBUG) {console.log('Options clicked!');}
    showOptions();
});


const overlay_pause = document.getElementById('overlay_pause');
const restartBtn_pause = document.getElementById('restartBtn_pause');
const stop_pause = document.getElementById('stop_pause');
const optionsBtn_pause = document.getElementById('optionsBtn_pause');
const pauseScore = document.getElementById('pauseScore');


// pause options
pauseIcon.addEventListener('click', () => {
        game.toggle();
        pauseScore.textContent = "POINTS: " + game.points; // show final points
        overlay_pause.style.display = 'flex';
    });

// Hide pause window
function hidePause() {
    overlay_pause.style.display = 'none';
}


// Restart playing
restartBtn_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Play again clicked!');}
    game.toggle();
});



stop_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Stop clicked!');}
    hidePause();
    game.game_over();
    });

optionsBtn_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Options clicked!');}
    showOptions();
});



function startLevel(city) {
    if(DEBUG){console.log(`Avvio livello: ${city}`)};
    // Nascondi overlay e avvia il gioco
    document.getElementById('levelOverlay').style.display = 'none';
    game = new Game();
    game.load_game_start(city);
}



// let difficulty = 2; // 0 = easy, 1 = normal, 2 = hard, 3 = extreme
// let fps = 20;


soundCheckbox.addEventListener("change", () => {
    sounds = soundCheckbox.checked;
});


visualEffectsCheckbox.addEventListener("change", () => {
    extra_effects = visualEffectsCheckbox.checked;
});

staticBgCheckbox.addEventListener("change", () => {
    static_bg = staticBgCheckbox.checked;
});




difficultySelect.addEventListener("change", (e) => {
    const selectedDifficulty = e.target.value;
    console.log("Difficulty changed to:", selectedDifficulty);
});
