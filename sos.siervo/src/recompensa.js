/*
 * =============================================================================
 * 
 *                      M Ó D U L O    R E C O M P E N S A S
 * 
 * =============================================================================
 */


/**
 * Feed
 * Surtido de recompensas visuales sugerentes que incentivan al servidor
 * obsequioso a iniciar (y continuar) el recorrido infinito del "scrolling".
 * El "feed" comienza con una portada que invita al seguidor a dar inicio al 
 * recorrido por la pantalla, desplegando recompensas con incentivos visuales
 * en la medida que la acción de "scrolling" avanza.
 * Cada recompensa consiste en una imagen provocadora sugiriendo algún tipo
 * de obscenidad pero que no se revela nunca completamente (la "imagen-cebo" del 
 * incentivo). Sólo la acción del "scrolling" permite ir exponiendo gradualmente
 * su contenido, haciéndolo cada vez más nítido aunque nunca enteramente visible.
 */
function Feed(sos, contenedor) {
    const S = sos.socorrista();
    const _contenedor = contenedor;
    const _recompensas = [];
    const _incentivos  = [];
    const _reinicio    = Reinicio();

    // CREACIÓN DE INCENTIVOS
    // Definición de los incentivos: "imágenes-cebos" que incitan
    // al seguidor a hacer "scrolling" para revelar su contenido.
    // En lugar de crear un incentivo por cada recompensa del "feed" 
    // se crean una cantidad acotada y se las va reasignando de 
    // manera circular a cada recompensa ("Round Robin").
    for (let i = 0; i < __CANTIDAD_INCENTIVOS__; i++) {
        _incentivos.push(Incentivo());
    }

    // ARMADO DEL FEED INICIAL
    // Se crea la versión inicial del "feed". El contenido adicional
    // se irá añadiendo en la medida que el usuario haga "scrolling".
    const _inicio = Iniciacion();
    _recompensas.push(Recompensa());  // Por el momento se agrega sólo la primera recompensa
    _recompensas[0].exponerIncentivos();
    
    
    // CONTROLADORES DEL SCROLLING DEL "FEED"
    // Se utilizan dos tipos de objetos diferentes para controlar
    // el comportamiento del siervo en el "feed":
    // - LISTENER   : gestiona los eventos que se disparan cada vez
    //                que se hace "scolling" por la página. Se ocupa
    //                de enviar los mensajes OSC, entre otras cosas.
    // - OBSERVADOR : dectac cuando una recompensa entra al viewport
    //                para desplegar el incentivo correspondiente.
    const _opcionesObservador = {
        root: _contenedor, 
        rootMargin: '0px',
        threshold: 1 
    };
    window.addEventListener('scroll', _obnubilar);
    
    
    
    // ==========================================================
    // 
    //  DEFINICIÓN DEL OBJETO PARA LA INICIACION
    //  
    // ==========================================================

    /**
     * Iniciacion
     * Elemento visual que funciona a modo de portada que da inicio
     * al viaje del seguidor a lo largo de su "feed scrolleable".
     * La iniciación le da la bienvenida al seguidor y lo invita a
     * comenzar el recorrido por la pantalla del siervo mediante el
     * "scrolling". Luego de iniciado, este elemento cambia para, en
     * vez de dar la bievenida, incite al seguidor a continuar.
     */
    function Iniciacion() {
        let _convertido = false;
        const _elementoHTML = document.createElement('div');
        _elementoHTML.classList.add('-SOS-inicio');
        _contenedor.appendChild(_elementoHTML);
        
        const _imagen1HTML = document.createElement('img');
        _imagen1HTML.src = "/imagenes/feed-inicio.png";
        _imagen1HTML.classList.add('-SOS-portada');
        _elementoHTML.appendChild(_imagen1HTML);     
        
        const _imagen2HTML = document.createElement('img');
        _imagen2HTML.src = "/imagenes/feed-scroll.png";
        _imagen2HTML.classList.add('-SOS-zocalo');
        _elementoHTML.appendChild(_imagen2HTML);
        
        /**
         * convertir
         * Cambia la imagen de la portada, una vez que el "scrolling" ya fue
         * iniciado, para evitar volver a mostrar el texto de bienvenida.
         */
        function convertir() {
            if (!_convertido) {
                _convertido = true;
                _elementoHTML.innerHTML = "";

                const _imagen1HTML = document.createElement('img');
                _imagen1HTML.src = "/imagenes/feed-arrobamiento.png";
                _imagen1HTML.classList.add('-SOS-portada');
                _elementoHTML.appendChild(_imagen1HTML);     

                const _imagen2HTML = document.createElement('img');
                _imagen2HTML.src = "/imagenes/feed-scroll2.png";
                _imagen2HTML.classList.add('-SOS-zocalo');
                _elementoHTML.appendChild(_imagen2HTML);
            }
        }
        
        return {convertir};
    }
        
        
        
    // ==========================================================
    // 
    //  DEFINICIÓN DEL OBJETO PARA LAS RECOMPENSAS
    //  
    // ==========================================================

    /**
     * Recompensa
     * Recompensa individual que adopta la forma de entrada en el "feed" del siervo
     * y que despliega un incentivo para que el seguidor continúe haciendo "scroll".
     */
    function Recompensa() {
        const _ubicacion = _recompensas.length;
        const _incentivo = _incentivos[_ubicacion % __CANTIDAD_INCENTIVOS__];
        
        // Creación del contenedor HTML para la recompensa
        const _elementoHTML = document.createElement('div');   // Contenedor HTML
        _elementoHTML.classList.add('-SOS-recompensa');
        _elementoHTML.id = "SOS-Recompensa-" + _ubicacion;
        _contenedor.appendChild(_elementoHTML);
        
        // Creación del "Observador" para detectar acciones del "scrolling"
        const _observadorDeRecompensa = new IntersectionObserver(_determinarExposicion, _opcionesExposicion);
        _observadorDeRecompensa.observe(_elementoHTML);
        
  
        /**
         * exponerIncentivos
         * Esta función es la responsable de ir construyendo el "feed" del siervo
         * en la medida que éste realiza la acción de "scrolling".
         * Básicamente, se ocupa de realizar dos tareas principales:
         *  1. Ir añadiendo recompensas al final del "feed" cada vez que el 
         *     seguidor llega a la última recompensa ya creada.
         *  2. Asignar el incentivo que la recompensa debe mostrar. Como el 
         *     número de incentivos es acotado, esta función los va reasignando
         *     entre las recompensas que realmente están visibles en el viewport.
         */
        function exponerIncentivos(recursivo = true) {
            // Se despliega el incentivo de la recompensa, reutilizando alguno
            // de los incentivos ya creados al inicio del "feed". Generar un 
            // incentivo por cada recompensa sería demasiado costoso ya que
            // cada uno de ellos crea una imagen mediante "shaders" GLSL.
            _elementoHTML.innerHTML = "";
            _incentivo.emplazar(_elementoHTML, _ubicacion);

            // Se añaden recompensas adicionales a continuación de la actual
            // para asegurarse que el "scrolling" perdure infinitamente.
            if (recursivo) {
                if (_ubicacion + 1 >= _recompensas.length ) {
                    _recompensas.push(Recompensa());
                    _recompensas[_ubicacion + 1].exponerIncentivos(false);
                }
                if (_ubicacion > 0) {
                    _recompensas[_ubicacion - 1].exponerIncentivos(false);
                }
            }
        }
        
        /**
         * determinarExposicion
         * Función que actualiza el incentivo ("imagen-cebo") de la recompensa en el
         * "feed" cada vez que ésta ingresa al "viewport", o sea, se vuelve visible.
         * Dado que crear un incentivo diferente por cada recompensa sería una operación
         * muy costosa (cada incentivo termina siendo una imagen generada con "shaders"),
         * se crea sólo al comienzo una cantidad limitada de ellos y se los va reutilizando
         * en la medida que las recompensas se depliegan (se hacen visibles) en el "feed".
         * El grado de exposición de la obscenidad del incentivo (que tan pixelado o 
         * desenfocado) depende del nivel de profundidad de la recompensa en el recorrido.
         */
        function _determinarExposicion(entradas, observador) {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    exponerIncentivos();
                }
            });
        }
        
        return {exponerIncentivos};
    }
    

    // =============================================================
    // 
    //  DEFINICIÓN DEL INCENTIVO (IMAGEN-CEBO A REVELAR CON SCROLL)
    //  
    // =============================================================
    
    /**
     * Incentivo
     * Imagen sugerente, nunca revelada por completo, que funciona como
     * una especie "cebo visual" para seducir al seguidor, obnubilarlo e
     * inducirlo constantemente a seguir haciendo "scrolling".
     * El incentivo es construido a partir de una imagen obscena que, con 
     * el uso de "shaders", es pixelada y desenfocada. Cuanto más profundo
     * en el "feed" se encuentre el incentivo, más reveladora será la imagen,
     * aunque nunca termina de develarse enteramente.
     */
    function Incentivo() {
        let _gradoIncentivo = 0;
        let _elementoHTML = document.createElement('div');
        _elementoHTML.classList.add('-SOS-incentivo');

        // Variables para el módulo del "socorro"
        let _escenificador;
        let _fragmentShader;
        let _imagenIncentivo;
        
        /**
         * _imagenCebo
         * Función privada que se ocupa de crear la imagen que se
         * utilizará como incentivo. Internamente lo que hace este
         * método es invocar las funciones del módulo del "socorro"
         * que permiten crear escenas utilizando tanto la librería
         * p5js como Three.hs. En este caso, el incentivo se crea
         * simplemente como un "fragment shader" de Three.js.
         */
        function _imagenCebo() {
            _escenificador = S.O.S.crearEscena(_elementoHTML);
            _escenificador.alCargar((S) => {
                _fragmentShader  = S.O.S.cargarShader('/shaders/incentivo.frag');
                _imagenIncentivo = S.O.S.cargarTextura2D('imagenes/incentivo_01.jpg');
            });
            _escenificador.alComenzar((S) => {
                S.O.S.fragmentShader(_fragmentShader);
                S.O.S.uniformTiempo("u_time");
                S.O.S.uniformResolucion("u_resolution");
                S.O.S.uniform("u_texture", _imagenIncentivo);
                S.O.S.uniform("u_blurAmount", 61);
                S.O.S.uniform("u_pixelSize", 100, 100);
            });
            _escenificador.alDesplegar((S) => {
                // NIVEL DE REVELACIÓN
                // Las recompensas que se muestran más arriba en el "feed" 
                // están más pixeladas. Cuanto mayor es el "scrolling" el 
                // pixelado se reduce, pero aumenta el "blur" de forma tal
                // que nunca se pueda ver la imagen realmente.
                let _blur  = Math.log(_gradoIncentivo + 1) * 15;
                let _nivel = _gradoIncentivo < 3 ? 13 : 
                            _gradoIncentivo < 6 ? 11 : 
                            _gradoIncentivo < 10 ? 8 : 
                            _gradoIncentivo < 36 ? 6 : 
                            _gradoIncentivo < 50 ? 5.5 :
                            _gradoIncentivo < 60 ? 5 : 4.5;
                let _escala = S.O.S.mapear(Math.max(240 - (_gradoIncentivo * _nivel), 1), 1, 240, 8, 120);
                S.O.S.uniform("u_pixelSize", _escala, _escala);
                S.O.S.uniform("u_blurAmount", _blur);
                S.O.S.desplegar();
            });
        }
        
        /**
         * emplazar
         * Reubica el incentivo en el contenedor recibido como argumento
         * (los incentivos se reasignan de forma circular a las recompensas).
         * El parámetro "nivel" indica qué tan profundo en el "feed" se 
         * encuenta para calcular su grado de exposición.
         */
        function emplazar(contenedor, nivel) {
            if (!_escenificador) {
                _imagenCebo();
            }
            contenedor.appendChild(_elementoHTML);
            _gradoIncentivo = nivel;
        }
        
        return {emplazar};
    }
    
    
    
    // ==========================================================
    // 
    //  DEFINICIÓN DEL BOTON PARA VOLVER AL INICIO DEL RECORRIDO
    //  
    // ==========================================================

    /**
     * Reinicio
     * Elemento visual en forma de botón flotante que le permite
     * al siervo reiniciar su recorrido por el "feed".
     */
    function Reinicio() {
        let _visible = false;
        let _elementoHTML = document.createElement('div');
        _elementoHTML.classList.add('-SOS-reinicio');
        _contenedor.appendChild(_elementoHTML);
        
        const _imagenHTML = document.createElement('img');
        _imagenHTML.src = "/imagenes/feed-boton-arriba.png";
        _imagenHTML.classList.add('-SOS-oculto');
        _elementoHTML.appendChild(_imagenHTML);
        
        _imagenHTML.addEventListener("click", (event) => { 
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
        
        function desplegar(visible) {
            // Mostrar el elemento
            if (visible && !_visible) {
                _imagenHTML.classList.remove('-SOS-oculto');
                _imagenHTML.classList.add('-SOS-visible');
                _visible = true;
            }
            // Ocultar el elemento
            else if (!visible && _visible) {
                _imagenHTML.classList.add('-SOS-oculto');
                _imagenHTML.classList.remove('-SOS-visible');
                _visible = false;
            }
        }
        
        return {desplegar};
    }
    
    
// ==============================================================
// 
//  DEFINICIÓN DE LAS FUNCIONES DEL PROPIO "FEED"
//  
// ==============================================================
    
    /**
     * _obnubilar
     * Atiende la obnubilación absoluta del siervo hacia "La Nube" durante el "scrolling".
     * Esta función es invocada cada vez que el usuario se desplaza por su "feed" mientras
     * observa los incentivos que cada una de las recompensas exhibe obscenamente.
     * La función realiza, básicamente, tres tareas:
     *  1. Actualizar la portada: en lugar de dar la bienvenida, debe invitar al "scrolling".
     *  1. Notificar a "La Nube" acerca de la obnubilación del siervo (su "scrolling").
     *  2. Dirigir las ofrendas digitales extraídas del siervo hacia "La Presentalla". 
     */
    function _obnubilar() {
        let _posY = window.scrollY;
        
        // 1. ACTUALIZACIÓN DE LA PORTADA DEL FEED
        // Una vez el seguidor se haya adentrado en su "feed", la imagen de la
        // portada (la "Iniciación") cambia porque no hace falta volver a darle
        // la bienvenida. Simplemente debe instigarlo a seguir con el "scrolling".
        if (_posY > 1440) {
            _inicio.convertir();
            _reinicio.desplegar(true);
        }
        else {
            _reinicio.desplegar(false);
        }
        
        // 2. NOTIFICAR A "LA NUBE" SOBRE LA OBNUBILACIÓN DEL SIERVO
        // Se envía un mensaje OSC hacia "La Nube" informando acerca
        // del comportamiento del siervo al recorrer su "feed".
        conexionNUBE.emit('message', '/' + __OSC_DIRECCION_NUBE__ + '/' + __OSC_MENSAJE_ARROBAR__ + ' ' + 
                         _posY);         // Se envía la posición del "scroll" vertical del siervo
        
        
        // 3 ENVIAR A "LA PRESENTALLA" LA OFRENDA DIGITAL DEL SIERVO
        // Se envía un mensaje OSC hacia "La Presentalla" con el detalle
        // de los datos del siervo en calidad de "ofrenda digital".
        conexionPRESENTALLA.emit('message', '/' + __OSC_DIRECCION_PRESENTALLA__ + '/' + __OSC_MENSAJE_OFRENDAR__ + ' ' + 
                                _posY);  // Se envía la posición del "scroll" vertical del siervo
    }

    /**
     * _opcionesExposicion
     * Se trata de un objeto general que almacena parámetros de configuración
     * para el "Observador"  del scrolling a lo largo del feed. Como esta 
     * configuración es la misma para todas las recompensas, se define una
     * única vez en el "feed" y luego es usada por cada uno de los "observdores"
     * de las recompensas que se creen.
     */
    function _opcionesExposicion() {
        return _opcionesObservador;
    }

    return {};
}

export default Feed;