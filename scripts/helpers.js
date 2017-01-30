var Promise = require('bluebird');
var request = require('request');
var keys = require('../api/apiKeys');

// ========Helper functions=======
var helpers = {
	getHighestToneScore: function(tones) {
	  var emotionTones = tones.document_tone.tone_categories[0].tones;
	  return emotionTones.reduce(function(tone1, tone2) {
	    return tone1.score > tone2.score ? tone1 : tone2;
	  });
	},
	getTweets: function(arrayOfTweets) {
	  return arrayOfTweets.map(function(tweetData) {
	    return tweetData.text;
	  });
	},
	isReply(tweet) {
	  if ( tweet.retweeted_status
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
	}
}

module.exports = {
	helpers: helpers,
	apiHelpers: apiHelpers
}