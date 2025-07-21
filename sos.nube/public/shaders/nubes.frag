uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_direccion;
uniform float u_degrade;
uniform float u_volumen;
uniform float u_rotacion;
uniform float u_velocidad;
uniform float u_zoom;

#define OCTAVES 7
#define LAYERS  3
#define ROT(r)  mat2(cos(r), sin(r), -sin(r), cos(r))
#define BKG     vec3(0.0,0.13,0.32)
#define I       vec2(0.0, 1.0)


float R12(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}


float N12(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(R12(i       ), R12(i + I.yx), f.x),
    mix(R12(i + I.xy), R12(i + I.yy), f.x),
    f.y);
}

float FBM12 (in vec2 u, float i, float o) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      v += a * N12(u);
      u *= 2.2;
      a *= 0.42;
    }
    return smoothstep(i,o,v);
}


void main() {
    
    vec2 uv = gl_FragCoord.xy/u_resolution.xy * vec2(u_resolution.x/u_resolution.y, 1.0);
    vec3 col = BKG;
    
    vec2 p = u_zoom * uv * ROT(u_rotacion) + u_time * u_velocidad * u_direccion;
    float f = 0.0;
    float volumenIn = u_volumen ;
    float degradeIn = u_volumen + 0.2 + u_degrade;
    
    for (int i = 0 ; i < LAYERS; i++){
        f += FBM12(p + f * u_direccion, volumenIn, degradeIn);
    }
    
    f = (1.5 + volumenIn) * f / max(float(LAYERS), 1.0);
    
    float s = smoothstep(0.5, 1.1, f);
    vec3 shade = 1.0 - BKG;
    col = mix(mix(col, col + min(f, 0.5) * (1. - col), f), vec3(0.9 - smoothstep(1.0, 2.4, f) * shade), s);
    
    vec2 pos = gl_FragCoord.xy / u_resolution.xy ;
    //vec4 color = texture2D( texture0, vec2(pos.x, 1.-pos.y));
    //col  =color.rgb*0.2 + col*0.8;
    gl_FragColor =  vec4(col.rgb, 1.0);
}