// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// Transformation matrix.
	var translation_mat = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotation_x_mat = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	var rotation_y_mat = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	var rotation = MatrixMult( rotation_x_mat, rotation_y_mat);
	var transformation = MatrixMult(  translation_mat, rotation );
	var mvp = MatrixMult( projectionMatrix, transformation );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations

		// Compile the shader program
		this.prog = InitShaderProgram( meshVS, meshFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		
		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'vertPos' );
		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();

		this.show_pos = gl.getUniformLocation(this.prog, 'show_pos');	
		gl.useProgram( this.prog );
        gl.uniform1i(this.show_pos, false);

		this.swap_pos = gl.getUniformLocation(this.prog, 'swap_bool');
		gl.uniform1i(this.swap_pos, false);

		this.txtcoordPos = gl.getAttribLocation(this.prog, 'txc');
        this.txtcoordbuffer = gl.createBuffer();
		
		//this.trianglesbuffer = gl.createBuffer();

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
	setMesh( vertPos, texCoords )
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
		
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram( this.prog );
        gl.uniform1i(this.swap_pos, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mvp, false, trans );

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


		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.uniform1i(this.show_pos, true);

	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram( this.prog );
        gl.uniform1i(this.show_pos, show);
	}
}

var meshVS = `
	attribute vec3 vertPos;
	attribute vec2 txc;
	uniform mat4 mvp;
	uniform bool swap_bool;
	

	varying vec2 texCoord;

		void main()
		{
			if (swap_bool){
				gl_Position = mvp * vec4(vertPos[0],vertPos[2], vertPos[1],1);
			}else{
				gl_Position = mvp * vec4(vertPos,1);}
			texCoord = txc;
		}
	`;

	// Fragment shader source code
	// Fragment shader source code
	var meshFS = `
		precision mediump float;
        uniform bool show_pos;
		uniform sampler2D tex;

		varying vec2 texCoord;

		void main()
		{
			if (show_pos){
				gl_FragColor = texture2D(tex, texCoord);
			} else {
				gl_FragColor =  vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
			}
		}

		`;