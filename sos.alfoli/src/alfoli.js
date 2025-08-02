/*
 * =============================================================================
 * 
 *                          M Ó D U L O    A L F O L Ï
 * 
 * =============================================================================
 */
import Oferente from './oferente.js';


/**
 * Alfoli
 * Representa la pantalla de contabilización y monitoreo de las ofrendas del siervo.
 * Se trata de una imagen con la forma de cofre para ofrendas proyectada en la pared
 * opuesta a la de "La Nube" que se ocupa de simular la extracción de datos realizada
 * sobre cada uno de los seguidores conectados en ese preciso momento.
 * La imagen pretende pasar desapercibida, por eso no incluye ningún tipo de sonido.
 * En respuesta a la actividad de cada seguidor en su pantalla táctil, una animación
 * simple ilustra cómo la ristra de datos sustraídos son introducidos en el alfolí.
 */
function Alfoli(S) {
    let _oferentes  = {};
    _iniciar();
    
    
    
// ==============================================================
// 
//  DEFINICIÓN DE LAS FUNCIONES PROPIAS DE "EL ALFOLÍ"
//  
// ==============================================================
    
    /**
     * _iniciar
     * Función privada de "El Alfolí", responsable de crear la gŕafica
     * a proyectar en la pantalla de contabilización de ofrendas.
     * Este función utiliza internamente el módulo del "socorro" para
     * crear las imágenes de "El Alfolí" mediante la librería JavaScript
     * de Processing (p5js 2.0).
     */
    function _iniciar() {
        const _escenificador = S.O.S.crearEscenaP5();

        // 1. CARGA (PRELOAD)
        // Instancia previa a la representación de la escena
        // utilizada para cargar los archivos necesarios.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alCargar((S) => {

        });

        // 2. COMIENZO (SETUP)
        // Momento de configuración que se ejecuta inmediatamente
        // antes de iniciar el bucle de representación de la escena.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alComenzar((S) => {
        });
        
        // 3. DESPLIEGUE (DRAW)
        // Función ejecutada en bucle y responsable de dibujar el lienzo
        // principal con "El Alfolí" y las ofrendas de los oferentes.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alDesplegar((S) => {
            S.O.S.P5.background(0);

            // PRIMERO: RECIBIR OFRENDAS
            // Antes que nada se deben realizar la colecta de las
            // nuevas ofrendas enviadas por los siervos "oferentes".
            _recolectarOfrendas(S);
            
            // SEGUNDO: CONTABILIZAR OFRENDAS
            // Por cada ofrenda recibida, se dispara una animación que
            // muestra cómo los datos digitales del oferente son procesados
            // e introducidos dentro del cofre de "El Alfolí".
            _contabilizarOfrendas(S);
        });
    }
    
    
    /**
     * _recolectarOfrendas
     * Recibe los mensajes de los oferentes enviados a través del protocolo OSC.
     * En respuesta, crea un registro de oferentes actualmente conectados a "La 
     * Nube" y les asocia los mensajes recibidos para procesarlos luego.
     */
    function _recolectarOfrendas(S) {
        let _mensajes = Mensajes.recuperarClasificados();
        for (const identificadorOferente in _mensajes) {
            if (_mensajes.hasOwnProperty(identificadorOferente)) {                
                // Se crea un nuevo oferente en caso de ser la primera vez
                if (!_oferentes.hasOwnProperty(identificadorOferente)) {
                    let _nuevoOferente = Oferente(S, identificadorOferente);
                    _oferentes[identificadorOferente] = _nuevoOferente;
                }
                // Se transfieren los mensajes recibidos para contabilizarlos luego
                _oferentes[identificadorOferente].mensajes(_mensajes[identificadorOferente]);
            }
        }
    }
    
    
    /**
     * _contabilizarOfrendas
     * Recorre la lista de oferentes para procesar sus últimos mensajes
     * recibidos. Por cada nueva ofrenda, se dispara una animación que
     * muestra cómo los datos son introducidos en "El Alfolí".
     * Esta función también se ocupa de remover de la lista aquellos 
     * oferentes que se hayan desconectado o lleven tiempo inactivos.
     */
    function _contabilizarOfrendas(S) {
        
    }
}

export default Alfoli;


