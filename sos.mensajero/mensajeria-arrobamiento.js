/* =============================================================================
 * 
 *        C O N E X I Ó N    C O N    L A    P A N T A L L A  -  N U B E
 * 
 * =============================================================================
 */

/**
 * WEB SOCKET 1 - "El Arrobamiento" (puerto 8081)
 * Intermediario (web socket) entre la nube y sus seguidores.
 * Responsable de recibir y canalizar los mensajes de los 
 * siervos hacia la nube a través del protocolo OSC, durante
 * el ritual de arrobamiento y veneración.
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
      console.log('Recibiendo mensaje de arrobamiento del SEGUIDOR.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    var toSend = obj.split(' ');
    oscClient.send(...toSend);
    console.log('Respuesta divina desde la NUBE.', toSend);
  });
  socket.on("disconnect", function () {
    oscServer.kill();
  });
});