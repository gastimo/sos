/*
 * =============================================================================
 * 
 *                          M Ó D U L O    E S C E N A
 * 
 * =============================================================================
 */
import CONFIG from './config';
import Esquema from './esquema';


/**
 * Escena
 * Entidad principal de la Obra que articula la reproducción
 * de contenidos en el lienzo del navegador (el "canvas").
 * La Obra puede estar compuesta por una o múltiples escenas.
 * 
 * A cada escena se le asigna un "orquestador" encargado de
 * instrumentar los tres actos en los que ésta se divide:
 * 
 * - ACTO 1 ("Preparación"): Cargar archivos que van a utilizarse.
 * - ACTO 2 ("Iniciación") : Configuración y armado inicial de la escena.
 * - ACTO 3 ("Ejecución")  : Despliegue (cuadro a cuadro) de la escena.
 * 
 * NOTA 1: La escena es la entidad que permite encapsular el uso de las 
 *         librerías para la generación de gráficos (p5js o Three.js).
 * NOTA 2: La escena hereda las funciones del esquema.
 * 
 */
function Escena(sos) {
    const S = sos.socorrista();
    let _contenedor;

    // Shaders
    let _vertexShader, _fragmentShader;
    
    // Definición e inicialización de variables "uniform"
    const _uniforms = {};
    let _nombreUniformTiempo     = CONFIG.UNIFORM_TIEMPO;
    let _nombreUniformResolucion = CONFIG.UNIFORM_RESOLUCION;
    let _nombreUniformMouse      = CONFIG.UNIFORM_MOUSE;

    // Variables Three.js
    let camera, scene;
    let rendererTHREE;
    let rendererP5;
    
    
// =====================================================================
// 
//  DEFINICIÓN DE LA "FUNCION ACTUARIA" (LOS TRES ACTOS)
//  
// =====================================================================
    
    /**
     * functionActuaria
     * Definición dinámica de las funciones a ser invocadas 
     * para cada uno de los tres actos de la escena.
     */
    function functionActuaria() {  
        const _FUNCION = {};
        
        /**
         * ACTO DE PREPARACIÓN (método "preload" de p5js)
         * Función estándar que se ejecuta una vez, al inicio, y se
         * utiliza para cargar archivos como shaders, imágenes, etc.
         */            
        _FUNCION[CONFIG.ACTO_PREPARACION] = () => {
        };

        /**
         * ACTO DE INICIACIÓN (método "setup" de p5js)
         * Función estándar que se ejecuta una vez, al inicio y justo
         * después de que haya finalizado el "Acto de Preparación".
         * Se utiliza para configurar la escena (por ejemplo, sus
         * dimensiones) y para definir las variables "uniform".
         */
        _FUNCION[CONFIG.ACTO_INICIACION] = () => {
        };

        /**
         * ACTO DE EJECUCIÓN (método "draw" de p5js)
         * Función estándar que se ejecuta indefinidamente "en bucle"
         * y se encarga de desplegar la escena (cuadro a cuadro).
         */
        _FUNCION[CONFIG.ACTO_EJECUCION] = () => {
            rendererTHREE.render(scene, camera);
        };
        
        return _FUNCION;
    }
    
    
// =====================================================================
// 
//  FUNCIONES PARA EL MANEJO DE LOS "SHADERS" DE LA OBRA
//  
// =====================================================================

    function vertexShader(shader) {
        if (shader !== undefined) {
            _vertexShader = shader;     
        }
        return _vertexShader;
    }
    
    function fragmentShader(shader) {
        if (shader !== undefined) {
            _fragmentShader = shader;
        }
        return _fragmentShader;
    }

    
    
// =====================================================================
// 
//  FUNCIONES PARA LA MANIPULACIÓN DE LAS VARIABLES "UNIFORM"
//  
// =====================================================================
    
    function uniformTiempo(nombre) {
        if (nombre !== undefined) {
            _nombreUniformTiempo = nombre;
            uniform(nombre, 1.0);        
        }
        return uniform(nombre);
    }
    
    function uniformResolucion(nombre) {
        if (nombre !== undefined) {
            _nombreUniformResolucion = nombre;
            uniform(nombre, new S.O.S.THREE.Vector2());
        }
        return uniform(nombre);
    }
    
    function uniformMouse(nombre) {
        if (nombre !== undefined) {
            _nombreUniformMouse = nombre;
            uniform(nombre, new S.O.S.THREE.Vector2());
        }
        return uniform(nombre);
    }
    
    function uniform(nombre, valor, valor2) {
        if (valor2 !== undefined) {
            let v = new S.O.S.THREE.Vector2();
            v.x = valor;
            v.y = valor2;
            return uniform(nombre, v);
        }
        if (valor !== undefined) {
            if (!_uniforms.hasOwnProperty(nombre))
                _uniforms[nombre] = {};
            _uniforms[nombre][CONFIG.UNIFORM_VALOR] = valor;
        }
        else {
            if (!_uniforms.hasOwnProperty(nombre) || !_uniforms[nombre].hasOwnProperty(CONFIG.UNIFORM_VALOR)) {
                return undefined;
            }
        }
        return _uniforms[nombre];
    }

    

// =====================================================================
// 
//  FUNCIONES PARA EMPLAZAR, CONFIGURAR Y REPRODUCIR LA ESCENA
//  
// =====================================================================
    
    /**
     * dimensionar
     * Establece el ancho y alto del lienzo donde se
     * representa la escena (el canvas del renderer).
     */
    function dimensionar(ancho, alto) {
        if (rendererTHREE) {
            rendererTHREE.setSize(ancho, alto); 
        }
        if (rendererP5) {
            S.O.S.P5.resizeCanvas(ancho, alto);
            S.O.S.P5.ortho(-ancho / 2, ancho / 2, -alto / 2, alto / 2);             
        }
    }
    
    /**
     * emplazar
     * Función principal que encapsula los llamados a las librerías necesarias
     * para construir el "canvas" de la escena en la página HTML.
     * El emplazamiento tiene lugar una vez que finalizaron los 2 primeros actos 
     * y justo antes de iniciar el bucle de ejecución.
     */
    function emplazar(contenedor) {
        _contenedor = contenedor;
        if (!S.O.S.P5) {
            _emplazarLienzoTHREE();
        }
        else {
            _emplazarLienzoP5();
        }
    }
        

    /**
     * _emplazarLienzoTHREE
     * Realiza el emplazamiento del "canvas" únicamente a través de la
     * librería Three.js
     */
    function _emplazarLienzoTHREE() {        
        // 1. CREACIÓN DEL LIENZO (CANVAS)
        // La creación del lienzo o canvas es diferida hasta el momento del 
        // emplazamiento de la escena en la página. Se supone que en este 
        // punto el contenedor (elemento HTML) ya fue creado y sus dimensiones
        // fueron ajustadas por el navegador en función del tamaño del viewport.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        rendererTHREE = new S.O.S.THREE.WebGLRenderer();
        rendererTHREE.setPixelRatio(window.devicePixelRatio);
        _contenedor.lienzo(rendererTHREE.domElement);

        
        // 2. CREACIÓN DE VERDADERA ESCENA
        // Una vez que el lienzo fue creado y emplazado en la página, se procede
        // con la creación de la escena mediante la libreraí Three.js
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        scene = new S.O.S.THREE.Scene();
        camera = new S.O.S.THREE.Camera();
        camera.position.z = 1;

        
        // 3. DEFINICIÓN DE LOS SHADERS
        // Por último, se obtienen los "shaders" a emplear para la escena, se
        // definen las variables "uniform" y se invocan las funciones de la
        // librería Three.js para ejecutar los "shaders" de la escena.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        let _vshader = _vertexShader && _vertexShader.contenido() ? _vertexShader.contenido() : CONFIG.VERTEX_SHADER;
        let atributos = {
            uniforms        : _uniforms,
            vertexShader    : _vshader,
            fragmentShader  : _fragmentShader.contenido(),
        };
        let material = new S.O.S.THREE.ShaderMaterial(atributos);
        let geometry = new S.O.S.THREE.PlaneGeometry( 2, 2 );
        let mesh = new S.O.S.THREE.Mesh( geometry, material );
        scene.add( mesh );
    }
        

    /**
     * _emplazarLienzoP5
     * Realiza el emplazamiento del "canvas" únicamente a través de la
     * librería p5js
     */
    function _emplazarLienzoP5() {
        rendererP5 = S.O.S.P5.createCanvas(_contenedor.geometria.ancho, _contenedor.geometria.alto, S.O.S.P5.WEBGL);
        _contenedor.lienzo(rendererP5.canvas);   
    }
    
    
// =====================================================================
// 
//  FUNCIONES MISCELÁNEAS DE INICIALIZACIÓN Y MANTENIMIENTO
//  
// =====================================================================
    
    /**
     * inicializar
     * Función que crea la "Definición" del esquema asociado a la escena.
     * Los atributos que se inicialicen en este punto podrán ser importados,
     * exportados y/o manipulados desde la GUI del "Panel Conrolador".
     */
    function inicializar() {
    }
    
    function vincular(three, p5) {
        S.O.S.THREE = three;
        S.O.S.P5    = p5;
    }

    
    
    // ===============================================================
    // ===> Se exponen únicamente las funciones públicas de la escena
    // ==> ("Revealing Module Pattern") y se implementa la herencia.
    // ===============================================================
    return S.O.S.revelar({vertexShader,
                         fragmentShader,
                         uniformTiempo,
                         uniformResolucion,
                         uniformMouse,
                         uniform,
                         dimensionar,
                         emplazar,
                         vincular,
                         inicializar
                         }, 
                         functionActuaria(),                     // Se adicionan los métodos de la "Función Actuaria"
                         Esquema(S.O.S, CONFIG.NOMBRE_ESCENA));  // Se heredan las funciones públicas del "Esquema"
}


export default Escena;