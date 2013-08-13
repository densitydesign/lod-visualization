var request = require('request'),
    qs = require('querystring'),
    headers = { 'Content-type': 'application/json' },
    articleSearchApiKey = '42b6b35b812acec99c722f368ead87bf:6:65720321',
    semanticApiKey = '78d85c4fe3261cde922f0602a729605b:11:65720321';


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