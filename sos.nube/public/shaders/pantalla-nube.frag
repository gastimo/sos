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
uniform sampler2D u_textura0;
uniform int u_seguidores;
uniform sampler2D u_imagenSeguidores;

#define MAX_SEGUIDORES 20

    
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

float circulo(vec2 _uv, vec2 _punto, float _ajuste, float _radio){
    _uv -= vec2(_punto.x * _ajuste, _punto.y);
    float dist = length(_uv); 
    float vuelve = step(dist,_radio);
    return clamp(vuelve, 0.0, 1.0);
}

float seguidor(vec2 coord, vec2 punto, float ajuste, float radio){
    // Se ajustan las coordenadas del seguidor
    vec2 _puntoSeguidor = vec2(punto.x * ajuste, 1. - punto.y);
    
    // Se calcula la distancia del seguidor a la coordenada actual
    float dist = distance(coord, _puntoSeguidor);
    
    // Se devuelve "0" para radios menores a la distancia, o sea,
    // que la coordenada actual ("coord") está fuera del radio.
    return step(dist, radio); 
}


void main() {
    
    // Normalización de las coordinadas del pixel
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;  
    float ajusteX = u_resolution.x / u_resolution.y;
    uv.x *= ajusteX;
    
    // Definición de los tonos del fondo (el cielo)
    vec3 col = vec3(0.5, 0.7, 0.85) * (1.5 - uv.y) * 0.72;

    // Se recorren los seguidores para obtener sus posiciones y tamaños.
    // Por una limitación de los shaders, el número máximo de iteraciones
    // del bucle no puede ser una variable, debe ser una constante.
    for (int i = 0; i < MAX_SEGUIDORES; i++) {
        if (i >= u_seguidores)
            break;
        
        // La posición y el radio de cada seguidor vienen "encriptados" 
        // dentro de cada pixel de la imagen recibida como "uniform".
        vec4 dato = texture2D(u_imagenSeguidores, vec2(float(i) / float(u_seguidores) * ajusteX, 0.0));
        float seguidorEnRango = seguidor(uv, vec2(dato.x, dato.y), ajusteX, dato.z);
        if (seguidorEnRango > 0.) {
            col = mix(col, vec3(1., 0., 1.), seguidorEnRango);
            break;
        }
    }

    // Salida a pantalla
    gl_FragColor = vec4(col, 1.0);
}