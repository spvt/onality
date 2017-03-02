var apiRequestHandlers = require('./apiRequestHandlers.js')

module.exports = {
	searchResults: function(req, res) {
	  // console.log("Checking the link value:",req.body);
	  var keyword = req.body.keyword;
	  var spanTags = apiRequestHandlers.getRelatedTerms(keyword)
	  	.then(function(terms) {
		    return terms[0].map(function(result){
		      return result.text;
		    });
		  })
		  .catch(function(err) {
		  	return err;
		  });
	  var news = apiRequestHandlers.getNews(keyword)
	  	.then(function(news) {
		    return news;
		  })
		  .catch(function(err) {
		    return err;
		  });
	  
	  apiRequestHandlers.getTweets(keyword)
	  	.then(function(statuses) {
		    // console.log(statuses)
		    var emotionObj = apiRequestHandlers.getTones(statuses);    
		    return emotionObj;
		  })
	  	.then(function(emotionObj) {
        res.render('searchresults', {
          emotionObj: emotionObj,
          keyword : keyword,
          spanTags: spanTags,
          news: news          
        });
      });
	} // end post Call
}