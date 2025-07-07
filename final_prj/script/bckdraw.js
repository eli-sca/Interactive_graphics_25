// Scandiuzzi Elisa 2069444
class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// Compile the shader program
		this.prog = InitShaderProgram(gl, meshVS, meshFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mod_pos = gl.getUniformLocation( this.prog, 'mod' );
		this.view_pos = gl.getUniformLocation( this.prog, 'view' );
		// poi c'è da mettere anche 
		// this.mv = gl.getUniformLocation( this.prog, 'mv' );
		// this.norm_mat = gl.getUniformLocation( this.prog, 'norm_mat' );
        this.show_pos = gl.getUniformLocation(this.prog, 'show_pos');
		this.lightdir_pos =  gl.getUniformLocation(this.prog, 'lightPos');
		this.shininess_pos =  gl.getUniformLocation(this.prog, 'shininessVal');

		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'vertPos' );
        this.txtcoordPos = gl.getAttribLocation(this.prog, 'txc');
		this.normPos = gl.getAttribLocation( this.prog, 'norm' );

		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();
        this.txtcoordbuffer = gl.createBuffer();
		this.normbuffer = gl.createBuffer();

		gl.useProgram( this.prog );
        gl.uniform1i(this.show_pos, false);
		gl.uniform3f(this.lightdir_pos, 1.0 , 0.0, 0.0);
		gl.uniform1f(this.shininess_pos, 20 );

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
	setMesh( mesh )
	{
        const vertCoords = mesh.vertices;
        const texCoords = mesh.texture_coords;
		const normals = mesh.vertex_normals;

		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertCoords.length / 3;

		gl.useProgram( this.prog );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtcoordbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		
        // Abilita l'attributo delle coordinate texture
        gl.enableVertexAttribArray(this.txtcoordPos);
        gl.vertexAttribPointer(this.txtcoordPos, 2, gl.FLOAT, false, 0, 0);

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        // Abilita l'attributo delle normals
		gl.enableVertexAttribArray(this.normPos);
		gl.vertexAttribPointer(this.normPos, 3, gl.FLOAT, false, 0, 0);
		
		this.setTexture(mesh.texture)
		
	}
	
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( model_matr, view_matr)
	{
		let trans = model_matr.data;
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mod_pos, false, trans );
		gl.uniformMatrix4fv( this.view_pos, false, view_matr.data );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	setTexture( img )
	{
		gl.useProgram( this.prog );
		gl.uniform1i(this.show_pos, true);
		// Create a texture.
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

		gl.generateMipmap(gl.TEXTURE_2D);

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.uniform1i(this.show_pos, true);

	}

	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// Set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram( this.prog );
		gl.uniform3f(this.lightdir_pos,  x, y, z);	
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram( this.prog );
		gl.uniform1f(this.shininess_pos, shininess );
	}
	
	
}

var meshVS = `
	attribute vec3 vertPos;
	attribute vec3 norm;
	attribute vec2 txc;
	uniform mat4 mod;
	uniform mat4 view;

	varying vec3 vertPosTransf;
	varying vec3 normTransf;
	varying vec2 texCoord;

		void main()
		{
			gl_Position = view* mod * vec4(vertPos,1);
			texCoord = txc;
			vec4 vertPos4 = mod* vec4(vertPos, 1.0); // da modificare con mv
			vertPosTransf = vec3(vertPos4) / vertPos4.w;;
			normTransf = norm;
		}
	`;

	// Fragment shader source code
	var meshFS = `
		precision mediump float;
        uniform bool show_pos;
		uniform sampler2D tex;
		uniform vec3 lightPos;
		uniform float shininessVal;

		varying vec3 vertPosTransf;
		varying vec3 normTransf;
		varying vec2 texCoord;


		void main()
		{
			float Ka=0.40;   // Ambient reflection coefficient
			float Kd=0.60;   // Diffuse reflection coefficient
			float Ks=0.50;   // Specular reflection coefficient

			vec3 ambientColor;

			if (show_pos){
				ambientColor = vec3(texture2D(tex, texCoord));
			} else {
				ambientColor =  vec3(0.46 ,0.46, 0.46);
			}
			
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

			gl_FragColor = vec4(Ka * ambientColor +
								Kd * lambertian * diffuseColor +
								Ks * specular * specularColor, 1.0);

		}

		`;