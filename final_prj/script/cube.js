class Skybox {
    constructor() {
        this.progr = InitShaderProgram(gl, cubeVS, cubeFS);
        this.positionLocation = gl.getAttribLocation(this.progr, "a_position");
        this.skyboxLocation = gl.getUniformLocation(this.progr, "u_skybox");
        this.viewDirectionProjectionInverseLocation = gl.getUniformLocation(this.progr, "u_viewDirectionProjectionInverse");
        this.skybox_folder = null;
    }
    setGeometry() {
        gl.useProgram(this.progr); 
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        var positions = new Float32Array(
            [
            -1, -1,
            1, -1,
            -1,  1,
            -1,  1,
            1, -1,
            1,  1,
            ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }
    set_cubetexture(sky_box_info){
        gl.useProgram(this.progr); 
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        this.skybox_folder = sky_box_info["folder"];
        const cube_source = '../../objs/skybox/'+this.skybox_folder+'/';
        const faceInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
                url: cube_source+'right.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                url: cube_source+'left.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
                url: cube_source+'top.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                url: cube_source+'bottom.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
                url: cube_source+'front.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
                url: cube_source+'back.png',
            },
            ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = sky_box_info["dim"];
            const height = sky_box_info["dim"];
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;

            // setup each face so it's immediately renderable
            gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }

    drawcube(time){
        gl.useProgram(this.progr);

        // Turn on the position attribute
        gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.vertexAttribPointer( this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let angle;
        let camera_angle;
        if (this.skybox_folder == "venice"){
            angle = 28;
            camera_angle = 1.0;
        }
        else{
            angle = 60;
            camera_angle = time* .00002;

        }

        var projectionMatrix = m4.perspective(angle*Math.PI/180, aspect, 1, 2.5);

        // camera going in circle 2 units from origin looking at origin
        let cameraPosition = [Math.cos(camera_angle), 0, Math.sin(camera_angle)];// Math.sin(camera_angle)];
        let target = [0, 0, 0];
        let up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        let cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        let viewMatrix = m4.inverse(cameraMatrix);
        if (this.skybox_folder == "venice"){
            // Add roll movement due to the boat
            let roll = Math.sin(time * 0.001) * 0.02;  
            let rollMatrix1 = m4.zRotation(roll);
            roll = Math.cos(time * 0.001) * 0.02;  
            let rollMatrix2 = m4.yRotation(roll);
            let rollMatrix = m4.multiply(rollMatrix1, rollMatrix2);
            viewMatrix = m4.multiply(viewMatrix, rollMatrix);
        }


        // We only care about direciton so remove the translation
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

        // Set the uniforms
        gl.uniformMatrix4fv(
            this.viewDirectionProjectionInverseLocation, false,
            viewDirectionProjectionInverseMatrix);

        // Tell the shader to use texture unit 0 for u_skybox
        gl.uniform1i(this.skyboxLocation, 0);

        // let our quad pass the depth test at 1.0
        gl.depthFunc(gl.LEQUAL);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    }
}


var cubeVS = `
    attribute vec4 a_position;
    varying vec4 v_position;
    void main() {
        v_position = a_position;
        gl_Position = a_position;
        gl_Position.z = 1.0;
    }`;

var cubeFS = `
    precision mediump float;

    uniform samplerCube u_skybox;
    uniform mat4 u_viewDirectionProjectionInverse;

    varying vec4 v_position;
    void main() {
        vec4 t = u_viewDirectionProjectionInverse * v_position;
        gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));
    }
`;