var request = require('request'),
    qs = require('querystring'),
    headers = { 'Content-type': 'application/json' },
    articleSearchApiKey = '42b6b35b812acec99c722f368ead87bf:6:65720321',
    semanticApiKey = '78d85c4fe3261cde922f0602a729605b:11:65720321',
    //baseUrl = 'http://jeeg.siti.disco.unimib.it:82/web/app_dev.php/api/'
    baseUrl = 'http://jeeg.siti.disco.unimib.it:85/web/app_dev.php/neo4j/api/'


// Articles list

exports.articles = function (req, res) {

  var data = req.body;

  request(

    {
      method : 'GET',
      url : baseUrl + 'articles',
      headers : headers,
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
      method : 'GET',
      url : baseUrl + 'articles/' + data.id,
      headers : headers
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
      method : 'GET',
      url : baseUrl + 'graph/article/' + data.article + '/source/' + data.source + '/target/' + data.target + '/degree/' + data.degree,
      headers : headers
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
  		method : 'GET',
  		url : 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
  		headers : headers,
			qs : data
  	},

  	function (error, response, body) {
      var data = JSON.parse(body);
      if (data.status == "OK")
    	 res.json(data.response.docs);
      else res.json({error:'Error'})
  	}
  )
};