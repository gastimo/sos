/*
 * =============================================================================
 * 
 *                           M Ó D U L O    N U B E
 * 
 * =============================================================================
 */
import Seguidor from './seguidor.js';


/**
 * Nube
 * Es el objeto de adoración principal de "La Obra". Se manifiesta durante el rito
 * de veneración en la forma de una proyección en la pared mayor del recinto.
 * "La Nube" está continuamente atendiendo las plegarias de sus seguidores que le
 * llegan en forma de mensajes OSC, informando acerca del comportamiento de estos
 * en sus dispositivos, o sea, la forma en que interactúan con la pantalla "Siervo".
 * En respuesta a estas plegarias, "La Nube" realiza movimientos, cambios de color
 * y sonidos en la proyección buscando el arrobamiento de sus fieles seguidores.
 * A mayor grado de interacción del o de los seguidores, mayor será la respuesta 
 * animada de "La Nube" en su pantalla proyectada.
 */
function Nube(S) {
    let _seguidores = {};
    _iniciar();
    

// ==============================================================
// 
//  DEFINICIÓN DE LAS FUNCIONES PROPIAS DE LA "NUBE"
//  
// ==============================================================
    
    /**
     * _iniciar
     * Función privada de "La Nube", responsable de crear la gŕafica
     * a proyectar en la pantalla principal de "La Obra".
     * Este función utiliza internamente el módulo del "socorro" para
     * crear las imágenes de "La Nube" mediante la librería JavaScript
     * de Processing (p5js 2.0) y sus funciones "Shaders" disponibles.
     */
    function _iniciar() {
        let _fragmentShader;
        const _escenificador = S.O.S.crearEscenaP5();

        _escenificador.alCargar((S) => {
            _fragmentShader = S.O.S.cargarShader('/shaders/la_nube_draft.frag');
        });

        _escenificador.alComenzar((S) => {
            S.O.S.fragmentShader(_fragmentShader);
            S.O.S.uniformTiempo("u_time");
            S.O.S.uniformResolucion("u_resolution");
            S.O.S.uniformMouse("u_mouse");
            S.O.S.uniform("u_direccion", 0.1, 0.1);
            S.O.S.uniform("u_degrade", 0.6);
            S.O.S.uniform("u_volumen", 0.2);
            S.O.S.uniform("u_rotacion", 3.2);
            S.O.S.uniform("u_velocidad", 0.3);
            S.O.S.uniform("u_zoom", 3.0);
        });
        
        _escenificador.alDesplegar((S) => {
            _atenderPlegarias(S);
            // Aquí se debería setear alguna variable "uniform" para 
            // controlar lo que se muestra en la pantalla.
            S.O.S.desplegar();
            
            // Luego de haber desplegado "La Nube" se 
            // despliegan los seguidores
            _desplegar(S);
        });
    }

    /**
     * _atenderPlegarias
     * Recibe los mensajes de los seguidores enviados a través del protocolo OSC.
     * En respuesta, crea un registro de los servidores conectados a "La Nube" y
     * les asocia los mensajes recibidos para procesarlos, luego, como parte de
     * la representación que tiene lugar en la pantalla proyectada de "La Nube".
     */
    function _atenderPlegarias(S) {
        let _mensajes = Mensajes.recuperarClasificados();
        for (const identificadorSeguidor in _mensajes) {
            if (_mensajes.hasOwnProperty(identificadorSeguidor)) {
                if (!_seguidores.hasOwnProperty(identificadorSeguidor)) {
                    // Crea el seguidor en caso de ser la primera vez que se conecta
                    _seguidores[identificadorSeguidor] = Seguidor(S, identificadorSeguidor);
                }
                // Le transfiere los mensajes recibidos para procesarlos más tarde
                _seguidores[identificadorSeguidor].mensajes(_mensajes[identificadorSeguidor]);
            }
        }
    }
    
    function _desplegar(S) {
        const _seg = {};
        for (const identificadorSeguidor in _seguidores) {
            if (_seguidores.hasOwnProperty(identificadorSeguidor)) {
                let _seguidor = _seguidores[identificadorSeguidor];
                _seg[identificadorSeguidor] = _seguidor;
                _seguidor.desplegar(S.O.S.ancho(), S.O.S.alto());
            }
        }
        _seguidores = _seg;
    }
    
    return {};
}

export default Nube;

