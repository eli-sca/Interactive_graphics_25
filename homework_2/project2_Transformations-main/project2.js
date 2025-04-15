// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	angle_radiant = rotation/180 *Math.PI;
	scale_mat = Array( scale, 0, 0, 0, scale, 0, 0, 0, 1 );
	rot_mat = Array( Math.cos(angle_radiant), Math.sin(angle_radiant), 0, -Math.sin(angle_radiant), Math.cos(angle_radiant), 0, 0, 0, 1 );
	transl_mat = Array( 1, 0, 0, 0, 1, 0, positionX, positionY, 1 );

	tot_trans = ApplyTransform( rot_mat,  transl_mat);
	tot_trans = ApplyTransform( scale_mat,  tot_trans);
	return tot_trans;
}


// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	matrix_mult = Array( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	// Compute 3x3 matrix multiplication
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			ind = Index(i,j);
			for (let k = 0; k < 3; k++) {
				matrix_mult[ind] += trans1[Index(i, k)] * trans2[Index(k, j)];
			}
		}
	}
	return matrix_mult;
}

function Index(i, j)
{
	return i * 3 + j;
}
