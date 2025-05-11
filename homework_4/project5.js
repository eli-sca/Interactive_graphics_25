// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	var mv = MatrixMult(trans, rotX);
	mv = MatrixMult(mv, rotY);
	
	return mv;
}


// Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// Compile the shader program
		this.prog = InitShaderProgram( meshVS, meshFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.mv = gl.getUniformLocation( this.prog, 'mv' );
		this.norm_mat = gl.getUniformLocation( this.prog, 'norm_mat' );
		
		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'vertPos' );
		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();

		this.show_pos = gl.getUniformLocation(this.prog, 'show_pos');	
		gl.useProgram( this.prog );
        gl.uniform1i(this.show_pos, false);

		this.lightdir_pos =  gl.getUniformLocation(this.prog, 'lightPos');
        gl.uniform3f(this.lightdir_pos, 0.0 , 0.0, 0.0);

		this.shininess_pos =  gl.getUniformLocation(this.prog, 'shininessVal');
		gl.uniform1f(this.shininess_pos, 100 );

		this.swap_pos = gl.getUniformLocation(this.prog, 'swap_bool');
		gl.uniform1i(this.swap_pos, false);

		this.txtcoordPos = gl.getAttribLocation(this.prog, 'txc');
        this.txtcoordbuffer = gl.createBuffer();

		this.normPos = gl.getAttribLocation( this.prog, 'norm' );
		this.normbuffer = gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		gl.useProgram( this.prog );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtcoordbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		
		// Abilita l'attributo delle coordinate texture
		gl.enableVertexAttribArray(this.txtcoordPos);
		gl.vertexAttribPointer(this.txtcoordPos, 2, gl.FLOAT, false, 0, 0);


		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        // Abilita l'attributo delle coordinate texture
		gl.enableVertexAttribArray(this.normPos);
		gl.vertexAttribPointer(this.normPos, 3, gl.FLOAT, false, 0, 0);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// Set the uniform parameter(s) of the vertex shader
		gl.useProgram( this.prog );
        gl.uniform1i(this.swap_pos, swap);	
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix3fv( this.norm_mat, false, matrixNormal );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		gl.useProgram( this.prog );
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


		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.uniform1i(this.show_pos, true);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// Set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram( this.prog );
		gl.uniform1i(this.show_pos, show);	
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



// Vertex shader source code


var meshVS = `
	attribute vec3 vertPos;
	attribute vec3 norm;
	attribute vec2 txc;
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform bool swap_bool;
	uniform mat3 norm_mat;
	
	varying vec3 vertPosTransf;
	varying vec3 normTransf;
	varying vec2 texCoord;

		void main()
		{
			vec4 vertPos4 = mv * vec4(vertPos, 1.0);
			vec3 vertPosTransf_temp = vec3(vertPos4) / vertPos4.w;
			vec3 normTransf_temp = norm_mat * norm;
			
			//vertPosTransf = vec3(mvp * vec4(vertPos,1));
			if (swap_bool){
				gl_Position = mvp * vec4(vertPos[0],vertPos[2], vertPos[1],1);
				vertPosTransf = vec3(vertPosTransf_temp[0], vertPosTransf_temp[2], vertPosTransf_temp[1]);
				normTransf = vec3(normTransf_temp[0], normTransf_temp[2], normTransf_temp[1]);
			}else{
				gl_Position = mvp * vec4(vertPos,1);
				vertPosTransf = vertPosTransf_temp;
				normTransf = normTransf_temp;
			}
			texCoord = txc;
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
			float Ka=0.80;   // Ambient reflection coefficient
			float Kd=0.70;   // Diffuse reflection coefficient
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