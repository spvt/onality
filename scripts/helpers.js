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
	}
};

module.exports = helpers;
