// Scandiuzzi Elisa 2069444

class Mesh{
    constructor( txt_obj, name= "Mesh", scale_percentage = 1, position = new Vector3([0, 0, 0]), x_rot = 0, y_rot = 0, z_rot = 0, texture = null, static_obj = true){
        // load objs files, vertices in local space (origin in (0, 0, 0) and bounding box of max lenght 1 )
        this.name = name;
        this.vertices = [];
        this.texture_coords = [];
        this.vertex_normals = [];
        this.bounding_box = { flag_boundingbox: false,  min : new Vector3([null, null, null]), max : new Vector3([null, null, null])}; 
        this.scale = 1;
        this.center = null;
        this.max_size = null;
        this.texture = texture;
        this.load_from_OBJ(txt_obj);        
        

        // Save world coordinates of the mesh
        this.position = position;
        this.scale_percentage = scale_percentage;
        this.x_rot = from_grad_to_rad(x_rot);
        this.y_rot = from_grad_to_rad(y_rot);
        this.z_rot = from_grad_to_rad(z_rot);
        

        // Save mesh in world space
        if (static_obj) {
            this.model_matrix = this.get_model_matrix();
        }
        else {
            this.model_matrix = null;
        }
    }



    load_from_OBJ(txt_obj) {
        // Load OBJ file into arrays of mesh
        const lines = txt_obj.split('\n');
        let vertices_temp = [];
        let texture_coords_temp = [];
        let vertex_normals_temp = [];
        let flag_trastalation_computed = false;
        for (const full_line of lines){
            let line = full_line.trim();
            if (line.startsWith('v ')) {  // Recognise lines of vertices
                const parts = line.split(/\s+/); // Split line according to spaces
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);
                vertices_temp.push( {x, y, z});
                
                // Compute bounding box
                if(this.bounding_box.flag_boundingbox){
                    this.update_bounding_box([x, y, z]);
                }
                else{
                    this.initialize_bounding_box([x, y, z]);
                }
            }
            else if (line.startsWith('vt ')) {  // Recognise lines of texture coords
                const parts = line.split(/\s+/); // Split line according to spaces
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                texture_coords_temp.push({x, y});
            }
            else if (line.startsWith('vn ')) {  // Recognise lines of vertex normals
                const parts = line.split(/\s+/); // Split line according to spaces
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);
                vertex_normals_temp.push({ x, y, z });
            }
            else if (line.startsWith('f ')) {  // Recognise lines of faces
                let parts = line.split(/\s+/); // split line according to spaces
                // Remove "f" and split the rest

                if(!flag_trastalation_computed){
                    
                    this.center = (this.bounding_box.min).sum(this.bounding_box.max).div_scalar(2);    // min+max/2
                    this.max_size = (this.bounding_box.max.diff(this.bounding_box.min).max()); // maxarg(max-min)/2
                    flag_trastalation_computed = true;
                }
                const pt1 = parts[1];
                const pt2 = parts[2];
                const pt3 = parts[3];
                
                this.load_point(pt1, vertices_temp, texture_coords_temp, vertex_normals_temp);
                this.load_point(pt2, vertices_temp, texture_coords_temp, vertex_normals_temp);
                this.load_point(pt3, vertices_temp, texture_coords_temp, vertex_normals_temp);
            }
        };
        if (DEBUG){console.log(`Mesh ${this.name} loaded successfully`);}
        return this.vertices;

        
    }
    load_point(pt_str, vertices_temp, texture_coords_temp, vertex_normals_temp){
        // given a string of the type v/vt/vn, push the corresponding data into the arrays

        let indices = pt_str.split('/');
        indices = indices.map(n => parseInt(n)); //from str a int

        // load vertices data
        const vert = vertices_temp[indices[0] - 1]; 
        const tot_scale = (1.0/this.max_size);
        this.vertices.push((vert.x- this.center.x)*tot_scale, (vert.y- this.center.y)*tot_scale, (vert.z- this.center.z)*tot_scale);
        
        // load text coord data
        const text = texture_coords_temp[indices[1] - 1];
        if (text == undefined){
            this.texture_coords.push(0, 0);
        }
        else{
            this.texture_coords.push(text.x, text.y);
        }

        // load normals data
        const norm = vertex_normals_temp[indices[2] - 1]; 
        this.vertex_normals.push(norm.x, norm.y, norm.z);
    }

    initialize_bounding_box(point){
        // Initialize the bounding box with first vertex
        this.bounding_box.flag_boundingbox = true;

        for (let i = 0; i < 3; i++) {
            this.bounding_box.min.data[i] = point[i];
            this.bounding_box.max.data[i] = point[i];
        }
    }

    update_bounding_box(point){
        // Update the bounding box

        for (let i = 0; i < 3; i++) {
            if( this.bounding_box.min.data[i] > point[i]){
                this.bounding_box.min.data[i] = point[i];
            }
            else if(this.bounding_box.max.data[i] < point[i]){
                this.bounding_box.max.data[i] = point[i];
            }
        }        
    }

    compute_rotation(){
        const rotx_mat = new Rotation('x', this.x_rot);
        const roty_mat = new Rotation('y', this.y_rot);
        const rotz_mat = new Rotation('z', this.z_rot);
        return rotx_mat.mult(roty_mat).mult(rotz_mat);
    }

    get_model_matrix(){
        // Compute the model matrix, matrix computed once (mainly for background objects, moving objects have their own methods)
        const trans_mat = new Translation(this.position);        
        const rot_mat = this.compute_rotation();
        const scale_mat = new Scaling(this.scale_percentage);
        const trasformation_mat = trans_mat.mult(rot_mat).mult(scale_mat);
        
        return trasformation_mat;
    }

}






