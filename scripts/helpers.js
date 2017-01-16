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

module.exports = helpers;