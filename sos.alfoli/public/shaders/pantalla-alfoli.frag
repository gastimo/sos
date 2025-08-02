precision highp float;

// Definición de las variable uniform
uniform vec2      u_resolution;
uniform float     u_time;
uniform vec2      u_mouse;

// Definición de parámetros constantes para el shader
#define PI 3.14159265358979
#define MAX_CANTIDAD_PASOS 100
#define MAX_DISTANCIA_RAYO 40.
#define UMBRAL_DETECCION 0.01
#define COLOR_ALFOLI vec3(0.901, 0.909, 0.854)

    
/**
 * sphere
 * Función de Distancia con Signo (SDF) para producir una esfera.
 * Devuelve la distancia del punto "pos" a la esfera cuyo radio
 * es "rad". La función devuelve valores positivos para puntos por 
 * fuera de la esfera y valores negativos para puntos por dentro.
 */
float sphere(vec3 _pos, float _rad) {
    return length(_pos) - _rad;
}

/**
 * box
 * Función de Distancia con Signo (SDF) para producir un cubo.
 * Devuelve la distancia del punto "pos" al cubo cuyo tamaño medio
 * es "tamaño". La función devuelve valores positivos para puntos 
 * por fuera del cubo y valores negativos para puntos por dentro.
 */
float box(vec3 _pos, vec3 _tamano ) {
  vec3 aux = abs(_pos) - _tamano;
  return length(max(aux,0.0)) + min(max(aux.x,max(aux.y, aux.z)),0.0);
}

/**
 * escena
 * Esta función define los objetos que forman parte de la escena
 * mediante "Funciones de Distancia con Signo" (SDF).
 * En este caso los objetos de la escena conforman un "Alfolí".
 */
float escena(vec3 _posRayo) {
    // Definición de las partes de "El Alfolí"
    float cajaAlfoli   = box(vec3(_posRayo - vec3(0., 2.2, 0.)), vec3(3.0));
    float ranuraAlfoli = box(vec3(_posRayo - vec3(0., 2.2, 0.)), vec3(1.5, 5., 0.61));
    float pieAlfoli    = box(vec3(_posRayo - vec3(0., -6., 0.)), vec3(1.3, 6., 1.3));
    float baseAlfoli   = box(vec3(_posRayo - vec3(0., -12., 0.)), vec3(4.1, 0.45, 4.1));
    
    // Armado de "El Alfolí"
    float alfoli = max(cajaAlfoli, -ranuraAlfoli);  // Diferencia
    alfoli = min(alfoli, pieAlfoli);                // Unión
    alfoli = min(alfoli, baseAlfoli);               // Unión
    return alfoli;
}

/**
 * normal
 * Normalización del vector
 */
vec3 normal(vec3 _pos) {
    vec2 auxD = vec2(0., UMBRAL_DETECCION);
    return normalize(
        vec3(escena(_pos + auxD.yxx),
        escena(_pos + auxD.xyx),
        escena(_pos + auxD.xxy))-escena(_pos)
    );
}

/**
 * shade
 * Función que aplica luces y sombras a los objetos de la escena
 */
vec3 shade(vec3 _posicionRay, vec3 _direccionCamara) {
    vec3  auxNormal = normal(_posicionRay);

    vec3  color = COLOR_ALFOLI;
    vec3  direccionLuz = normalize(vec3(0.2,0.61,-0.4));
    
    float brilloLuz = 1.2;
    float brilloLuzAmbiente = .031;
    
    float brilloPuntoLuz = 3.0;
    float tamanoPuntoLuz = 10.;
    
    float auxDif = max(0., dot(direccionLuz, auxNormal)) * brilloLuz;
    vec3  reflejo = reflect(direccionLuz, auxNormal);
     
    float spectro = pow( max(0., dot(reflejo, _direccionCamara)), tamanoPuntoLuz) * brilloPuntoLuz ;
    return color * (brilloLuzAmbiente + auxDif) + spectro;
}

/**
 * rayosMarchantes
 * Función principal que implemente el algoritmo de "Ray Marching".
 */
vec3 rayosMarchantes(vec3 _posicionCamara, vec3 _direccionCamara) {
    vec3 color = vec3(0.0);
    vec3 posicion = vec3(0.0); // posicion del rayo
    float calculoRayo = 0.0;
    float distanciaTotal = 0.0;
    
    for (int i = 0; i < MAX_CANTIDAD_PASOS; i++) {
        posicion = _posicionCamara + distanciaTotal * _direccionCamara;
        calculoRayo = escena(posicion); // La distancia al objeto mas cercano
        distanciaTotal += calculoRayo;  // Salto al distancia mas cercana
        if (distanciaTotal > MAX_DISTANCIA_RAYO  || calculoRayo < UMBRAL_DETECCION)
            break;
    }
  
    if (calculoRayo < UMBRAL_DETECCION) { 
        color = shade(posicion, _direccionCamara);  // Chocó con algún objeto de la escena
    }
    
    return color;
}

/**
 * calculoTarget
 */
mat3 calculoTarget(vec3 dir, vec3 up){
    dir = normalize(dir);
    vec3 rt = normalize(cross(dir, up));
    return mat3(rt,cross(rt,dir),dir);
}


/**
 * SHADER PANTALLA-ALFOLÍ
 * Código principal del shader que dibuja un "Alfolí" sobre un fondo negro.
 * Para esto se utilizan "Funciones de Distancia con Signo" que definan cada
 * una de las partes del objeto. El "Alfolí" está moviéndose en el lado derecho 
 * de la pantalla para que, desde Processing, se le hagan llegar las ofrendas.
 */
void main(void)
{
    // NORMALIZACIÓN Y AJUSTE
    // Normalización de las coordinadas del pixel y ajuste de proporciones
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    vec2 pos = gl_FragCoord.xy/u_resolution - .5;
    pos.x *= u_resolution.x/u_resolution.y;
    pos -= vec2(0.56, 0.);   // Se desplazan las coordenadas hacia la derecha

    // PARÁMETROS DE LA CÁMARA
    // La cámara se desplaza en el eje "X" y se retira hacia atrás en el eje "Z"
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    vec3 camara = vec3(cos(u_time) * 8.3, 8.4, -26.);
    vec3 target = vec3(0,0,0);
    vec3 camaraTarget = normalize(target - camara);
    vec3 direccion = normalize(vec3(pos, 1.));
    direccion = calculoTarget(camaraTarget, vec3(0,1,0)) * direccion;
     
    // RAYOS QUE MARCHAN
    // Se invoca a la función que realiza el bucle de los rayos marchantes.
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    vec3 color = rayosMarchantes(camara, direccion);
    
    // SALIDA
    // Asignación del color final del pixel de la pantalla
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
     gl_FragColor = vec4(color, 1.);
}

