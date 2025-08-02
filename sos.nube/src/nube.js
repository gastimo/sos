/*
 * =============================================================================
 * 
 *                           M Ó D U L O    N U B E
 * 
 * =============================================================================
 */
import Seguidor from './seguidor.js';
import Particula from './particula.js';


/**
 * Nube
 * Es el objeto de adoración principal de "La Obra". Se manifiesta durante el rito
 * de veneración en la forma de una proyección en la pared mayor del recinto.
 * "La Nube" está continuamente atendiendo las plegarias de sus seguidores que le
 * llegan en forma de mensajes OSC, informando acerca del comportamiento de éstos
 * en sus dispositivos, o sea, la forma en que interactúan con la pantalla "Siervo".
 * En respuesta a estas plegarias, "La Nube" realiza movimientos, cambios de color
 * y sonidos en la proyección buscando el arrobamiento de sus fieles seguidores.
 * A mayor grado de interacción del o de los seguidores, mayor será la respuesta 
 * animada de "La Nube" en la pantalla proyectada.
 */
function Nube(S) {
    const _orbitales = [];
    let _seguidores  = {};
    _iniciar();

    // Parámetros de uso privado de "La Nube"
    const ORBITAL              = "ORBITAL";
    const ORBITAL_DIST         = "ORBITAL_DIST";
    const SEGUIDOR             = "SEGUIDOR";
    const SEGUIDOR_DIST        = "SEGUIDOR_DIST";
    const DESPLAZAMIENTO       = "DESPLAZAMIENTO";
    const DISTANCIA_MAX        = 99999999;
    
    // Parametrización de indicadores para atracción y repulsión
    const MARGEN_REBOTE        = 0.038;         // Margen desde los bordes donde se empieza a repeler (rebote)
    const INTENSIDAD_REBOTE    = 0.003;         // Fuerza del rebote contra los bordes
    const INTENSIDAD_ATRACCION = 0.000018;      // Fuerza de atracción al orbital más cercano
    const INTENSIDAD_REPULSION = 0.000015;      // Fuerza de respulsión con el seguidor más próximo
    const VEL_MAXIMA_REPOSO    = 0.00021;       // Velocidad máxima en estado de reposo
    const VEL_MAXIMA_ACTIVIDAD = 0.49;          // Velocidad máxima en estado de actividad
    const MIN_ORBITAL_VEL      = 0.0007;        // Velocidad mínima para los orbitales
    const MAX_ORBITAL_VEL      = 0.0011;        // Velocidad máxima para los orbitales
    
    
// ==============================================================
// 
//  DEFINICIÓN DEL OBJETO "ORBITAL" PARA ATRAER SEGUIDORES
//  
// ==============================================================

    /**
     * Orbital
     * Un orbital es un cuerpo celeste que se encuentra todo el
     * tiempo en movimiento dentro del lienzo principal, pero 
     * si traspasar nunca sus límites. Los orbitales son invisibles,
     * no se dibujan. Simplemente ejercen fuerzas de atracción sobre
     * los seguidores para mantener sus órbitas dentro del cuadro.
     */
    function Orbital(S) {
        const _orb = Particula(S);
        _orb.velocidad(S.O.S.aleatorio(MIN_ORBITAL_VEL, MAX_ORBITAL_VEL, true), 
                      S.O.S.aleatorio(MIN_ORBITAL_VEL, MAX_ORBITAL_VEL, true));
        _orb.aceleracion(0, 0);    // El orbital se mueve a velocidad constante
        _orb.rebotar(true);
        
        function revelar(S, anchoPantalla, altoPantalla) {
            let _posX = _ajustar(_orb.posicion().x, anchoPantalla, anchoPantalla/2);
            let _posY = _ajustar(_orb.posicion().y, altoPantalla,  altoPantalla/2);
            S.O.S.P5.fill(255, 255, 0);
            S.O.S.P5.noStroke();
            S.O.S.P5.circle(_posX, _posY, 41);
        }
        
        return S.O.S.revelar({revelar}, _orb);
    }
    

    
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
        let _imagenPrueba;
        const _escenificador = S.O.S.crearEscenaP5();

        // 1. CARGA (PRELOAD)
        // Instancia previa a la representación de la escena
        // utilizada para cargar los archivos necesarios.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alCargar((S) => {
            _fragmentShader = S.O.S.cargarShader('/shaders/pantalla-nube.frag');
        });

        // 2. COMIENZO (SETUP)
        // Momento de configuración que se ejecuta inmediatamente
        // antes de iniciar el bucle de representación de la escena.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alComenzar((S) => {
            // Definición e inicialización de los orbitales
            for (let i = 0; i < __CANTIDAD_ORBITALES__; i++) {
                _orbitales[i] = Orbital(S);
            }
            
            // Asociación del shader para la representación
            S.O.S.fragmentShader(_fragmentShader);
            S.O.S.uniformTiempo("u_time");
            S.O.S.uniformResolucion("u_resolution");
            S.O.S.uniformMouse("u_mouse");
            S.O.S.uniform("u_intensidadFondo", 0);
            S.O.S.uniform("u_direccion", 0.1, 0.1);
            S.O.S.uniform("u_degrade", 0.6);
            S.O.S.uniform("u_volumen", 0.2);
            S.O.S.uniform("u_rotacion", 3.2);
            S.O.S.uniform("u_velocidad", 0.3);
            S.O.S.uniform("u_zoom", 3.0);
            S.O.S.uniform("u_seguidores", 0);
        });
        
        // 3. DESPLIEGUE (DRAW)
        // Función ejecutada en bucle y responsable de dibujar el lienzo
        // principal con "La Nube" y todos sus seguidores conectados.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _escenificador.alDesplegar((S) => {
            // RECIBIR MENSAJES
            // Antes que nada se deben escuchar las nuevas plegarias
            // que hayan sido recibidas y clasificarlas por seguidor.
            _atenderPlegarias(S);
            
            // ACTUALIZAR LAS TRAYECTORIAS DE LOS ORBITALES
            // Se actualiza la trayectoria de los orbitales en el firmamento
            // que son los cuerpos celestes en torno a los cuales orbitan  
            // los seguidores de "La Nube" en el firmamento.
            _desplazarOrbitales(S);
            
            // PRIMERA PASADA POR LOS SEGUIDORES
            // En una primera pasada por la lista de seguidores se actualiza
            // el listado para eliminar a los seguidores que ya se hayan 
            // desconectado. También se determina, por cada uno, la
            // distancia al orbital más cercano y al seguidor más próximo.
            _actualizarSeguidores(S);

            // SEGUNDA PASADA POR LOS SEGUIDORES
            // En este punto se actualizan las posiciones de los seguidores
            // y se genera la imagen conteniendo de manera cifrada (como
            // información de píxeles) las coordenadas que requiere el shader.
            let _trayectos = _desplazarSeguidores(S);
            
            // ACTUALIZACIÓN DE VARIABLES UNIFORM
            // Se modifica el valor de los "uniform" que usa el 
            // shader principal de la nube para la representación.
            S.O.S.uniform("u_intensidadFondo", _trayectos.intesidadCielo);
            S.O.S.uniform("u_seguidores", _trayectos.cantidad);
            S.O.S.uniform("u_imagenSeguidores", _trayectos.imagen);
                          
            // DESPLIEGUE DE LA NUBE Y SUS SEGUIDORES (SHADER)
            // Se invoca al método que despliega la gŕafica principal
            // de "La Nube" y sus seguidores (el render del shader).
            S.O.S.desplegar();
            
            // DESPLIEGUE DE INFORMACIÓN EXTRA DE SEGUIDORES (P5)
            // Finalmente, se terminan de dibujar, con Processing, los datos
            // adicionales que deben aparecer por encima del shader.
            _desplegarSeguidores(S);
        });
    }
    
    /**
     * _atenderPlegarias
     * Recibe los mensajes de los seguidores enviados a través del protocolo OSC.
     * En respuesta, crea un registro de los servidores conectados a "La Nube" y
     * les asocia los mensajes recibidos para procesarlos luego.
     */
    function _atenderPlegarias(S) {
        let _mensajes = Mensajes.recuperarClasificados();
        for (const identificadorSeguidor in _mensajes) {
            if (_mensajes.hasOwnProperty(identificadorSeguidor)) {                
                // Se crea un nuevo seguidor en caso de ser la primera vez
                if (!_seguidores.hasOwnProperty(identificadorSeguidor)) {
                    let _nuevoSeguidor = Seguidor(S, identificadorSeguidor);
                    _nuevoSeguidor.velocidadMaxima(VEL_MAXIMA_REPOSO);
                    _nuevoSeguidor.rebotar(true);
                    _nuevoSeguidor[DESPLAZAMIENTO] = 0.01;
                    _seguidores[identificadorSeguidor] = _nuevoSeguidor;
                }
                
                // Se transfieren los mensajes recibidos para procesarlos más tarde
                _seguidores[identificadorSeguidor].mensajes(_mensajes[identificadorSeguidor]);
            }
        }
    }
    
    /**
     * _desplazarOrbitales
     * Actualiza las posiciones de los orbitales en el firmamento,
     * es decir, en el lienzo principal de la escena.
     */
    function _desplazarOrbitales(S) {
        for (let i = 0; i < _orbitales.length; i++) {
            _orbitales[i].actualizar();
        }
    }
    
    /**
     * _actualizarSeguidores
     * Esta función hace una primera pasada por la lista actual de
     * seguidores y se ocupa de hacer tres cosas:
     *  1. Remover los seguidores desconectados o inactivos
     *  2. Determinar cuál es el orbital más próximo
     *  3. Determinar cuál es el seguidor más cercano.
     */
    function _actualizarSeguidores(S) {
        let _seg = {};
        for (const _id in _seguidores) {
            if (_seguidores.hasOwnProperty(_id)) {
                let _seguidor = _seguidores[_id];
                _seguidor[ORBITAL]       = null;
                _seguidor[ORBITAL_DIST]  = DISTANCIA_MAX;
                _seguidor[SEGUIDOR]      = null;
                _seguidor[SEGUIDOR_DIST] = DISTANCIA_MAX;
            
                // Si el seguidor se desconectó o estuvo demasiado
                // tiempo inactivo, entonces se lo elimina.
                if (_seguidor.desconectado()) {
                    _seguidor.eliminar();
                }
                // Para los restantes seguidores, se determina el orbital
                // más cercano y el seguidor más próximo (si hubiera).
                else {
                    _seg[_id] = _seguidor;
                    
                    // Se obtiene el orbital más próximo al seguidor
                    for (let i = 0; i < _orbitales.length; i++) {
                        let d = _seguidor.distancia(_orbitales[i]);
                        if (d < _seguidor[ORBITAL_DIST]) {
                            _seguidor[ORBITAL_DIST] = d;
                            _seguidor[ORBITAL] = _orbitales[i];
                        }
                    }

                    // Ahora, se busca al seguidor más próximo a éste
                    for (const _otroId in _seguidores) {
                        if (_otroId != _id && _seguidores.hasOwnProperty(_otroId)) {
                            let d = _seguidor.distancia(_seguidores[_otroId]);
                            if (d < _seguidor[SEGUIDOR_DIST]) {
                                _seguidor[SEGUIDOR_DIST] = d;
                                _seguidor[SEGUIDOR] = _seguidores[_otroId];
                            }
                        }
                    }
                }
            }
        }
        _seguidores = _seg;
    }

    /**
     * _desplazarSeguidores
     * Se actualizan internamente las posiciones que cada seguidor tendrá 
     * en el firmamento (pantalla principal de "La Nube"). Los seguidores
     * se muestran flotando en el lienzo, atraídos por los orbitales y 
     * repelidos entre sí. Cada vez que un seguidor se aproxima a alguno de
     * los bordes del lienzo es también repelido automáticamente hacia adentro.
     * Los mensajes recibidos previamente por "La Nube" (las plegarias), que
     * describen la interacción del siervo en su pantalla táctil, alteran
     * el movimiento de los seguidores (y también de "La Nube").
     */
    function _desplazarSeguidores(S) {
        const _seg = [];
        
        // FLOTACIÓN DE LOS SEGUIDORES EN PANTALLA
        // Primero se recorren los seguidores para determinar las fuerzas
        // de atracción y repulsión que los hacen flotar en la escena.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        for (const _id in _seguidores) {
            if (_seguidores.hasOwnProperty(_id)) {
                let _seguidor = _seguidores[_id];
                _seg.push(_seguidor);
                
                // 1. ATRACCIÓN HACIA EL ORBITAL MÁS CERCANO
                // Se modifica la aceleración para atraer al seguidor al orbital
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                if (_seguidor[ORBITAL]) {
                    let _atraccion = _seguidor.direccion(_seguidor[ORBITAL]);
                    _seguidor.aceleracion(_atraccion.x * INTENSIDAD_ATRACCION, _atraccion.y * INTENSIDAD_ATRACCION);
                }
                
                // 2. REPULSIÓN RESPECTO DE LOS OTROS SEGUIDORES
                // Se modifica la aceleración para alejarse del seguidor más próximo
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                if (_seguidor[SEGUIDOR]) {
                    let _repulsion = _seguidor[SEGUIDOR].direccion(_seguidor);
                    _seguidor.aceleracion(_repulsion.x * INTENSIDAD_REPULSION, _repulsion.y * INTENSIDAD_REPULSION);
                }
                
                // 3. REBOTE DEL SEGUIDOR CONTRA LOS BORDES
                // La aceleración se modifica también para alejar al seguidor de los bordes
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                let _acel = _seguidor.aceleracion();
                if (_seguidor.posicion().x < MARGEN_REBOTE) {
                    let _rebote = Math.abs(MARGEN_REBOTE - _seguidor.posicion().x) * INTENSIDAD_REBOTE;
                    _seguidor.aceleracion(_acel.x + _rebote, _acel.y);
                }
                if (_seguidor.posicion().x > 1 - MARGEN_REBOTE) {
                    let _rebote = -Math.abs(MARGEN_REBOTE - (1 - _seguidor.posicion().x)) * INTENSIDAD_REBOTE;
                    _seguidor.aceleracion(_acel.x + _rebote, _acel.y);
                }
                if (_seguidor.posicion().y < MARGEN_REBOTE) {
                    let _rebote = Math.abs(MARGEN_REBOTE - _seguidor.posicion().y) * INTENSIDAD_REBOTE;
                    _seguidor.aceleracion(_acel.x, _acel.y + _rebote);
                }
                if (_seguidor.posicion().y > 1 - MARGEN_REBOTE) {
                    let _rebote = -Math.abs(MARGEN_REBOTE - (1 - _seguidor.posicion().y)) * INTENSIDAD_REBOTE;
                    _seguidor.aceleracion(_acel.x, _acel.y + _rebote);
                }
            }
        }
        
        // ACTUALIZACIÓN DE TRAYECTORIAS
        // Con la información antes calculada, se actualizan las posiciones de los seguidores
        // en pantalla. Se realizan también ajustes para producir aceleración o desaaceleración.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        let _imagenSeguidores = null;
        let _magnitudTotal = 0;
        let _intensidadColorCielo = 0;
        if (_seg.length > 0) {
            _imagenSeguidores = S.O.S.P5.createImage(_seg.length, 1);
            _imagenSeguidores.loadPixels();
            for (let i = 0; i < _seg.length; i++) {
                let _acel = _seg[i].aceleracion();
                _seg[i].velocidadMaxima(_seg[i].enReposo() ? VEL_MAXIMA_REPOSO : VEL_MAXIMA_ACTIVIDAD);
                if (_seg[i].enReposo())
                    _seg[i].desacelerar();
                else {
                    _seg[i].restablecer();
                    _seg[i].aceleracion(_acel.x + (_acel.x * S.O.S.aleatorio(2.8, 3.2, true) * _seg[i].magnitud() / 44),
                                       _acel.y + (_acel.y * S.O.S.aleatorio(2.8, 3.2, true) * _seg[i].magnitud() / 44));
                }
                // Actualización de las coordenadas del seguidor
                _seg[i].actualizar();
                
                // Preparación de la información para enviar al "shader" de manera encriptada (en una imagen)
                let _segMagnitud = _seg[i].magnitud() * 1.5;
                _magnitudTotal += _segMagnitud;
                let _pos = _seg[i].posicion();
                if (_seg[i].enReposo()) {
                    _seg[i][DESPLAZAMIENTO] += 0.021;
                    _segMagnitud += _segMagnitud * S.O.S.P5.noise(_seg[i][DESPLAZAMIENTO]);
                }
                _imagenSeguidores.set(i, 0, [_pos.x * 255, _pos.y * 255, _segMagnitud / S.O.S.alto() / 2 * 255, 255]);
            }
            // Se terminan de guardar los pixeles de la imagen con los datos encriptados
            _imagenSeguidores.updatePixels();
            
            // Finalmente, se calcula la intensidad del color del cielo
            _intensidadColorCielo = S.O.S.mapear(_seg.length * _magnitudTotal, 0, 3000, 0, 1);
        }
        return {cantidad: _seg.length, imagen: _imagenSeguidores, intesidadCielo: _intensidadColorCielo};
    }
    
    /**
     * _desplegarSeguidores
     * Recorre la lista de seguidores actualmente conectados a "La Nube",
     * cuyas posiciones y trayectorias ya fueron actualizadas previamente
     * y se encarga de desplegar en pantalla la representación de las 
     * interacciones de cada uno ellos (con el movimiento y el tamaño).
     */
    function _desplegarSeguidores(S) {
        const _anchoPantalla = S.O.S.ancho();
        const _altoPantalla  = S.O.S.alto();
        
        S.O.S.P5.push();
        
        /*
        // Desplegar los orbitales
        for (let i = 0; i < _orbitales.length; i++) {
            _orbitales[i].revelar(S, _anchoPantalla, _altoPantalla);
        }
        
        // Desplegar los seguidores
        for (const identificadorSeguidor in _seguidores) {
            if (_seguidores.hasOwnProperty(identificadorSeguidor)) {
                let _seguidor = _seguidores[identificadorSeguidor];
    
                // Revisar las coordenadas del seguidor
                let _posX = _ajustar(_seguidor.posicion().x, _anchoPantalla);
                let _posY = _ajustar(_seguidor.posicion().y, _altoPantalla);
                
                // Mostrar el seguidor
                _mostrarSeguidor(S, _seguidor, _posX - (_anchoPantalla/2), _posY - (_altoPantalla/2));
            }
        }
        */
        
        S.O.S.P5.pop();
    }
    
    
    /**
     * _mostrarSeguidor
     * Dibuja al seguidor sobre el lienzo
     */
    function _mostrarSeguidor(S, seguidor, x, y) {
        if (seguidor[ORBITAL]) {
            const anchoPantalla = S.O.S.ancho();
            const altoPantalla  = S.O.S.alto();
            let _posX = _ajustar(seguidor[ORBITAL].posicion().x, anchoPantalla) - anchoPantalla/2;
            let _posY = _ajustar(seguidor[ORBITAL].posicion().y, altoPantalla) - altoPantalla/2;            
            S.O.S.P5.strokeWeight(2);
            S.O.S.P5.stroke(255, 0, 0);
            S.O.S.P5.line(x, y, _posX, _posY);
        }
          
        if (seguidor[SEGUIDOR]) {
            const anchoPantalla = S.O.S.ancho();
            const altoPantalla  = S.O.S.alto();
            let _posX = _ajustar(seguidor[SEGUIDOR].posicion().x, anchoPantalla) - anchoPantalla/2;
            let _posY = _ajustar(seguidor[SEGUIDOR].posicion().y, altoPantalla) - altoPantalla/2;    
            S.O.S.P5.strokeWeight(1);
            S.O.S.P5.stroke(255, 0, 0);
            S.O.S.P5.line(x, y, _posX, _posY);
        }

        // Dibujar al seguidor
        S.O.S.P5.fill(0);
        S.O.S.P5.noStroke();
        S.O.S.P5.circle(x, y, seguidor.magnitud());
    }

    
    /**
     * _ajustar
     * Ajusta un valor normalizado (entre 0 y 1) para 
     * magnitud indicada. Opcionalmente, se puede 
     * especificar un desplazamiento.
     */
    function _ajustar(valor, magnitud, desplazar = 0) {
        return valor * magnitud - desplazar;
    }
    
    return {};
}

export default Nube;

