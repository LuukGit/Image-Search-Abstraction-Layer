/*
User Story: I can get the image URLs, alt text and page urls for a set of images relating to a given search string.
User Story: I can paginate through the responses by adding a ?offset=2 parameter to the URL.
User Story: I can get a list of the most recently submitted search strings.

cx: 004013124895533866227:pi661a3hh0e
API Key: AIzaSyDMaaMGWQBtufrRh3BPqInmLvuj9MFL8ys 
*/

var http = require('http');
var express = require('express');
var functions = require("./client/js/functions.js");

var app = express();
var server = http.createServer(app);

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: "AIzaSyDMaaMGWQBtufrRh3BPqInmLvuj9MFL8ys",
  cx: "004013124895533866227:pi661a3hh0e"
});

app.get("/api/imagesearch/:query*", function(req, res) {
    var offset = 1;
    var query = req.url.replace("/api/imagesearch/", "").split("%20").join(" ");
    functions.saveQuery(query);
    
    // Handle offset option
    if (query.match(/\?offset=/))
    {
        offset = query.split("=")[1];
        if (offset > 10) 
        { 
            offset = 10; 
        }
        else if (offset < 1)
        {
            offset = 1;
        }
        query = query.split("?")[0];
    }
    
    googleSearch.build({
      q: query,
      fileType: "jpg",
      num: offset 
    }, function(error, response) {
        if (error) { throw error; }
          res.send(functions.parseResults(response));
    });
});

app.get("/api/latest/imagesearch", function(req, res) {
    res.send(functions.latestQueries());
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    functions.initQueries();
    var addr = server.address();
    console.log("App listening at", addr.address + ":" + addr.port);
});
