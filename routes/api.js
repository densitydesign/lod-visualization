var request = require('request'),
    qs = require('querystring'),
    headers = { 'Content-type': 'application/json' },
    articleSearchApiKey = '42b6b35b812acec99c722f368ead87bf:6:65720321',
    semanticApiKey = '78d85c4fe3261cde922f0602a729605b:11:65720321',
//baseUrl = 'http://jeeg.siti.disco.unimib.it:82/web/app_dev.php/api/'
//articles/2
    //baseUrl = 'http://jeeg.siti.disco.unimib.it/web/app_dev.php/api/'
    baseUrl="http://dacena.disco.unimib.it/app.php/api/"

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
		
	    if(error) console.warn(error);
	    else {	
            var data = JSON.parse(body);
            res.json(data);
	    }
            console.log(body,response.request.uri);
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
            if(error && error !==null) {

            }
            try {
                var data = JSON.parse(body);
            }
            catch(err){
                console.log(err,body,response.request.uri);
            }
            res.json(data);
        }
    )

};


exports.click = function (req,res) {

    var data = req.body;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var url =  baseUrl+ 'action_log';

    request.post({url:url, ip:ip, article_id : parseInt(data.article), action: data.action}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('post failed:', err);
        }

    });
}


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
    var urlstr = 'articles/' + data.id + '/length/all/associations';
    request(
        {
            method: 'GET',
            url: baseUrl + urlstr,
            headers: headers
        },

        function (error, response, body) {
            console.log("complete network response!!", body)

            var obj = computePaths([1,2,3],body);
            console.log("obj",obj);
            res.json(obj);
        }
    )
}


exports.abstract = function(req,res) {

    var data = req.body;

    var url = baseUrl + "abstract/dbpedia/entity/"+data.entity
    res.header("Content-Type", "application/json; charset=utf-8");

    headers = {
        "Content-Type":"application/json; charset=utf-8"
    };


    request(
        {
            method: 'GET',
            url:url,
            headers: headers
        },

        function (error, response, body) {

            var obj = JSON.parse(body);
            res.json(obj);

        }
    )


}

exports.associations = function (req, res) {

    var data = req.body;
    ///articles/{articleId}/associations/serendipity/relevance/{relevance}/rarity/{rarity}/top/{top}

    var pathsArr = 'paths' in data ? data.paths : [1,2,3];

    pathsArr.sort();

    var urlstr ='articles/' + data.id + '/associations/serendipity/all/relevance/' + parseInt(data.relevance*100) + '/rarity/' + parseInt(data.rarity*100);
    if (data.top) urlstr += /top/ + data.top;

   // console.log(baseUrl + urlstr);

    request(
        {
            method: 'GET',
            url: baseUrl + urlstr,
            headers: headers
        },

        function (error, response, body) {
            console.log(body)
            console.log(response.request.uri);
            //console.log(body)
            var obj = computePaths(pathsArr,body)
            res.json(obj);
        }
    )
};


// Graph

function computePaths(paths,body)  {




var data = JSON.parse(body);

            var nodes = [];
            var edges = [];
            var terms = [];

            var computeEdges = function (f, s) {

                var ns1id = s.replace(/ /g, "_");
                var ns2id = f.destination.replace(/ /g, "_");

                if (nodes.map(function (e) {
                    return e.id;
                }).indexOf(ns1id) == -1) nodes.push({id: ns1id, label: s, color: "#ddd", size: 1,attributes:{}});
                if (nodes.map(function (e) {
                    return e.id;
                }).indexOf(ns2id) == -1) nodes.push({id: ns2id, label: f.destination, color: "#ddd", size: 1,attributes:{}});

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



            for (k in data.associations) {

                if (data.associations[k].length) {

                    data.associations[k].forEach(function (e) {


                        if(paths.indexOf(e.steps.length)>-1) {


                            var source = e.source;
                            if (terms.indexOf(source) == -1) terms.push(source);

                            e.steps.forEach(function (f, j) {

                                if (j == e.steps.length - 1 && terms.indexOf(f.destination) == -1) terms.push(f.destination);
                                computeEdges(f, source);
                                source = f.destination;
                            })
                        }
                    })
                }

            }

            return {original: data, terms: terms, edges: edges, nodes: nodes}

}
