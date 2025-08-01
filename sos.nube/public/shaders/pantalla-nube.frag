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
 * ruidoSimple
 * Función custom para generar ruido aleatorio sin recurrir
 * a ninguno de los métodos de ruido tradicionales.
 */
float ruidoSimple(vec2 pq) {
    return fract(sin(pq.x * 124. + pq.y * 215.) * 21412.4);
}


/**
 * manchonesSuavizados
 * Función para realizar una especie de "ruido suavizado" o 
 * manchones con formas orgánicas y bordes suavizados.
 */
float manchonesSuavizados(vec2 pq) {
    vec2 index = floor(pq);
    vec2 frag = fract(pq);
    frag = smoothstep(0., 1., frag);  
    
    float topLeft = ruidoSimple(index);
    float topRight = ruidoSimple(index + vec2(1, 0));
    float top = mix(topLeft, topRight, frag.x);
    
    float bottomLeft = ruidoSimple(index + vec2(0, 1));
    float bottomRight = ruidoSimple(index + vec2(1, 1));
    float bottom = mix(bottomLeft, bottomRight, frag.x);
    
    return mix(top, bottom, frag.y);
}


/**
 * seguidor
 * Función que dada la coordenada actual del pixel ("coord"), el punto
 * con las coordenadas del seguidor ("seg") y el tamaño a considerar
 * para el seguidor ("radio") devuelve un número (0/1) que indica si la 
 * coordenada actual se encuentra o no dentro del radio del seguidor.
 */
float seguidor(vec2 coord, vec2 seg, float ajuste, float radio){
    // Se ajustan las coordenadas del seguidor
    vec2 _puntoSeguidor = vec2(seg.x * ajuste, 1. - seg.y);
    
    // Se calcula la distancia del seguidor a la coordenada actual
    float dist = distance(coord, _puntoSeguidor);
    
    // Se devuelve "0" para radios menores a la distancia, o sea,
    // que la coordenada actual ("coord") está fuera del radio.
    return step(dist, radio); 
}


/**
 * SHADER PANTALLA-NUBE
 * Código principal del shader que dibuja un cielo azul con nubes blancas
 * generadas mediante múltiples "Octavas" y que aplican la función de ruido
 * suavizado definida más arriba bajo el nombre "manchonesSuavizados".
 * Este shader recibe de manera encriptada -en una imagen- las posiciones
 * <x,y> de los seguidores y sus tamaños. Por cada uno de ellos se dibuja
 * una especie de nubarrón oscuro que se mezcla entre las nubes blancas.
 * Por último, los colores de la escena y las velocidades en general también
 * varían en función de los parámetros "uniform" recibidos.
 */
void main() {
    
    // Normalización de las coordinadas del pixel
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;  
    float ajusteX = u_resolution.x / u_resolution.y;
    uv.x *= ajusteX;
    vec2 coord = vec2(uv.x, uv.y);
    
    // Definición de los tonos del fondo (el cielo)
    vec3 sky = vec3(0.5, 0.7, 0.85) * (1.5 - uv.y) * 0.72;
    
    // Incorporación del movimiento del mouse
    uv += u_mouse / 20.;
    
    // Desplazamiento de las coordenadas en el eje X
    uv.x += u_time / 20.;
    
    // Desdoblamiento de las coordenadas iniciales para 
    // realizar una suerte de efecto "parallax", es decir,
    // capas que se desplacen a diferentes velocidades.
    vec2 uv2 = uv;
    uv2 -= u_time / 50.;
    vec2 uv3 = uv;
    uv3 -= u_time / 40.;
    
    // Variación del color del pixel por tiempo
    // El ruido se va aplicando en capas (OCTAVAS) para darle más profundidad.
    // En cada capa, el coeficiente por el que se multiplica es una potencia de 2
    vec3 col = vec3(manchonesSuavizados(uv * 4.));
    col += vec3(manchonesSuavizados(uv * 8.)) * 0.5;
    col += vec3(manchonesSuavizados(uv2 * 16.)) * 0.25;
    col += vec3(manchonesSuavizados(uv * 32.)) * 0.125;
    col += vec3(manchonesSuavizados(uv3 * 64.)) * 0.0625;
    col /= 1.6;

    // Generar un suavizado del efecto conseguido para aumentar constraste
    col *= smoothstep(0.1, 0.4, col);

    // Se mezcla con el color del cielo (lo anterior funciona como un filtro)
    col = mix(vec3(1.), sky, col);
    
    // Se recorren los seguidores para obtener sus posiciones y tamaños.
    // Por una limitación de los shaders, el número máximo de iteraciones
    // del bucle no puede ser una variable, debe ser una constante.
    for (int i = 0; i < MAX_SEGUIDORES; i++) {
        if (i >= u_seguidores)
            break;
        
        // La posición y el radio de cada seguidor vienen "encriptados" 
        // dentro de cada pixel de la imagen recibida como "uniform".
        vec4 dato = texture2D(u_imagenSeguidores, vec2(float(i) / float(u_seguidores) * ajusteX, 0.0));
        float seguidorEnRango = seguidor(coord, vec2(dato.x, dato.y), ajusteX, dato.z);
        if (seguidorEnRango > 0.) {
            col = mix(col, vec3(1., 0., 1.), seguidorEnRango);
            break;
        }
    }

    // Salida a pantalla
    gl_FragColor = vec4(col, 1.0);
}