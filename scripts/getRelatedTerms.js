var keys = require('../api/apiKeys');
var request  = require('request');
//========Call Bing for related search terms=======
var getRelatedTerms = function(keyword) {
  var relatedTerms = [];
  var bingUrl = `https://api.cognitive.microsoft.com/bing/v5.0/search?q=${keyword}`;    
  var options = {
    url: bingUrl,
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.bing || keys.bing
    }
  }
  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      var jsonData = JSON.parse(body);    
      if (!error && response.statusCode === 200) {
        console.log("able to push to relatedTerms");
        relatedTerms.push(jsonData.relatedSearches.value);
        resolve(relatedTerms);
      }
    });
  });
};

module.exports = getRelatedTerms;