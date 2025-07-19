/*
 * =============================================================================
 * 
 *                          C O N F I G U R A C I Ó N
 * 
 * =============================================================================
 */

const Config = (() => {
    
    // DEFINICIÓN DE PARÁMETROS
    // Configuración general de las opciones de la aplicación
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    const _parametros = {
        
        // Nombres de las entidades de la aplicación
        NOMBRE_SOS              : 'SOS',        // Singleton del Obsequioso Socorro
        NOMBRE_ESCENA           : 'ESCENA',     // Entidad principal para representar la obra
        NOMBRE_ESQUEMA          : 'ESQUEMA',    // Definición de los atributos y valores de una entidad
        NOMBRE_ATRIBUTO         : 'ATRIBUTO',   // Definición de cada uno de los atributos de un esquema
        
        // Código shader por defecto
        VERTEX_SHADER           : 'void main() { gl_Position = vec4( position, 1.0 ); }',

        // Uniforms estándares
        UNIFORM_VALOR           : "value",
        UNIFORM_TIEMPO          : "u_time",
        UNIFORM_RESOLUCION      : "u_resolution",
        UNIFORM_MOUSE           : "u_mouse",

        // Actos de la orquestación
        ACTO_PREPARACION        : 'cargar',
        ACTO_INICIACION         : 'comenzar',
        ACTO_EJECUCION          : 'desplegar',
    };
    
    return _parametros;
    
})();

export default Config;