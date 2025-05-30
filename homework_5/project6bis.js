var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );
//bool IntersectRayForShadow( Ray ray );


// Shades the given point and returns the computed color.

vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	

	float bias = 1e-3;
	for ( int i=0; i<NUM_LIGHTS; ++i ) {

	//for ( int i=0; i<100; ++i ) {
		// Check for shadows

		Ray ray_shadow;

		vec3 light_position = lights[i].position - position;
		ray_shadow.dir = normalize(light_position);
		ray_shadow.pos = position + bias*(ray_shadow.dir);
		bool notInShadow = IntersectRayForShadow(ray_shadow);
		
		// If not shadowed, perform shading using the Blinn model
		if(notInShadow){
			vec3 h = normalize(normalize(ray_shadow.dir) + view);
			float cosphi = dot(normal, h);
			float costheta = dot(normal, ray_shadow.dir);
			color = lights[i].intensity * (mtl.k_d*costheta);
			if ( cosphi > 0.0 ) {
				color += + mtl.k_s* pow(cosphi, mtl.n);
			}

		}
	}
	return color;
}


bool IntersectRayForShadow( Ray ray )
{
	bool hitSomething = true;
	// Test for ray-sphere intersection 
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		vec3 sphereCenter = spheres[i].center;
		float sphereRadius = spheres[i].radius;
		vec3 p_minus_c = ray.pos - sphereCenter;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, p_minus_c);
		float c = dot(p_minus_c, p_minus_c) - sphereRadius * sphereRadius;
		float Delta = b*b - 4.0*a*c;
		if (Delta>=0.0){
			float t1 = (-b + sqrt(Delta))/2.0*a;
			float t2 = (-b - sqrt(Delta))/2.0*a;
			
			if ((t1>0.0) && (t2>0.0)){
				hitSomething = false;
				return hitSomething;
			}
		}
	}
	return hitSomething;
}


// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	// Test for ray-sphere intersection 
	// If intersection is found, update the given HitInfo 
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		ray.dir = normalize(ray.dir);
		vec3 sphereCenter = spheres[i].center;
		float sphereRadius = spheres[i].radius;
		vec3 p_minus_c = ray.pos-sphereCenter;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, p_minus_c);
		float c = dot(p_minus_c, p_minus_c) - sphereRadius * sphereRadius;
		float Delta = b*b - 4.0*a*c;
		if (Delta>=0.0){
			float t1 = (-b + sqrt(Delta))/2.0*a;
			float t2 = (-b - sqrt(Delta))/2.0*a;
			float tempt = 1e30;
			float bias = 0.0;
			// find minimum positive solution
			if ((t1>bias) && (t2>bias)){
				tempt = min(t1, t2);
			} else if ((t1<bias) && (t2>bias)){
				tempt = t2;
			} else if ((t1>bias) && (t2<bias)){
				tempt = t1;
			}

			// If it is a better solution than already stored, replace it
			if ((tempt < hit.t) ){
				foundHit = true;
				hit.t = tempt;
				hit.position = ray.pos + hit.t * normalize(ray.dir);
				vec3 new_pos_minus_c = hit.position - sphereCenter;
				hit.normal = normalize(new_pos_minus_c); // normal = ray from center of sphere to position, normalized
				hit.mtl = spheres[i].mtl;
			}
		}
	}
	return foundHit;
}


vec3 Blinn( Material mtl, vec3 position, vec3 normal, vec3 view, vec3 clr )
{
	vec3 color = clr;
	

	float bias = 1e-3;
	for ( int i=0; i<NUM_LIGHTS; ++i ) {

	//for ( int i=0; i<100; ++i ) {

		Ray ray_reflex;

		vec3 light_position = lights[i].position - position;
		ray_reflex.dir = normalize(light_position);
		ray_reflex.pos = position + bias*(ray_reflex.dir);
		
		// If not shadowed, perform shading using the Blinn model
		
		vec3 h = normalize(normalize(ray_reflex.dir) + view);
		float cosphi = dot(normal, h);
		float costheta = dot(normal, ray_reflex.dir);
		color = lights[i].intensity * (mtl.k_d*costheta);
		if ( cosphi > 0.0 ) {
			color += + clr* pow(cosphi, mtl.n);
		}
	}
	return color;
}


// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.

vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			vec3 v;
			if (bounce==0) {
				h.t = hit.t;
				h.position = hit.position;
				h.normal = hit.normal;
				h.mtl = hit.mtl;
				
				v = view;
			}
			h.mtl.k_s=clr;
			float bias = 1e-3;
			r.dir = normalize(2.0 * dot(v, h.normal)*h.normal - v);
			r.pos = h.position + bias * r.dir  ;
			v = normalize( -ray.dir );
			// TO-DO: Initialize the reflection ray
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				clr = Blinn( h.mtl, h.position, h.normal, view, clr );
				// TO-DO: Update the loop variables for tracing the next reflection ray
				bool dummy = IntersectRay( h, r );
				//h = hit;
			} else {
				// The reflection ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;