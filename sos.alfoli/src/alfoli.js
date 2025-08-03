/*
 * =============================================================================
 * 
 *                          M Ó D U L O    A L F O L Ï
 * 
 * =============================================================================
 */
import Oferente from './oferente.js';

const ALFOLI_POS_X = 0.81;
const ALFOLI_POS_Y = 0.306;


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
    

    /**
     * Recursos
     * Se trata simplemente de una colección de recursos gráficos
     * para construir las ventanas de las ofrendas. Este objeto
     * es cargado una sóla vez al inicializar "El Alfolí" y luego
     * es pasado como parámetro a los oferentes y a las ofrendas.
     */
    const Recursos = {
        IMAGEN: {
            marco      : null
        },
        FUENTE: {
            encabezado : null,
            titulo     : null,
            texto      : null
        },
        GRAFICO: {
            ventana    : null
        }
    };

    
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
        let _fragmentShader;
        const _escenificador = S.O.S.crearEscenaP5();

        // 1. CARGA (PRELOAD)
        // Instancia previa a la representación de la escena
        // utilizada para cargar los archivos necesarios.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alCargar((S) => {
            _fragmentShader            = S.O.S.cargarShader('/shaders/pantalla-alfoli.frag');
            Recursos.IMAGEN.marco      = S.O.S.cargarTextura2D('/imagenes/ventana-OFRENDA.png');
            Recursos.FUENTE.encabezado = S.O.S.cargarFuente('/fuentes/Jersey20-Regular.ttf');
            Recursos.FUENTE.titulo     = S.O.S.cargarFuente('/fuentes/KodeMono-Bold.ttf');
            Recursos.FUENTE.texto      = S.O.S.cargarFuente('/fuentes/KodeMono-Regular.ttf');
        });

        // 2. COMIENZO (SETUP)
        // Momento de configuración que se ejecuta inmediatamente
        // antes de iniciar el bucle de representación de la escena.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alComenzar((S) => {
            S.O.S.fragmentShader(_fragmentShader);
            S.O.S.uniformTiempo("u_time");
            S.O.S.uniformResolucion("u_resolution");
            S.O.S.uniformMouse("u_mouse");
            let _imagenMarco = Recursos.IMAGEN.marco.contenido();
            Recursos.GRAFICO.ventana = S.O.S.P5.createGraphics(_imagenMarco.width, _imagenMarco.height);
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
        
            // DESPLIEGUE DE LA NUBE Y SUS SEGUIDORES (SHADER)
            // Se invoca al método que despliega la gŕafica principal
            // de "La Nube" y sus seguidores (el render del shader).
            S.O.S.desplegar();            
            
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
     * Nube" y crea sus ofrendas en caso de que hayan tenido actividad.
     */
    function _recolectarOfrendas(S) {
        let _mensajes = Mensajes.recuperarClasificados();
        for (const identificadorOferente in _mensajes) {
            if (_mensajes.hasOwnProperty(identificadorOferente)) {                
                // Se crea un nuevo oferente en caso de ser la primera vez
                if (!_oferentes.hasOwnProperty(identificadorOferente)) {
                    let _nuevoOferente = Oferente(S, identificadorOferente, Recursos);
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
     * recibidos. La función se encarga de remover de la lista aquellos 
     * oferentes que se hayan desconectado o lleven tiempo inactivos.
     * Además, se ocupa de actualizar, desplegar y/o enviar a "El Alfolí"
     * las ofrendas que estén en curso.
     */
    function _contabilizarOfrendas(S) {
        let _ofrnt = {};
        for (const _id in _oferentes) {
            if (_oferentes.hasOwnProperty(_id)) {
                let _oferente = _oferentes[_id];
            
                // OFERENTE DESCONECTADO
                // Se elimina al oferente de la lista
                if (_oferente.desconectado()) {
                    _oferente.eliminar();
                }
                
                // OFERENTE ACTIVO
                // Se procesan las ofrendas del oferente activo
                else {
                    _ofrnt[_id] = _oferente;
                    _oferente.contabilizar(S.O.S.ancho(), S.O.S.alto(), ALFOLI_POS_X, ALFOLI_POS_Y);
                }
            }
        }
        _oferentes = _ofrnt;
    }
}

export default Alfoli;


