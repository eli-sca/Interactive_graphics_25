// Scandiuzzi Elisa 2069444

// TODO

//WebGL
    // [OPT] gestire trasformazione background
    
// disegna mesh 
    // capire come fare baking delle textures
    // capire meglio come gestire ombre
    // pulire codice delle mesh
    // aggiungere ombre alla palla

// [OPT] aggiungere luna che si muove e così cambia l'illuminazione

// fare palla del colore del fuoco d'artificio

// Dinamica di gioco
    // definire Settings del gioco
        // presenza o meno di luci
        // presenza o meno di sfondo animato

//gestire livelli
    // fare livello new york
    // [OPT] fare livello roma
    // [OPT] fare livello venezia

// fare esplosione fuoco d'artificio
    // fare scintille, 
        //capire come fare scintille
    // [OPT] capire se si può fare con altre mesh

// gestire luci
    // riflesso su acqua delle scintille

// togliere file obj che non si usano

// [OPT] gestire rumori
    // trova rumore di salita 
    // trova rumore di esplosione
    // trova rumore scintille 
    // aggiungi rumore agli eventi
    // [opt] gestisci diversi timing dei rumori

// [OPT]
    // aggiungere elementi dinamici sullo sfondo


    //città
    //Roma
    // canzone:
    // difficoltà: flash dei turisti, furgoncino e corriera che passano
    // oggetti: colosseo, strada, furgone, corriera, statua, 

    //Venezia
    // canzone: rondo veneziano
    // difficoltà: barca che oscilla
    // oggetti: barca, edifici di venezia, colonna con leone o leoni

    //New York
    // canzone: fireworks 
    // difficoltà:
    // oggetti:

    // Il Cairo
    // canzone: ??? 
    // difficoltà: tempesta di sabbia
    // oggetti: sabbia, piramidi sfinge 


    // 
    // Gestire trasformazioni geometriche -- FATTO
        // definire matrice di proiezione 
//////////////////////////////////////////////////////////////


const DEBUG = true;

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Ball OBJ
let TXT_BALL = "";

let skyboxLocation = null;


// OPTIONS SETTINGS
let sounds = false;
let extra_effects = true;
let static_bg = false;
let difficulty = "hard";
let fps = 20;

// const colors = [
//     {name: 'red', min: [230, 219, 210], max: [215, 35, 40]},
//     {name: 'green', min: [227, 228, 219], max: [86, 99, 53]},
//     {name: 'pink', min: [230, 198, 226], max: [196, 73, 131]},
//     {name: 'yellow', min: [230, 231,148], max: [192, 153, 47]},
//     {name: 'blue', min: [66, 88, 199], max: [41, 35, 96]},
//     {name: 'brown', min: [248, 211, 188], max: [169, 110, 75]}
// ];

const colors = [
    {name: 'red', min: [1, 1, 1], max: [241, 52, 72]},
    {name: 'green', min: [1, 1, 1], max: [0, 246, 150]},
    {name: 'pink', min: [1, 1, 1], max: [236, 39, 155]},
    {name: 'yellow', min: [1, 1, 1], max: [243, 155, 67]},
    {name: 'blue', min: [1, 1, 1], max: [62, 52, 200]},
    {name: 'brown', min: [1, 1, 1], max: [255, 139, 56]}
];


for (let i = 0; i < colors.length; i++) {
    colors[i].max = colors[i].max.map(v => v / 255);
}

async function load_TXT_sphere(){
    // Load ball OBJ file
    TXT_BALL = await loader.loadOBJ('ball');
    return TXT_BALL
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////


var max_possible_age_part = fps*2;
var min_possible_age_part = fps*1.5;


class Shader{
    constructor(gl, vertexShader, fragmentShader){
        this.gl = gl;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.createProgram();
    }
}

var view_matrix = null;



class Game {
    constructor() {
        // utils
        this.meshdrawer = new MeshDrawer();
        this.balldrawer = new BallDrawer();
        this.fireworksdrawer = new FireworksDrawer();
        this.skybox = new Skybox();
        this.soundplayer = new SoundPlayer();
        


        this.is_game_ongoing = false;
        this.intervalId = null;
        this.started = false;
        this.life = 3;

        this.dimension_ball =0.05;

        // settings
        this.city = null;
        this.fps = fps;

        // this.flag_shadow = False;
        // this.flag_fog = False;
        // this.flag_reflexion = False;

        // game dynamics
        this.points = 0;
        this.frame = 0;
        this.time = 0;
        this.dt = 1000/this.fps;
        this.clicked = false;

        // 3d objects
        this.bck_meshes = null;
        this.ball = null;

        this.projectionMatrix = null;

        this.fireworks = [];
        
    }

    async load_game_start (name_city) {
        
        if (!this.started){
            this.started = true;
            console.log('Start game');
            let data = await loader.loadjson(name_city);

            // Load data of selected level
            skyboxLocation = data.levels[name_city].skybox;
            const oggetti = data.levels[name_city].bckground_objs;
            const soundtrack = data.levels[name_city].soundtrack;

            this.bck_meshes = await loader.loadLevelBackgroundOBJs(oggetti);
            this.soundplayer.load_track(soundtrack);
            this.skybox.setGeometry();
            this.skybox.set_cubetexture(skyboxLocation);


            this.ball = new Ball(this.dt*0.001, this.dimension_ball);
            
            this.start();
        }
        else {
            console.log('Game already started');
        }
    }

    restart_same_city(){
        console.log(this.ball);
        this.is_game_ongoing = false;
        this.intervalId = null;
        this.started = false;
        this.life = 3;

        this.points = 0;
        this.frame = 0;
        this.time = 0;
        this.dt = 1000/this.fps;
        this.clicked = false;
        this.ball = new Ball(this.dt*0.001, this.dimension_ball);

        this.fireworks = [];

        this.start();
    }

    start () {
        console.log('Start game');
        if (sounds) {this.soundplayer.playMusic();}
        pauseIcon.style.display = 'inline-block';
        this.intervalId =  setInterval(() => this.gamesteps(), this.dt); // setInterval(ball.setSimValues(this.dt), this.dt);
        this.is_game_ongoing = true;
    }

    gamesteps(){
        this.frame++;
        this.time += this.dt;
        if (this.ball.is_under_horizont()) {
            this.game_over();}
        this.draw_frame();
        this.ball.setSimValues();
        
    }

    game_over () {
        console.log('Game Over');
        this.pause();
        showGameOver(this.points);
    }

    draw_frame(){

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        
        this.skybox.drawcube(this.time);
        // draw background
        for (const bck_mesh of this.bck_meshes){
            this.meshdrawer.setMesh(bck_mesh);
            this.meshdrawer.draw(bck_mesh.model_matrix, view_matrix);
        }
        // draw ball
        this.balldrawer.setMesh(this.ball);
        this.balldrawer.draw(this.ball.model_matrix);

        

        this.balldrawer.setMesh(this.ball.target);
        this.balldrawer.draw(this.ball.target.model_matrix);
        for (let i = this.fireworks.length -1; i >= 0; i--) {
            if (this.fireworks[i].has_particles()) {
                this.fireworks[i].update(this.dt*0.001);
                // this.debug_point =  this.fireworks[0].part_pos;
                this.fireworksdrawer.setFirework(this.fireworks[i]);
                this.fireworksdrawer.draw(false);
                // this.fireworksdrawer.setFirework(this.fireworks[i]);
                // this.fireworksdrawer.draw(true);
                
            }
            else {
                this.fireworks.splice(i, 1);
            };
        }
        // this.pointdrawer.setPoints3D(this.debug_point);
        // this.pointdrawer.draw();

    }
    pause () {
        this.soundplayer.pauseMusic();
        clearInterval(this.intervalId);
        pauseIcon.style.display = 'none';
        this.is_game_ongoing = false;
    }

    toggle() {
        if (this.is_game_ongoing) {
            this.pause()
        } else {
            hidePause();
            this.start()

        }
    }

    explode() {
        this.fireworks.push(new Firework(this.dt*0.001, this.ball.position.copy(), new Matrix([1, 0, 0, 0, 0,1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])));
        this.points += this.compute_new_points(this.ball.distance_from_target);
        if (this.life == 0) {this.game_over();}
        document.getElementById('score').textContent = "POINTS: " + this.points;

        this.ball.launch_new_ball();

    }

    compute_new_points(distance) {
        // funzione che calcola i punti da aggiungere allo score, funzione con thresholds
        if (distance < 0.01) {
            return 10;
        }
        else if (distance < this.dimension_ball/2.0) {
            return 5;
        }
        else if (distance < this.dimension_ball ) {
            return 1;
        }
        else {
            this.life--;
            updateLifepoints(this.life);
            return 0;
        }
    }

}




// Event listeners
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault(); // Impedisce lo scroll della pagina
        if(DEBUG){console.log("Space pressed");}    
        game.explode();}
    });


// Pause if click on 'p' or if i click on the pause icon
window.addEventListener('keydown', function(event) {
    if (event.key === 'p' || event.key === 'P') {
        if(DEBUG){console.log('p pressed');}
        game.toggle();
    }
});



// window.addEventListener('keydown', function(event) {
//     if (event.key === 's' || event.key === 'S') {
//         if(DEBUG){console.log('s pressed');}
//         game.load_game_start("new_york");
//     }
// });


// If resize set again canvas size and webgl settings
window.addEventListener("resize", (event) => { UpdateCanvasSize(); })



InitWebGL();

let game;
let loader = new Loader();
// let name_city = "new_york";

load_TXT_sphere();




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// Modify the code below to form the transformation matrix.

	// traslation
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// X rotation
	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	// Y rotation
	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var rot = MatrixMult(rotX, rotY)
	var mvp = MatrixMult( projectionMatrix, trans );
	mvp = MatrixMult( mvp, rot)
	return mvp;
}




