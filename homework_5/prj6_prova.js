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

bool notInShadow( Ray ray )
{
	float bias = 1e-3;
	vec3 biased_pos = ray.pos + bias * ray.dir;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		vec3 sphereCenter = spheres[i].center;
		float sphereRadius = spheres[i].radius;
		vec3 p_minus_c = biased_pos - sphereCenter;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, p_minus_c);
		float c = dot(p_minus_c, p_minus_c) - sphereRadius * sphereRadius;
		float Delta = b*b - 4.0*a*c;
		if (Delta >= 0.0) {
			float t1 = (-b + sqrt(Delta)) / (2.0 * a);
			float t2 = (-b - sqrt(Delta)) / (2.0 * a);
			if ((t1 > 0.0) && (t2 > 0.0)) {
				return false;
			}
		}
	}
	return true;
}

vec3 Blinn( Material mtl, vec3 normal, vec3 view, Ray obj_light_ray, vec3 Intensity)
{
	vec3 h = normalize(normalize(obj_light_ray.dir) + view);
	float cosphi = dot(normal, h);
	float costheta = dot(normal, obj_light_ray.dir);
	vec3 add_clr = Intensity * (mtl.k_d * costheta);
	if (cosphi > 0.0) {
		add_clr += Intensity * mtl.k_s * pow(cosphi, mtl.n);
	}
	return add_clr;
}


bool notInShadow( Ray ray )
{
	float bias = 1e-3;
	vec3 biased_pos = ray.pos + bias * ray.dir;
	// Test for ray-sphere intersection 
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		vec3 sphereCenter = spheres[i].center;
		float sphereRadius = spheres[i].radius;
		vec3 p_minus_c = biased_pos - sphereCenter;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, p_minus_c);
		float c = dot(p_minus_c, p_minus_c) - sphereRadius * sphereRadius;
		float Delta = b*b - 4.0*a*c;
		if (Delta>=0.0){
			float t1 = (-b + sqrt(Delta))/2.0*a;
			float t2 = (-b - sqrt(Delta))/2.0*a;
			if ((t1>0.0) && (t2>0.0)){
				return false;
			}
		}
	}
	return true;
}


bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float bias = 1e-4;
	vec3 biased_pos = ray.pos + bias * ray.dir;
	for ( int i = 0; i < NUM_SPHERES; ++i ) {
		bool replaced_t = false;
		ray.dir = normalize(ray.dir);
		vec3 sphereCenter = spheres[i].center;
		float sphereRadius = spheres[i].radius;
		vec3 p_minus_c = biased_pos - sphereCenter;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, p_minus_c);
		float c = dot(p_minus_c, p_minus_c) - sphereRadius * sphereRadius;
		float Delta = b*b - 4.0*a*c;
		if (Delta >= 0.0) {
			float t1 = (-b + sqrt(Delta)) / (2.0 * a);
			float t2 = (-b - sqrt(Delta)) / (2.0 * a);
			if ((t1 >= 0.0) && (t1 < hit.t)) {
				hit.t = t1;
				replaced_t = true;
			}
			if ((t2 >= 0.0) && (t2 < hit.t)) {
				hit.t = t2;
				replaced_t = true;
			}
			if (replaced_t) {
				foundHit = true;
				hit.position = ray.pos + hit.t * normalize(ray.dir);
				vec3 new_pos_minus_c = hit.position - sphereCenter;
				hit.normal = normalize(new_pos_minus_c);
				hit.mtl = spheres[i].mtl;
			}
		}
	}
	return foundHit;
}

vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce = 0; bounce < MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			if ( clr.r + clr.g + clr.b <= 0.0 ) break;
			Ray r;
			HitInfo h;
			r.pos = hit.position;
			r.dir = normalize(2.0 * dot(view, hit.normal) * hit.normal - view);
			view = normalize( -ray.dir );
			if ( IntersectRay( h, r ) ) {
				vec3 newView = normalize( -r.dir );
				clr += k_s * Shade(h.mtl, h.position, h.normal, newView);
				k_s *= h.mtl.k_s;
				hit = h;
			} else {
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;
			}
		}
		return vec4( clr, 1 );
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );
	}
}
`;
