/*
 * =============================================================================
 * 
 *                       M Ó D U L O    O R Q U E S T A D O R
 * 
 * =============================================================================
 */
import CONFIG from './config';
import * as THREE from 'three';

/**
 * Orquestador
 * Se encarga de ir ejecutando, en el orden adecuado y sin
 * producir superposiciones, cada uno de los actos de la 
 * función. La "Función Actuaria" es simplemente una función
 * JavaScript que especifica las funciones (actos) que se 
 * deben llevar a cabo. El orquestador está preparado para 
 * coordinar tres actos:
 * - ACTO 1 ("Preparación"): Cargar archivos que van a utilizarse.
 * - ACTO 2 ("Iniciación"): Configuración y armado inicial de la escena.
 * - ACTO 3 ("Ejecución"): Despliegue (cuadro a cuadro) de la escena.
 * 
 * El orquestador debe garantizar que cada acto haya concluido 
 * efectivamente antes de comenzar con el siguiente. Esto es
 * importante, principalmente con el "Acto 1", ya que todos los
 * archivos deben estar cargados antes de iniciar el "Acto 2".
 * 
 * Si se indica el uso de la librería de "Processing" (p5js)
 * se le delega, entonces, la orquestación a ésta.
 */
function Orquestador(sos, contenedor, p5js = false) {
    const S = sos.socorrista();
    const _processing = p5js;
    let   _reloj = new THREE.Clock();
    let   _funcionActuaria;
    let   _contenedor = contenedor;
    let   _escena;
    
    // Variables para los actos (funciones) a ser orquestados
    let _funcionPreparacion;
    let _funcionIniciacion;
    let _funcionEjecucion;
    let _actoPreparacionIniciado = false;
    let _actoPreparacionFinalizado = false;
    let _actoIniciacionIniciado = false;
    let _actoEjecucionIniciado = false;
    
    // Valores de los "uniforms" estándares
    let _valorUniformTiempo;
    let _valorUniformResolucion;
    let _valorUniformMouse;
    
    
    // ==========================================================
    // 
    //  DEFINICIÓN DEL OBJETO PARA ALMACENAR ARCHIVOS DE TEXTO
    //  
    // ==========================================================

    /**
     * Archivo
     * Objeto simple para almacenar el contenido
     * de un archivo de texto.
     */
    function Archivo(nombre, texto) {
        const _nombre = nombre;
        let _contenido = texto;
        let _cargado = texto ? true : false;
        function contenido(texto) {
            if (texto) {
                _contenido = texto;
                _cargado = true;
            }
            return _contenido;
        }
        function cargado() {
            return _cargado;
        }
        return {contenido, cargado};
    }

    
    // ==========================================================
    // 
    //  DEFINICIÓN DEL GESTOR PARA LA CARGA DE ARCHIVOS
    //  
    // ==========================================================

    /**
     * Cargador
     * Gestor para la carga asincrónica de archivos.
     */
    function Cargador() {
        const _shaders = [];
        const _texturas = [];
        const _gestorDeCarga = new THREE.LoadingManager();
        const _cargador = new THREE.TextureLoader(_gestorDeCarga);
        let   _texturasCargadas = false;
        _gestorDeCarga.onLoad = () => {
            _texturasCargadas = true;
        };

        function cargarShader(archivo) {
            let _shader = Archivo(archivo);
            _shaders.push(_shader);
            _leerArchivo(archivo, _shader);
            return _shader;
        }

        function cargarTextura2D(archivo) {
            let _textura = _cargador.load(archivo);
            _texturas.push(_textura);
            return _textura;
        }

        function cargaCompletada() {
            for (let i = 0; i < _shaders.length; i++) {
                if (!_shaders[i].cargado()) {
                    return false;
                }
            }
            if (_texturas.length > 0 && !_texturasCargadas) {
                return false;
            }
            return true;
        }

        async function _leerArchivo(nombre, archivo) {
            let objeto = await fetch(nombre);
            archivo.contenido(await objeto.text());
        }

        return {cargarShader, cargarTextura2D, cargaCompletada};
    }
    
    
    
// ==============================================================
// 
//  DEFINICIÓN DE LOS MÉTODOS DEL PROPIO ORQUESTADOR
//  
// ==============================================================
    
    /**
     * vincular
     * Se estalece el vínculo entre el orquestador, la escena y
     * el cargador a utilizar durante el acto de "Preparación".
     * Esto se lleva a cabo concediéndole al siervo convocado
     * al momento de la creación del orquestador, la información
     * necesaria para convertirlo en el socorrista designado.
     */
    function vincular(escena) {
        _escena = escena;
        S.O.S.revelar(S.O.S, Cargador(), escena);
    }    
    
    /**
     * socorrista
     * Devuelve el socorrista designado para atender los 
     * menesteres de la orquestación de la escena.
     */
    function socorrista() {
        return S;
    }

    /**
     * funcionActuaria
     * Devuelve y/o define la "Función Actuaria", es decir, 
     * el método que especifica cada una de los actos a ejecutar.
     */
    function funcionActuaria(funcion) {
        if (funcion) {
            _funcionActuaria = funcion;
            if (!_processing) {
                const _funcion = {};
                _funcionActuaria(_funcion); 
                if (_funcion.hasOwnProperty(CONFIG.ACTO_PREPARACION)) {
                    _funcionPreparacion = _funcion[CONFIG.ACTO_PREPARACION];
                }
                if (_funcion.hasOwnProperty(CONFIG.ACTO_INICIACION)) {
                    _funcionIniciacion = _funcion[CONFIG.ACTO_INICIACION];
                }
                if (_funcion.hasOwnProperty(CONFIG.ACTO_EJECUCION)) {
                    _funcionEjecucion = _funcion[CONFIG.ACTO_EJECUCION];
                }
            }
        }
        return _funcionActuaria;
    }
    
    /**
     * processing
     * Indica si se debe utilizar la librería de "Processing"
     * (p5js) para la orquestación.
     */
    function processing() {
        return _processing;
    }
    
    
    /**
     * orquestar
     * Encargada de ir ejecutando, paso a paso y en orden, cada
     * uno de los actos indicados por la "Función Actuaria".
     * Debe asegurarse que la "Preparación" concluya (la carga 
     * de archivos de manera asincrónica) antes de avanzar con 
     * el siguiente acto.
     * Una vez que los actos de "Preparación" y la "Iniciación" 
     * hayan finalizado, sólo realizará el bucle de "Ejecución".
     */
    function orquestar() {
        if (_actoEjecucionIniciado && _funcionEjecucion) {
            _orquestarActo3();
        }
        else {
            if (_funcionPreparacion && !_actoPreparacionIniciado) {
                _orquestarActo1();
                _actoPreparacionIniciado = true;
                return;
            }
            else if (_funcionPreparacion && _actoPreparacionIniciado && !_actoPreparacionFinalizado) {
                _actoPreparacionFinalizado = S.O.S.cargaCompletada();
                return;
            }
            if (_funcionIniciacion && !_actoIniciacionIniciado) {
                if (!_funcionPreparacion || _actoPreparacionFinalizado) {
                    _orquestarActo2();
                    _actoIniciacionIniciado = true;
                    return;
                }
            }
            if (_funcionEjecucion && !_actoEjecucionIniciado) {
                if ((!_funcionPreparacion && !_funcionIniciacion) || 
                    (_funcionPreparacion && _actoPreparacionFinalizado && !_funcionIniciacion) ||
                    _actoIniciacionIniciado) {
                    _orquestarPreActo3();
                    _orquestarActo3();
                    _actoEjecucionIniciado = true;
                    return;
                }
            }            
        }
    }
    
    /**
     * _orquestarActo1
     * Función orquestadora del acto #1: "Preparación"
     */
    function _orquestarActo1() {
        _funcionPreparacion();
    }
    
    /**
     * _orquestarActo2
     * Función orquestadora del acto #2: "Iniciación"
     */
    function _orquestarActo2() {
        _funcionIniciacion();
    }
    
    /**
     * _orquestarPreActo3
     * Función ejecutar las verificaciones y configuraciones
     * finales antes de dar inicio al bucle de reproducción.
     */
    function _orquestarPreActo3() {
        // Verificación de "uniform" para el tiempo
        _valorUniformTiempo = _escena.uniformTiempo();
        if (_valorUniformTiempo === undefined) {
            _valorUniformTiempo = _escena.uniformTiempo(CONFIG.UNIFORM_TIEMPO);
        }
        
        // Verificación del "uniform" para la resolución 
        _valorUniformResolucion = _escena.uniformResolucion();
        if (_valorUniformResolucion === undefined) {
            _valorUniformResolucion = _escena.uniformResolucion(CONFIG.UNIFORM_RESOLUCION);
        }
        
        // Verificación del "uniform" para el mouse
        _valorUniformMouse = _escena.uniformMouse();
        if (_valorUniformMouse === undefined) {
            _valorUniformMouse = _escena.uniformMouse(CONFIG.UNIFORM_MOUSE);
        }
        
        // Definición de la función para seguimiento del movimiento del mouse
        const _movimientoMouse = (evt) => {
            _valorUniformMouse[CONFIG.UNIFORM_VALOR].x = evt.offsetX / _valorUniformResolucion[CONFIG.UNIFORM_VALOR].x;
            _valorUniformMouse[CONFIG.UNIFORM_VALOR].y = evt.offsetY / _valorUniformResolucion[CONFIG.UNIFORM_VALOR].y;
        };
        _contenedor.seguimientoMouse(_movimientoMouse);
    }

    /**
     * _orquestarActo3
     * Función orquestadora del acto #3: "Ejecución"
     */
    function _orquestarActo3() {
        // Primero, se verifica si cambiaron las dimensiones del contenedor
        if (_contenedor.actualizar()) {
            // Se actualizan las dimensiones de la escena
            _escena.dimensionar(_contenedor.geometria.ancho, _contenedor.geometria.alto);
            
            // Actualización del "uniform" para la resolución
            _valorUniformResolucion[CONFIG.UNIFORM_VALOR].x = _contenedor.geometria.ancho;
            _valorUniformResolucion[CONFIG.UNIFORM_VALOR].y = _contenedor.geometria.alto;
        }
        
        // Luego, se actualiza el "uniform" para el tiempo
        _valorUniformTiempo[CONFIG.UNIFORM_VALOR] += _reloj.getDelta();

        // Finalmente se realiza la ejecución del "Acto 3"
        _funcionEjecucion();
    }
    
    
    // ==================================================================
    // ===> Se exponen únicamente las funciones públicas del orquestador 
    // ==> ("Revealing Module Pattern")
    // ==================================================================
    return {
            vincular,
            socorrista,
            funcionActuaria, 
            orquestar, 
            processing
           };
}


export default Orquestador;