// Scandiuzzi Elisa 2069444
const overlay_go = document.getElementById('overlay_go');
const retryBtn = document.getElementById('retryBtn');
const changeLevelBtn = document.getElementById('changeLevelBtn');
const optionsBtn = document.getElementById('optionsBtn');
const finalScore = document.getElementById('finalScore');
const overlay_opt = document.getElementById('overlay_options');
const closeOptionsBtn = document.getElementById('closeOptionsBtn');
const soundCheckbox = document.getElementById("soundCheckbox");
const staticBgCheckbox = document.getElementById("staticBgCheckbox");
const difficultySelect = document.getElementById("difficultySelect");
const fpsSelect = document.getElementById("fpsSelect");
const lifepoints = document.getElementsByClassName("hearts");
const overlay_pause = document.getElementById('overlay_pause');
const restartBtn_pause = document.getElementById('restartBtn_pause');
const stop_pause = document.getElementById('stop_pause');
const optionsBtn_pause = document.getElementById('optionsBtn_pause');
const pauseScore = document.getElementById('pauseScore');

function updateLifepoints(life) { 
    // Change tesxt of life points div
    let new_string = "";
    switch (life) {
        case 3:
            new_string = "♡ ♡ ♡";
            break;
        case 2:
            new_string = "♡ ♡";
            break;
        case 1:
            new_string = "♡";
            break;
        default:
            new_string = "♡ ♡ ♡";
            break;
    }
    lifepoints[0].textContent = new_string;
}

// Show game over window and set final score
function showGameOver(points) {
    finalScore.textContent = "POINTS: " + points; // show final points
    overlay_go.style.display = 'flex'; //show div
}

// hide game over window
function hideGameOver() {
    overlay_go.style.display = 'none';
}

// Show options div
function showOptions(){
    overlay_opt.style.display = 'flex';
}

// Hide options div
closeOptionsBtn.addEventListener('click', () => {
    overlay_opt.style.display = 'none';
});



// Play again same level, clickable from game over
retryBtn.addEventListener('click', () => {
    if (DEBUG) {console.log('Play again clicked!');}
    hideGameOver();
    game.restart_same_city();

});


// Change level, show level selector, clickable from game over
changeLevelBtn.addEventListener('click', () => { 
    if (DEBUG) {console.log('Change level clicked!');}
    hideGameOver();
    document.getElementById('levelOverlay').style.display = 'flex';
});


// Open Options, clickable from game over
optionsBtn.addEventListener('click', () => {
    if (DEBUG) {console.log('Options clicked!');}
    showOptions();
});


// Pause icon click
pauseIcon.addEventListener('click', () => {
        game.toggle();
        pauseScore.textContent = "POINTS: " + game.points; // show final points
        overlay_pause.style.display = 'flex';
    });

// Hide pause window, used in toggle
function hidePause() {
    overlay_pause.style.display = 'none';
}


// Restart playing
restartBtn_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Play again clicked!');}
    game.toggle();
});


// Stop playing, clickable from pause
stop_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Stop clicked!');}
    hidePause();
    game.game_over();
    });

// Show options, clickable from pause
optionsBtn_pause.addEventListener('click', () => {
    if (DEBUG) {console.log('Options clicked!');}
    showOptions();
});

// selected level, hide div and start game
function startLevel(city) {
    if(DEBUG){console.log(`Avvio livello: ${city}`)};
    document.getElementById('levelOverlay').style.display = 'none';
    game = new Game();
    game.load_game_start(city);
}

////////////////////////////////////////////////////////////////////////
// Checkboxes options

// Sound
soundCheckbox.addEventListener("change", () => {
    sounds = soundCheckbox.checked;
});


// Static Background
staticBgCheckbox.addEventListener("change", () => {
    static_bg = staticBgCheckbox.checked;
});

// Difficulty -> change ball dimension and restart game
difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
    switch(difficulty){
        case "easy":
            game.dimension_ball =1.0;
            break;
        case "normal":
            game.dimension_ball =0.7 ;
            break;
        case "hard":
            game.dimension_ball =0.5;
            break;
        case "extreme":
            game.dimension_ball =0.3;
            break;
    }
    console.log("Difficulty changed to:", difficulty);
    game.restart_same_city();
    game.pause();
});


// FPS -> change fps and restart game
fpsSelect.addEventListener("change", (e) => {
    fps = e.target.value;
    console.log("Fps changed to:", fps);
    console.log("Difficulty changed to:", difficulty);
    game.restart_same_city();
    game.pause();
});





// Firework Explosion
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault(); // Impedisce lo scroll della pagina
        if(DEBUG){console.log("Space pressed");}    
        game.explode();}
    });


// // Pause if click on 'p'
// window.addEventListener('keydown', function(event) {
//     if (event.key === 'p' || event.key === 'P') {
//         if(DEBUG){console.log('p pressed');}
//         game.toggle();
//     }
// });



// If resize set again canvas size and webgl settings
window.addEventListener("resize", (event) => { UpdateCanvasSize(); })



