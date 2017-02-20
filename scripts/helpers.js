var Promise = require('bluebird');
var request = require('request');
var Twitter = require('twitter');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
// var keys = require('../api/apiKeys');

//============Twitter===========
var client = new Twitter({
  consumer_key: process.env.twitterKey || keys.twitterKey,
  consumer_secret: process.env.twitterSecret || keys.twitterSecret,
  access_token_key: process.env.twitterToken || keys.twitterToken,
  access_token_secret: process.env.twitterTokenSecret || keys.twitterTokenSecret
});

//========Watson Tone Analyzer=======
var tone_analyzer = new ToneAnalyzerV3({
  username: process.env.watsonUsername || keys.watsonUsername,
  password: process.env.watsonPass || keys.watsonPass,
  version_date: '2016-05-19'
});

var alchemyAPI = process.env.alchemyAPI || keys.alchemyAPI;

// ========Helper functions=======
var helpers = {
	getHighestToneScore: function(tones) {
	  var emotionTones = tones.document_tone.tone_categories[0].tones;
	  return emotionTones.reduce(function(tone1, tone2) {
	    return tone1.score > tone2.score ? tone1 : tone2;
	  });
	},
	isReply: function(tweet) {
	  if ( tweet.retweeted
	    || tweet.in_reply_to_status_id
	    || tweet.in_reply_to_status_id_str
	    || tweet.in_reply_to_user_id
	    || tweet.in_reply_to_user_id_str
	    || tweet.in_reply_to_screen_name ) {
	  return true	  	
	  }
	}
};

// ========API Helper functions=======
var apiHelpers = {
	getRelatedTerms: function(keyword) {
	  var relatedTerms = [];
	  var bingUrl = `https://api.cognitive.microsoft.com/bing/v5.0/search?q=${keyword}&count=5`;    
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
	        relatedTerms.push(jsonData.relatedSearches.value);
	        resolve(relatedTerms);
	      }
	    });
	  });
	},
	getTweets: function(keyword) {
		return new Promise(function(resolve, reject) {
			client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&lang=en&result_type=mixed&count=100`, 
			function(error, tweets, response) {	      
	      if(error) {
	        console.log(error);
	      } else {
	        tweets.statuses.filter(function(tweetObj) {	        		          
	          return helpers.isReply(tweetObj);
	        });	        
	        resolve(tweets.statuses);
	      }
    	});
		});
	},
	getTones: function(statuses) {
		var highestTone = [];
    var emotionObj  = {
      Sadness : 0,
      Anger   : 0,
      Disgust : 0,
      Fear    : 0,
      Joy     : 0
    };
    return new Promise(function(resolve,reject) {
    	statuses.forEach(function(tweet) {    		
    		tone_analyzer.tone({ text: tweet.text},
	        function(err, tones) {
	          if(err) {
	            console.log(err);
	          } else {
	          	var singleTone = helpers.getHighestToneScore(tones);
	            if(!emotionObj[singleTone.tone_name]){
	              emotionObj[singleTone.tone_name] = 1;
	            } else {
	              emotionObj[singleTone.tone_name]++;
	            }
	          }		    		
			      resolve(emotionObj);
	      	});
    	});
    });
  },
  getNews: function(keyword) {
  	var encodedKeyword = encodeURI(keyword);
  	const url = "https://gateway-a.watsonplatform.net/calls/data/GetNews?" +
  		"outputMode=json&" + 
  		"start=now-1d&" +
  		"end=now&" +
  		"count=5&" +
  		"q.enriched.url.enrichedTitle.keywords.keyword.text=" + keyword + "&" +
  		"return=enriched.url.url,enriched.url.title,enriched.url.text&" +
  		"apikey=" + alchemyAPI;

  	let news;
  	return new Promise(function(resolve, reject) {
	    request(url, function (error, response, body) {
	      var jsonData = JSON.parse(body);
	      console.log(jsonData.result);  
	      if (!jsonData.result.docs) {
	      	reject("Sorry, we're unable to find any news articles about " + keyword);
	      }
	      if (!error && response.statusCode === 200) {
	        news = jsonData.result.docs;
	        resolve(news);
	      }
	    });
	  });
  }
}

module.exports = {
	helpers: helpers,
	apiHelpers: apiHelpers
}