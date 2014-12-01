var request = require('request'),
    qs = require('querystring'),
    headers = { 'Content-type': 'application/json' },
    articleSearchApiKey = '42b6b35b812acec99c722f368ead87bf:6:65720321',
    semanticApiKey = '78d85c4fe3261cde922f0602a729605b:11:65720321',
//baseUrl = 'http://jeeg.siti.disco.unimib.it:82/web/app_dev.php/api/'
//articles/2
    baseUrl = 'http://jeeg.siti.disco.unimib.it/web/app_dev.php/api/'


// Articles list

exports.articles = function (req, res) {

    var data = req.body;

    request(
        {
            method: 'GET',
            url: baseUrl + 'articles',
            headers: headers
            //qs : data
        },

        function (error, response, body) {
            var data = JSON.parse(body);
            res.json(data);
        }
    )

};

// Article

exports.article = function (req, res) {

    var data = req.body;

    request(
        {
            method: 'GET',
            url: baseUrl + 'articles/' + data.id,
            headers: headers
        },

        function (error, response, body) {
            var data = JSON.parse(body);
            res.json(data);
        }
    )

};


// Graph
exports.allAssociations = function (req, res) {
    var data = req.body;


    var urlstr = 'articles/' + data.id + '/associations';
    request(
        {
            method: 'GET',
            url: baseUrl + urlstr,
            headers: headers
        },

        function (error, response, body) {

            var data = JSON.parse(body);
            var fin = [];

            fin.push(data.associations.one[0].source);
            for (k in data.associations) {
                //console.log(k,)
                data.associations[k].forEach(function (e) {
                    var cur = e.steps[e.steps.length - 1].destination;
                    if (fin.indexOf(cur) == -1) fin.push(cur);
                })
            }
            res.json(fin);
        }
    )
}


// Graph
exports.completeNetwork = function (req, res) {
    var data = req.body;


    var urlstr = 'articles/' + data.id + '/associations';
    request(
        {
            method: 'GET',
            url: baseUrl + urlstr,
            headers: headers
        },

        function (error, response, body) {

            var data = JSON.parse(body);
            var set = {bipartite: false,
                labelThreshold: 2.5,
                outgoing: "Outgoing links to:",
                incoming: "Incoming links from:",
                mutual: "Mutual links with:"
            }
            var nodes = [];
            var edges = [];

            var computeEdges = function (f, s) {

                var ns1id = s.replace(/ /g, "_");
                var ns2id = f.destination.replace(/ /g, "_");

                if (nodes.map(function (e) {
                    return e.id;
                }).indexOf(ns1id) == -1) nodes.push({id: ns1id, label: s, color: "#ddd", size: 1});
                if (nodes.map(function (e) {
                    return e.id;
                }).indexOf(ns2id) == -1) nodes.push({id: ns2id, label: f.destination, color: "#ddd", size: 1});

                var dir = f.property.substr(0, 1);
                if (dir === "R") {
                    var id = (s + f.destination).replace(/ /g, "_");
                    pos = edges.map(function (e) {
                        return e.id;
                    }).indexOf(id);
                    if (pos == -1) {
                        var obj = {id: id, source: s, target: f.destination, color:"#888",size:1, attributes: {property: f.property.substr(2)}};
                        edges.push(obj)
                    }
                }
                else {
                    var id = (f.destination + s).replace(/ /g, "_");
                    pos = edges.map(function (e) {
                        return e.id;
                    }).indexOf(id);
                    if (pos == -1) {
                        var obj = {id: id, source: f.destination, target: s, color:"#888",size:1, attributes: {property: f.property.substr(2)}};
                        edges.push(obj)
                    }
                }
            };
            //fin.push(data.associations.one[0].source);
            for (k in data.associations) {

                data.associations[k].forEach(function (e) {

                    console.log(e)
                    var source = e.source;

                    e.steps.forEach(function (f, j) {

                        computeEdges(f, source);

                        if (j > 0) {
                            source = f.destination;
                        }
                    })
                })
            }
            res.json({settings:set, edges: edges, nodes: nodes});
        }
    )
}


exports.associations = function (req, res) {

    var data = req.body;


    var urlstr = data.all ? 'articles/' + data.id + '/associations/serendipity/all/relevance/' + data.relevance + '/rarity/' + data.rarity : 'articles/' + data.id + '/associations/serendipity/relevance/' + data.relevance + '/rarity/' + data.rarity;
    if (data.top) urlstr += /top/ + data.top;

    request(
        {
            method: 'GET',
            url: baseUrl + urlstr,
            headers: headers
        },

        function (error, response, body) {
            var data = JSON.parse(body);
            res.json(data);
        }
    )
};


// Graph

exports.graph = function (req, res) {

    var data = req.body;
    console.log(data.degree)

    request(
        {
            method: 'GET',
            url: baseUrl + 'graph/article/' + data.article + '/source/' + data.source + '/target/' + data.target + '/degree/' + data.degree + '/metric/' + data.metric,
            headers: headers
        },

        function (error, response, body) {
            var data = JSON.parse(body);
            res.json(data);
        }
    )

};


exports.search = function (req, res) {

    var data = req.body;
    data['api-key'] = articleSearchApiKey;

    request(
        {
            method: 'GET',
            url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
            headers: headers,
            qs: data
        },

        function (error, response, body) {
            var data = JSON.parse(body);
            if (data.status == "OK")
                res.json(data.response.docs);
            else res.json({error: 'Error'})
        }
    )
};
