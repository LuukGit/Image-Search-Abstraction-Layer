var mongo = require("mongodb").MongoClient;
var mongoURL = process.env.MONGOLAB_URL;

var latestQueries;

module.exports = {
    getLatestQueries:  function getLatestQueries(){return latestQueries;},
    
    parseResults:   function parseResults(response)
                    {
                        var items = response.items;
                        var objects = [];
                        if (items !== undefined)
                        {
                            for (var i = 0; i < items.length; i++)
                            {
                                if (response.items[i].pagemap.cse_image)
                                {
                                    var url = response.items[i].pagemap.cse_image[0];
                                }
                                else
                                {
                                    url = "Not Found";
                                }
                                objects.push({url: url, snippet: response.items[i].snippet, context: response.items[i].link});
                            }
                        }
                        else 
                        {
                            objects.push({error: "No results found."});
                        }
                        return objects;
                    },
                    
    initQueries:    function initQueries()
                    {
                        mongo.connect(mongoURL, function(err, db) {
                            if (err) { throw err; }
                            
                            var cursor = db.collection("queries").find();
                            cursor.each(function(err, docs) {
                                if (err) { throw err; }
                                if (docs !== null)
                                {
                                    console.log(docs);
                                    latestQueries = docs.queries;
                                    console.log(latestQueries);
                                    db.close();
                                }
                            });
                        });       
                    },
        
    saveQuery:      function saveQuery(query)
                    {
                        // Add the new query to the latestQueries. Re
                        latestQueries.push({term: query, when: new Date().toISOString()});
                        if (latestQueries.length > 10)
                        {
                            latestQueries.shift();
                        }
                        console.log(latestQueries);
                        var queries = latestQueries;
                        
                        // Update the queries in the database
                        mongo.connect(mongoURL, function(err, db) {
                            if (err) { throw err; }
                            db.collection("queries").replaceOne({
                                
                            },{
                                queries  
                            }, function(err, data) {
                                if (err) { throw err; }
                                console.log(data);
                                db.close();
                            });
                        });
                    }
}
