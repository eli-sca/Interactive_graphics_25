// Scandiuzzi Elisa 2069444
class Matrix {
    constructor(data_matrix, rows=null, cols=null) {
        if (rows  && cols) {
            //caso in cui conosco num righe e di colonne e passo un vettore di numeri
            this.rows = rows;
            this.cols = cols;
            if (data_matrix.length != rows * cols) {
                throw new Error("Error in Matrix inidices");
            }
            this.data = data_matrix;
        }
        else{
            //caso in cui passo una matrice come liste annidate
            this.rows = data_matrix.length;
            this.cols = data_matrix[0].length;
            this.data = [];
            for (let i = 0; i < this.rows; i++) {
                if (data_matrix[i].length != this.cols) {
                    throw new Error("Matrix not we defined");
                }
                for (let j = 0; j < this.cols; j++) {
                    this.data.push(data_matrix[i][j]);
                }
            }
        }
    }

    entry(i, j){
        // NB: i e j partono da 1, analogo a MATLAB
        return this.data[(i-1) * this.cols + (j-1)];
    }

    same_size(Mat2){
        return this.rows == Mat2.rows && this.cols == Mat2.cols;
    }

    sum(Mat2){
        if (!this.same_size(Mat2)) {
            throw new Error("Error: sizes not equal");
        }
        let res = [];
        for (let i = 0; i < this.data.length; i++) {
            res.push(this.data[i] + Mat2.data[i]);
        }
        return new this.constructor(res, this.rows, this.cols);
    }

    diff(Mat2){
        if (!this.same_size(Mat2)) {
            throw new Error("Error: sizes not equal");
        }
        let res = [];
        for (let i = 0; i < this.data.length; i++) {
            res.push(this.data[i] - Mat2.data[i]);
        }
        return new this.constructor(res, this.rows, this.cols);
    }

    mult_scalar(scalar){
        let res = [];
        for (let i = 0; i < this.data.length; i++) {
            res.push(this.data[i] * scalar);
        }
        return new this.constructor(res, this.rows, this.cols);
    }

    div_scalar(scalar){
        return this.mult_scalar(1 / scalar);
    }

    traspose(){
        let new_data = new Array(this.rows* this.cols).fill(null);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                new_data[c * this.rows + r] = this.data[r * this.cols + c];
            }
        }
        let traspose = new Matrix(new_data, this.cols, this.rows);
        return traspose;
    }

    mult(Mat2){
        if (Mat2.rows != this.cols) {
            throw new Error("Error in Matrix mult");
        }
        let res = [];
        for (let i = 1; i <= this.rows; i++) {
            for (let j = 1; j <= Mat2.cols; j++) {
                let sum = 0;
                for (let k = 1; k <= this.cols; k++) {
                    sum += this.entry(i,k) * Mat2.entry(k,j);
                }
                res.push(sum);
            }
        }
        return new Matrix(res, this.rows, Mat2.cols);
    }

    webgl_format(){
        return this.traspose().data;
    }

    copy(){
        return new Matrix([...this.data], this.rows, this.cols);
    }
}

class Vector extends Matrix {
    constructor(data) {
        super(data, data.length, 1); //matrix with 1 column
    }

    entry(i){
        return this.data[i-1];
    }

    traspose(){
        let traspose = new Row_Vect(this.data);
        return traspose;
    }

    dot_product(vect2){
        return vect2.traspose().mult(this).data[0];
    }

    norm(){
        return Math.sqrt(this.dot_product(this));
    }

    normalize(){
        let n = this.norm();
        if (n == 0) {
            throw new Error("Error: Vector of norm 0, can't normalize");
        }
        return this.mult_scalar(1/this.norm());
    }

    max(){
        return Math.max(...this.data);
    }

    min(){
        return Math.min(...this.data);
    }

    copy(){
        return new this.constructor([...this.data]);
    }
}

    

class Vector3 extends Vector {
    constructor(data) {
        if (data.length != 3) {
            throw new Error("Error: wrong size for Vector3");
        }
        super(data);
    }

    get x() { return this.data[0]; }
    set x(v) { this.data[0] = v; }

    get y() { return this.data[1]; }
    set y(v) { this.data[1] = v; }

    get z() { return this.data[2]; }
    set z(v) { this.data[2] = v; }

    cross_product(vect2){
        return new Vector([this.entry(2)* vect2.entry(3) - this.entry(3)* vect2.entry(2), this.entry(3)* vect2.entry(1) - this.entry(1)* vect2.entry(3), this.entry(1)* vect2.entry(2) - this.entry(2)* vect2.entry(1)]);
    }
}


class Row_Vect extends Matrix {
    constructor(data) {
        super(data, 1, data.length);
    }

    traspose(){
        traspose = new Vector(this.data);
        return traspose;
    }
}


class Rotation extends Matrix {
    constructor(axis, angle) {
        const ctheta = Math.cos(angle);
        const stheta = Math.sin(angle);
        let data;
        if (axis == 'x' || axis == 'X') {
            data = [1, 0, 0, 0, 0, ctheta, -stheta, 0, 0, stheta, ctheta, 0, 0, 0, 0, 1];
        }
        else if (axis == 'y' || axis == 'Y') {
            data = [ctheta, 0, stheta, 0, 0, 1, 0, 0, -stheta, 0, ctheta, 0, 0, 0, 0, 1];
        }
        else if (axis == 'z' || axis == 'Z') {
            data = [ctheta, -stheta, 0, 0, stheta, ctheta, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        else {
            let norm = axis.norm();
            if (norm == 0) {
                throw new Error("Error: Axis of norm 0, can't rotate");
            }
            if (norm != 1) {
                axis = axis.normalize();
                console.log("Axis of norm different from 1, used normalized axis: ",axis);
            }

            throw new Error("Error: Axis not implemented yet");


            
        }
        super(data, 4, 4);
    }
}


class Translation extends Matrix {
    constructor(tras) {
        let data = [1, 0, 0, tras.x, 0, 1, 0, tras.y, 0, 0, 1, tras.z, 0, 0, 0, 1];
        super(data, 4, 4);
    }
}

class Scaling extends Matrix {
    constructor(scale) {
        let data = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1];
        super(data, 4, 4);
    }
}

class Projection extends Matrix {
    constructor(c, n, f, fov_angle=60 ) {
        let aspect_ratio = c.width / c.height;
        let fov = from_grad_to_rad(fov_angle);
        let ang = Math.tan(fov/2); 

        let t = ang*n; //top
        let b = -t; //bottom
        let r = t*aspect_ratio; //right
        let l = -r; //left

        let data = [
            2*n/(r-l), 0, (r+l)/(r-l), 0,
            0, 2*n/(t-b), (t+b)/(t-b), 0,
            0, 0, -(f+n)/(f-n), -2*f*n/(f-n),
            0, 0, -1, 0
        ];
        super(data, 4, 4);
    }
}
