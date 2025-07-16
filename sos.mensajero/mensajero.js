/* =============================================================================
 * 
 *                            M E N S A J E R O S   
 * 
 * =============================================================================
 */

/**
 * Mensajero (OSC) de la "Pantalla-Nube"
 * Intermediario (web socket) entre la nube y sus seguidores.
 * Responsable de recibir y canalizar los mensajes de los 
 * de los siervos hacia la nube a través del protocolo OSC.
 */
var osc = require('node-osc'),
    io  = require('socket.io').listen(8081);
var oscServer, oscClient;

io.on('connection', function (socket) {
  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer = new osc.Server(obj.server.port, obj.server.host);
    oscClient = new osc.Client(obj.client.host, obj.client.port);

    oscClient.send('/status', socket.id + ' connected');

    oscServer.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('Recibiendo mensaje del SEGUIDOR.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    var toSend = obj.split(' ');
    oscClient.send(...toSend);
    console.log('Enviando mensaje desde LA NUBE.', toSend);
  });
  socket.on("disconnect", function () {
    oscServer.kill();
  });
});



/**
 * Mensajero (OSC) de la "Pantalla-Presentalla"
 * Intermediario (web socket) entre la presentalla (pantalla
 * de ofrendas) y los siervos. Responsable de canalizar las
 * ofrendas digitales de sus seguidores como mensajes OSC.
 */
var osc1 = require('node-osc'),
    io1  = require('socket.io').listen(8091);
var oscServer1, oscClient1;

io1.on('connection', function (socket) {
  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer1 = new osc1.Server(obj.server.port, obj.server.host);
    oscClient1 = new osc1.Client(obj.client.host, obj.client.port);

    oscClient1.send('/status', socket.id + ' connected');

    oscServer1.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('Recibiendo mensaje del SEGUIDOR.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    var toSend = obj.split(' ');
    oscClient1.send(...toSend);
    console.log('Enviando mensaje desde LA NUBE.', toSend);
  });
  socket.on("disconnect", function () {
    oscServer1.kill();
  });
});