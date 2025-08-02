precision highp float;

// Definición de las variable uniform
uniform vec2      u_resolution;
uniform float     u_time;
uniform vec2      u_mouse;
uniform float     u_intensidadFondo;
uniform int       u_seguidores;
uniform sampler2D u_imagenSeguidores;

// Colores de fondo para el cielo
#define COLOR_CELESTE     vec3(0.5, 0.7, 0.85)
#define COLOR_AZUL        vec3(0, 0.580, 0.980)
#define COLOR_AZUL_OSCURO vec3(0.349, 0.501, 0.988) 
#define COLOR_AMARILLO    vec3(1, 0.835, 0.039) 
#define COLOR_NARANJA     vec3(0.901, 0.521, 0) 
#define COLOR_ROJO        vec3(1, 0.258, 0.039)
#define COLOR_OSCURO      vec3(0.0, 0.0, 0.0)

// Paradas para el gradiente de colores
#define GRAD_PASO1 0.25
#define GRAD_PASO2 0.48
#define GRAD_PASO3 0.62

// Número máximo de seguidores simultáneos
#define MAX_SEGUIDORES 24

    
    
/**
 * colorCielo
 * Devuelve el color de fondo para el cielo en función de
 * la intensidad del scrolling de los seguidores
 */
vec3 colorCielo(float intensidad) {
    if (intensidad < GRAD_PASO1)
        return mix(COLOR_CELESTE, COLOR_AZUL, (intensidad / GRAD_PASO1));
    else if (intensidad < GRAD_PASO2)
        return mix(COLOR_AZUL, COLOR_AZUL_OSCURO, (intensidad - GRAD_PASO1) / (GRAD_PASO2 - GRAD_PASO1));
    else if (intensidad < GRAD_PASO3)
        return mix(COLOR_AZUL_OSCURO, COLOR_NARANJA, (intensidad - GRAD_PASO2) / (GRAD_PASO3 - GRAD_PASO2));
    else
        return mix(COLOR_NARANJA, COLOR_ROJO, (intensidad - GRAD_PASO2) / (1. - GRAD_PASO2));
}


/**
 * ruidoSimple
 * Función custom para generar ruido aleatorio.
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
 * nubarronSeguidor
 * Función que dada las cordenadas <x,y> de un seguidor (parámetro "seg")
 * y un tamaño de nube (parámetro "radio") devuelve un valor entre 0 y 1
 * para indicar si la posición actual de pixel (recibida como argumento
 * en el parámetro "coord") está o no dentro del nubarrón.
 */
float nubarronSeguidor(vec2 coord, vec2 seg, float ajuste, float radio){
    // Se ajustan las coordenadas del seguidor
    vec2 _puntoSeguidor = vec2(seg.x * ajuste, 1. - seg.y);
    
    // Se calcula la distancia del seguidor a la coordenada actual
    float dist = distance(coord, _puntoSeguidor);
    
    // Se devuelve "0" para radios menores a la distancia, o sea,
    // que la coordenada actual ("coord") está fuera del radio.
    return 1. - smoothstep(0., radio * 1.4, dist); 
    //return step(dist, radio);   // Esta línea devolvería un círculo perfecto
}


/**
 * SHADER PANTALLA-NUBE
 * Código principal del shader que dibuja un cielo azul con nubes blancas
 * generadas mediante múltiples "OCTAVAS" y que aplican una función de ruido
 * suavizado definida más arriba bajo el nombre "manchonesSuavizados".
 * Este shader recibe de manera encriptada (en una imagen) las posiciones
 * <x,y> de los seguidores y sus tamaños. Por cada uno de ellos se dibuja
 * una especie de nubarrón oscuro que se mezcla entre las nubes blancas.
 * Por último, la intensidad de la acción de los seguidores es un valor
 * informado como "uniform" para determinar el color de fondo del cielo.
 */
void main() {
    
    // Normalización de las coordinadas del pixel
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;  
    float ajusteX = u_resolution.x / u_resolution.y;
    uv.x *= ajusteX;
    vec2 coord = vec2(uv.x, uv.y);  // Guardo las coordenadas para después
    
    // Definición de los tonos del fondo según la intensidad (el cielo)
    vec3 cielo = colorCielo(u_intensidadFondo) * (1.5 - uv.y) * 0.72;
    
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
    
    // El ruido se va aplicando en capas (OCTAVAS) para darle más profundidad.
    // En cada capa, el coeficiente por el que se multiplica es una potencia de 2
    vec3 col = vec3(manchonesSuavizados(uv * 4.));
    col += vec3(manchonesSuavizados(uv * 8.)) * 0.5;
    col += vec3(manchonesSuavizados(uv2 * 16.)) * 0.25;
    col += vec3(manchonesSuavizados(uv * 32.)) * 0.125;
    col += vec3(manchonesSuavizados(uv3 * 64.)) * 0.0625;
    col /= 1.6;

    // Generar un suavizado del efecto conseguido para aumentar el constraste
    col *= smoothstep(0.1, 0.4, col);

    // Se mezcla con el color del cielo (funciona como un filtro)
    col = mix(vec3(1.), cielo, col);
    
    
    // RENDERIZADO DE LOS SEGUIDORES
    // Se recorren los seguidores para obtener sus posiciones y tamaños.
    // Por una limitación de los shaders, el número máximo de iteraciones
    // del bucle no puede ser una variable, debe ser una constante.
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    for (int i = 0; i < MAX_SEGUIDORES; i++) {
        if (i >= u_seguidores)
            break;
        
        // La posición y el radio de cada seguidor vienen "encriptados" dentro de cada
        // pixel de la imagen recibida como "uniform" (r=posX, g=posY, b=tamaño).
        vec4 dato = texture2D(u_imagenSeguidores, vec2(float(i) / float(u_seguidores) * ajusteX, 0.0));
        float seguidorEnRango1 = nubarronSeguidor(coord, vec2(dato.x, dato.y), ajusteX, dato.z);
        float seguidorEnRango2 = nubarronSeguidor(coord, vec2(dato.x, dato.y), ajusteX, dato.z * 1.009);
        float seguidorEnRango3 = nubarronSeguidor(coord, vec2(dato.x, dato.y), ajusteX, dato.z * 1.015);
        if (seguidorEnRango3 > 0.) {
            vec3 colSeg = vec3(manchonesSuavizados(coord * 4.))* seguidorEnRango1;
            colSeg += vec3(manchonesSuavizados(coord * 8.)) * 0.5 * seguidorEnRango2;
            colSeg += vec3(manchonesSuavizados(coord * 16.)) * 0.25 * seguidorEnRango3;
            colSeg += vec3(manchonesSuavizados(coord * 32.)) * 0.125 * seguidorEnRango1;
            colSeg += vec3(manchonesSuavizados(coord * 64.)) * 0.0625 * seguidorEnRango3;
            colSeg /= 1.6;
            colSeg *= smoothstep(0.1, 0.4, colSeg);
            
            // Se mezcla el nubarrón del seguidor con el cielo ya generado
            col = mix(col, COLOR_OSCURO, colSeg);
        }
    }

    // SALIDA
    // Asignación del color final del pixel de la pantalla
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    gl_FragColor = vec4(col, 1.0);
}