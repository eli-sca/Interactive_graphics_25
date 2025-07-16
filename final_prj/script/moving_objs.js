// Scandiuzzi Elisa 2069444

// Moving objects

///////////////////////////////////////////////////////////////////////////
// BALL

class Ball extends Mesh{
    constructor(dt, scale_percentage = 1) {
        
        super(TXT_BALL, "Ball", scale_percentage, new Vector3([0, -0.5, -10]),  0, 0,  0, false);
        this.starting_position = new Vector3([0, -5, -10]);
        this.color_num = getRandomInt(0, colors.length-1);
        this.color = new Vector([colors[this.color_num].max[0], colors[this.color_num].max[1], colors[this.color_num].max[2], 1.0]);
        // physics data
        this.position = this.starting_position.copy();
        this.velocity = new Vector3([1, 0.1 , 0]);
        this.acceleration = new Vector3([0, -1, 0]).mult_scalar(dt);
        this.mass = 1;
        this.radius = 1;
        this.time = 0;
        this.dt = dt;
        this.final_time =  getRandomInt(fps*3, Math.floor(fps*5)); // num frames

        this.distance_from_target = 0;
        
        this.target = new Target(scale_percentage);

        // Target game
        this.setTarget();


        // Model matrix
        // rotation is identity matrix
        this.traslation_matrix = new Translation(this.position);
        this.scale_matrix =new Scaling(this.scale_percentage);
        this.model_matrix = this.traslation_matrix.mult(this.scale_matrix).traspose();
    }

    update_position_data(new_position){
        // new_position in format Vector3([x, y, z]);
        this.position = new_position;
        this.traslation_matrix = new Translation(this.position);
        this.model_matrix = this.traslation_matrix.mult(this.scale_matrix).traspose();
    }

    is_under_horizont(){
        return this.position.data[1] < this.starting_position.y-0.01;
    }

    compute_distance_from_target(){
        return this.position.diff(this.target.position).norm();
    }

    setTarget(){
        let new_position = new Vector3([getRandomArbitrary(-6, 6), getRandomArbitrary(1, 4), this.position.z]) //getRandomArbitrary(-0.5, 0.5)]);

        this.target.update_position_data(new_position);

        let de_pos = ((new_position).diff(this.position)).div_scalar(this.final_time*this.dt);
        this.velocity = de_pos.diff(this.acceleration.mult_scalar((this.final_time-1)/2.0));


        // this.velocity = (this.target.diff(this.position).diff(this.acceleration.mult_scalar(this.final_time))).div_scalar(this.final_time);
    }

    setSimValues(){
        
        if(DEBUG && this.time == this.final_time){
            console.log("Target reached");
        }
        // console.log(this.velocity);
        this.time++;
        this.distance_from_target = this.compute_distance_from_target();
        let new_position = this.position.sum(this.velocity.mult_scalar(this.dt));

        this.update_position_data(new_position);
        this.velocity = this.velocity.sum(this.acceleration);
    }


    launch_new_ball(){
        this.color_num = getRandomInt(0, colors.length-1);
        this.color = new Vector([colors[this.color_num].max[0], colors[this.color_num].max[1], colors[this.color_num].max[2], 1.0]);
        this.update_position_data(this.starting_position.copy());
        this.time = 0; 
        this.setTarget();
    }
}



//////////////////////////////////////////////////////////////////////////
class BallDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// Compile the shader program
		this.prog = InitShaderProgram(gl, ballVS, ballFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp_pos = gl.getUniformLocation( this.prog, 'mvp' );
        this.mod_pos = gl.getUniformLocation( this.prog, 'mod' );
        this.color_pos = gl.getUniformLocation( this.prog, 'ballColor' );
        this.transparency_pos = gl.getUniformLocation( this.prog, 'transparency' );
        

		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'vertPos' );
        this.normPos = gl.getAttribLocation( this.prog, 'norm' );
		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();
        this.normbuffer = gl.createBuffer();

		gl.useProgram( this.prog );

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( mesh )
	{
        const vertCoords = mesh.vertices;
        const texCoords = mesh.texCoords;
		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertCoords.length / 3;

		gl.useProgram( this.prog );
        gl.uniform4fv(this.color_pos, new Float32Array(mesh.color.data));
        gl.uniform1f(this.transparency_pos, mesh.color.data[3]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertCoords), gl.DYNAMIC_DRAW );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertex_normals), gl.DYNAMIC_DRAW );
	}
	
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( matr_mod, view_matr )
	{   
        let mvp = matr_mod.mult(view_matr);

		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mvp_pos, false, mvp.data);
        gl.uniformMatrix4fv( this.mod_pos, false, matr_mod.data);

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );


        gl.bindBuffer( gl.ARRAY_BUFFER, this.normbuffer );
		gl.vertexAttribPointer( this.normPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normPos );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	

}

class Target extends Mesh{
    constructor(scale_percentage = 1, position = new Vector3([0, 0, 0])){
        super(TXT_BALL, "Target-Ball", scale_percentage, position,  0, 0,  0, false);
        
        this.color = new Vector([1.0, 1.0, 0, 0.4]);
        // Model matrix
        // rotation is identity matrix
        this.traslation_matrix = new Translation(this.position);
        this.scale_matrix = new Scaling(this.scale_percentage);
        this.model_matrix = this.traslation_matrix.mult(this.scale_matrix).traspose();
    }

    update_position_data(new_position){
        // new_position in format Vector3([x, y, z]);
        this.position = new_position;
        this.traslation_matrix = new Translation(this.position);
        this.model_matrix = this.traslation_matrix.mult(this.scale_matrix).traspose();
    }

}

var ballVS = `
	attribute vec3 vertPos;
    attribute vec3 norm;
	uniform mat4 mvp;
    uniform mat4 mod;

    varying vec3 vertPosTransf;
	varying vec3 normTransf;

		void main()
		{
			gl_Position = mvp * vec4(vertPos,1);
            vec4 vertPos4 = mod* vec4(vertPos, 1.0); 
			vertPosTransf = vec3(vertPos4) / vertPos4.w;;
			normTransf = norm;
		}
	`;

	// Fragment shader source code
	var ballFS = `
		precision mediump float;
        uniform vec4 ballColor;
        uniform float transparency;

        varying vec3 vertPosTransf;
		varying vec3 normTransf;

		void main()
        {

            vec3 lightPos = vec3(0.0, 1.0, 0.0);
            float shininessVal = 50.0;

            float Ka=0.40;   // Ambient reflection coefficient
			float Kd=0.60;   // Diffuse reflection coefficient
			float Ks=0.50;   // Specular reflection coefficient

			vec3 ambientColor;

			ambientColor = vec3(ballColor.x, ballColor.y, ballColor.z);

			
			vec3 diffuseColor =vec3(1.0, 1.0, 1.0);
			vec3 specularColor = vec3(1.0, 1.0, 1.0);


			vec3 N = normalize(normTransf);
			vec3 L = normalize(lightPos);

			// Lambert's cosine law
			float lambertian = max(dot(N, L),0.0);
			float specular = 0.0;
			if(lambertian > 0.0) {
				vec3 R = reflect(-L, N);      // Reflected light vector
				vec3 V = normalize(-vertPosTransf); // Vector to viewer
				
				// Compute the specular term
				float specAngle = max(dot(R, V), 0.0);
				specular = pow(specAngle, shininessVal);
			}

			gl_FragColor =  
                        vec4(Ka * ambientColor +
                        Kd * lambertian * diffuseColor +
								Ks * specular * specularColor, transparency);

		}

		`;

        



///////////////////////////////////////////////////////////////////////////
// FIREWORK

class Particle {
    constructor(starting_position = new Vector3([0, 0, 0]), speed = 1000, type = 0, phi = 0) {
        this.position = starting_position.copy();
        this.history = [starting_position.copy().data];
        let theta = 6*Math.PI*Math.random();
        
        let fuzzyness;
        let param;
        switch (type){
            case  3: // sphere
                fuzzyness= getRandomArbitrary(0.4, 1.5);
                param = this.sphere();
                break;
            case 1: // circle
                
                fuzzyness= getRandomArbitrary(0.8, 1);
                param = this.circle(phi);
                break;
            case 2: // heart
                fuzzyness= getRandomArbitrary(0.8, 1);
                param = this.heart();
                break;
            case 0: // star
                fuzzyness= getRandomArbitrary(0.8, 1.5);
                param = this.star();
                break;
            default:
                fuzzyness= getRandomArbitrary(0.8, 1.5);
                param = this.sphere();
                break;
        }
        
        // let param = this.heart();
        this.velocity = new Vector3([param.x, param.y, param.z]).mult_scalar(speed*fuzzyness);
        
        this.time_life = getRandomInt(min_possible_age_part, max_possible_age_part);
        this.actual_time = 0; 
        
    }

    sphere(){
        let theta = 2*Math.PI*Math.random();
        let phi = Math.PI*Math.random();
        let parametrization = {
            x: Math.cos(phi)*Math.cos(theta),
            y: Math.cos(phi)*Math.sin(theta),
            z: Math.sin(phi)
        }
        return parametrization;
    }

    circle(phi){
        let theta = 2*Math.PI*Math.random();
        let parametrization = {
            x: Math.cos(phi)*Math.cos(theta),
            y: Math.cos(phi)*Math.sin(theta),
            z: Math.sin(phi)
        }
        return parametrization;
    }
    heart(){
        let theta = 2*Math.PI*Math.random();
        let parametrization = {
            x: Math.pow(Math.sin(theta), 3),
            y: 1/16*(13 * Math.cos(theta)- 5 * Math.cos(2 * theta)- 2 * Math.cos(3 * theta)- Math.cos(4 * theta)),
            z: 0.0
        }
        return parametrization;
    }

    star(){
        let theta = 6*Math.PI*Math.random();
        let parametrization = {
            x: (Math.cos(theta)+5/2*Math.cos(2/3*theta))/2.0,
            y: (Math.sin(theta) - 5/2* Math.sin(2/3*theta))/2.0,
            z: 0.0
        }
        return parametrization;
    }
}


class Firework {
    constructor(dt, starting_position = new Vector3([0, 0, 0]), model_matrix = new Matrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), color_num) {
        
        this.dt = dt; // in seconds
        this.starting_position = starting_position;
        this.num_particles = 1000;
        this.particles = [];
        this.dimensions = [];
        this.color = colors[color_num];
        this.model_matrix = model_matrix;
        this.history_particles = [];

        this.instantiate_particles(getRandomInt(0, 1));

        this.acceleration = new Vector3([0, -0.1, 0]);
        this.part_pos = [];
        this.firework_life = 0;
        this.lines = [];
    }

    instantiate_particles(type = 0) {
        switch (type){
            case 0: // caso firework standard a palla
                this.num_particles = 2000;
                for (let i = 0; i < this.num_particles; i++) {
                    this.particles.push(new Particle(this.starting_position, 2, 3));
                    this.dimensions.push(getRandomInt(1,  3));
                }
                break;
            case 1: // caso firework con particelle di diversa dimensione
                let rnd = getRandomInt(0, 3);
                let phi = Math.PI*Math.random();
                for (let i = 0; i < this.num_particles; i++) {
                    this.particles.push(new Particle(this.starting_position, 1, rnd, phi));
                    this.dimensions.push(getRandomInt(1, 3));
                }
                break;
        }
    }

    update() {
        this.part_pos = []; // metto dati in un array flat per poterli passare al shader
        //ciclo dalla fine per evitare pb con splice

        this.firework_life++;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            
            this.part_pos.push(...this.particles[i].position.data);
            if (this.firework_life> this.particles[i].time_life) {
                this.particles.splice(i, 1); // se raggiunge la vità massima lo elimino
                this.dimensions.splice(i, 1);
            } else {
                // sistema dinamico per descrivere sistema di particelle
                this.particles[i].velocity = this.particles[i].velocity.sum(this.acceleration.mult_scalar(this.dt));
                this.particles[i].position = this.particles[i].position.sum(this.particles[i].velocity.mult_scalar(this.dt));
            }
        }
    }

    has_particles() {
        // return if there are particles alive
        return this.particles.length > 0;
    }
}

class FireworksDrawer {
    constructor() {
        this.prog = InitShaderProgram(gl, fireworkVS, fireworkFS);
        this.pos_buffer = gl.createBuffer();
        this.a_position = gl.getAttribLocation(this.prog, "a_position");
        this.dim_buffer = gl.createBuffer();
        this.a_dim = gl.getAttribLocation(this.prog, "a_dim");
        // this.color_pos = gl.getUniformLocation( this.prog, 'fw_color' );
        this.color_min_pos = gl.getUniformLocation( this.prog, 'fw_color_min' );
        this.color_max_pos = gl.getUniformLocation( this.prog, 'fw_color_max' );
        this.age_perc_pos = gl.getUniformLocation( this.prog, 'particle_age_perc' );
        this.flag_light_pos = gl.getUniformLocation( this.prog, 'is_light' );
        this.view_pos = gl.getUniformLocation( this.prog, 'view' );
        this.firework_life = 0;
        this.numPoints = 0;
        
    }

    setFirework(firework) {
        this.numPoints = firework.part_pos.length / 3;
        this.firework_life = firework.firework_life;
        gl.useProgram(this.prog); 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firework.part_pos), gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.a_position);
        gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.dim_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firework.dimensions), gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.a_dim);
        gl.vertexAttribPointer(this.a_dim, 1, gl.FLOAT, false, 0, 0);

        // gl.uniform3fv(this.color_pos, new Float32Array(firework.color));
        gl.uniform3fv(this.color_min_pos, new Float32Array(firework.color.min));
        gl.uniform3fv(this.color_max_pos, new Float32Array(firework.color.max));
        gl.uniform1f(this.age_perc_pos, firework.firework_life/max_possible_age_part);
    }

    draw(val, view) {
        
        
        gl.uniform1i(this.flag_light_pos, val);
        gl.uniformMatrix4fv( this.view_pos, false, view.data );

        

        gl.drawArrays(gl.POINTS, 0, this.numPoints);
        gl.enableVertexAttribArray(this.a_position);
    }}



var fireworkVS = `
    attribute vec3 a_position;
    attribute float a_dim;
    uniform bool is_light;
    uniform mat4 view;

    void main() {
        if (is_light){
            gl_Position = view*vec4(a_position, 1.0);
            gl_PointSize = a_dim;
        }
        else{
            gl_Position = view*vec4(a_position, 1.0);
            gl_PointSize = 1.0;
        }   
}
`;

var fireworkFS = `
    precision mediump float;
    uniform vec3 fw_color_min;
    uniform vec3 fw_color_max;
    uniform float particle_age_perc;
    uniform bool is_light;

    void main() {
    if (is_light){
        vec2 coord = gl_PointCoord;
        float dist = length(coord - vec2(0.5));
        if (dist > 0.5) discard;
        float intensity = smoothstep(0.5, 0.0, dist);

        vec3 fw_color = mix(fw_color_min, fw_color_max, particle_age_perc);
        gl_FragColor = vec4(fw_color, 1.0-particle_age_perc);
    }
    else{
        gl_FragColor = vec4(fw_color_max, 1.0-particle_age_perc*particle_age_perc); 
    }
}
`;

