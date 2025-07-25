precision highp float;

uniform sampler2D u_texture; // Input texture
uniform float u_blurAmount; // Blur intensity
uniform vec2 u_resolution;  // Screen resolution
uniform float u_time;
uniform vec2 u_pixelSize;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution * 0.5; 
    vec2 pixel = u_pixelSize.xy / u_resolution.xy * (u_time + 50.) / 72.;
    vec4 color = vec4(0.0);

    // Se realiza el PIXELADO
    vec2 pixelUV = floor(uv / pixel) * pixel;

    // Gaussian blur kernel (example: 3x3)
    float kernel[9] = float[](
        1.0/16.0, 2.0/16.0, 1.0/16.0,
        2.0/16.0, 4.0/16.0, 2.0/16.0,
        1.0/16.0, 2.0/16.0, 1.0/16.0
    );

    vec2 offset[9] = vec2[](
        vec2(-1, -1), vec2(0, -1), vec2(1, -1),
        vec2(-1, 0), vec2(0, 0), vec2(1, 0),
        vec2(-1, 1), vec2(0, 1), vec2(1, 1)
    );    
    
    
    // Finalmente, se realiza el BLUREADO
    for (int i = 0; i < 9; i++) {
        vec2 sampleUV = pixelUV + offset[i] / u_resolution * u_blurAmount;
        color += texture2D(u_texture, sampleUV) * kernel[i];
    }
    
    gl_FragColor = color;
}