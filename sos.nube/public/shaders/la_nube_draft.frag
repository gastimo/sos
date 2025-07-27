precision highp float;


uniform vec2  u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2  u_direccion;
uniform float u_degrade;
uniform float u_volumen;
uniform float u_rotacion;
uniform float u_velocidad;
uniform float u_zoom;

/**
 * noise
 * Función custom para generar ruido aleatorio sin recurrir
 * a ninguno de los métodos de ruido tradicionales.
 */
float noise(vec2 pq) {
    return fract(sin(pq.x * 124. + pq.y * 215.) * 21412.4);
}


float noiseSmooth(vec2 pq) {
    vec2 index = floor(pq);
    vec2 frag = fract(pq);
    frag = smoothstep(0., 1., frag);  
    
    float topLeft = noise(index);
    float topRight = noise(index + vec2(1, 0));
    float top = mix(topLeft, topRight, frag.x);
    
    float bottomLeft = noise(index + vec2(0, 1));
    float bottomRight = noise(index + vec2(1, 1));
    float bottom = mix(bottomLeft, bottomRight, frag.x);
    
    return mix(top, bottom, frag.y);
}

void main() {
    
    // Normalización de las coordinadas del pixel
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    
    // Definición de los tonos del fondo (el cielo)
    vec3 sky = vec3(0.5, 0.7, 0.85) * (1.5 - uv.y) * 0.72;
    
    // Incorporación del movimiento del mouse
    uv += u_mouse / 20.;
    
    // Se mueve todo en el eje X
    uv.x += u_time / 20.;
    
    // Incorporación del parallax
    vec2 uv2 = uv;
    uv2 -= u_time / 50.;
    vec2 uv3 = uv;
    uv3 -= u_time / 40.;
    

    // Variación del color del pixel por tiempo
    // El ruido se va aplicando en capas (OCTAVAS) para darle más profundidad.
    // En cada capa, el coeficiente por el que se multiplica es una potencia de 2
    vec3 col = vec3(noiseSmooth(uv * 4.));
    col += vec3(noiseSmooth(uv * 8.)) * 0.5;
    col += vec3(noiseSmooth(uv2 * 16.)) * 0.25;
    col += vec3(noiseSmooth(uv * 32.)) * 0.125;
    col += vec3(noiseSmooth(uv3 * 64.)) * 0.0625;
    col /= 1.6;
    
    // Interpolar un rango
    col *= smoothstep(0.1, 0.4, col);

    // Se mezcla con el color del cielo (lo anterior funciona como un filtro)
    col = mix(vec3(1.), sky, col);
    
    // Salida a pantalla
    gl_FragColor =  vec4(col, 1.0);
}