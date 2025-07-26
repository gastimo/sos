precision highp float;

uniform sampler2D u_texture; 
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_blurAmount; 
uniform vec2 u_pixelSize;

/**
 * Shader para "velar" una imagen a través del pixelado y del
 * desenfocado (blur). Los parámetros para realizar esto se
 * reciben como "uniforms". También aplica un leve movimiento.
 */
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution * 0.5; 
    vec2 pixel = u_pixelSize.xy / u_resolution.xy * (u_time + 50.) / 112.;
    vec4 color = vec4(0.0);

    // Código para realizar el pixelado según el tamaño indicado
    vec2 pixelUV = floor(uv / pixel) * pixel;

    // Definición de la matriz 3x3 para el desenfoque gaussiano 
    float kernel[9] = float[](
        1.0/16.0, 2.0/16.0, 1.0/16.0,
        2.0/16.0, 4.0/16.0, 2.0/16.0,
        1.0/16.0, 2.0/16.0, 1.0/16.0
    );

    // Definición de los desplazamientos para el desenfoque gaussiano
    vec2 offset[9] = vec2[](
        vec2(-1, -1), vec2(0, -1), vec2(1, -1),
        vec2(-1, 0), vec2(0, 0), vec2(1, 0),
        vec2(-1, 1), vec2(0, 1), vec2(1, 1)
    );    
    
    // En este bucle se realiza el desenfocado sobre la variables
    // a la que ya se le había hecho el "pixelado"
    for (int i = 0; i < 9; i++) {
        vec2 sampleUV = pixelUV + offset[i] / u_resolution * u_blurAmount;
        color += texture2D(u_texture, sampleUV) * kernel[i];
    }
    
    gl_FragColor = color;
}