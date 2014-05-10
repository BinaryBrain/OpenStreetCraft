var osmread = require('osm-read');
var http = require("http");
var parseString = require('xml2js').parseString;
/*
function getXML(options, onResult)
{


    var prot = http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
//            console.log(output);
            onResult(output);
           // onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};

function nodeGeted(xml) {
    console.log(xml);
}

function getNodes(xml) {

    parseString(xml, function (err, result) {
    
        console.log(result);
        
        var nodeList = [];
          
        // We just want visible nodes
        for (var i = 0; i < result.osm.node.length; ++i) {
            var node =  result.osm.node[i]['$'];
            if (node.visible) {
                nodeList.push(node);
                console.log(node);
                
                getXML({
                    host: 'api.openstreetmap.org',
                    port: 80,
                    path: '/api/0.6/node/' + node.id,
                    method: 'GET',
                    headers: {
                    'Authorization': 'Basic aGV4YXBvZGVzbXM6ZjlrYmZ1ang='
                }}, nodeGeted)
            }
        }
    });

}

getXML({
    host: 'api.openstreetmap.org',
    port: 80,
    path: '/api/0.6/map?bbox=46.2183546,6.2664576,46.5383546,6.5864576',
    method: 'GET',
    headers: {
        'Authorization': 'Basic aGV4YXBvZGVzbXM6ZjlrYmZ1ang='
    }
}, getNodes);

*/


osmread.parse({
    url: 'http://www.overpass-api.de/api/xapi?way[bbox=6.5694467,46.5201298,6.5794467,46.5301298]',
    format: 'xml',
    endDocument: function(){
        console.log('document end');
    },
    bounds: function(bounds){
        console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function(node){
        console.log('node: ' + JSON.stringify(node));
    },
    way: function(way){
        console.log('way: ' + JSON.stringify(way));
    },
    error: function(msg){
        console.log('error: ' + msg);
    }
}); 