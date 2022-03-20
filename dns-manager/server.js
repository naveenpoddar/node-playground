var named = require('mname');  
var server = named.createServer();

// In production, run the server on TCP/UDP port 53\
// or use iptables to forward traffic
var port = 9000;

// Listen on TCP
server.listenTcp({ port: port, address: '::' });

// Listen on UDP
server.listen(port, '::', function() {  
  console.log('DNS server started on TCP/UDP port ' + port);
});

server.on('query', function(query, done) {  
  // Extract query hostname and set default TTL to 60 seconds
  var name = query.name(), ttl = 60;

  // Log incoming DNS query for debugging purposes
  console.log('[DNS] %s IN %s', query.name(), query.type());

  // Your backend IPs
  var serverIPs = ['1.2.3.4', '8.8.4.4', '8.8.8.8'];

  // Select one randomly (modify based on your own routing algorithm)
  var result = serverIPs[Math.floor(Math.random() * serverIPs.length)];

  // Load-balance DNS queries (A record) for "api.example.com"
  if (query.type() === 'A' && name.toLowerCase().endsWith('api.example.com')) {
     // Respond with load-balanced IP address
     query.addAnswer(name, new named.ARecord(result), ttl);
  }
  else {
    // NXDOMAIN response code (unsupported query name/type)
    query.setError('NXDOMAIN');
  }

  // Send response back to client
  server.send(query);
});
