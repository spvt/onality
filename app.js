var express  = require('express'),
    Twitter  = require('twitter'),
    Promise  = require('bluebird'),
    watson   = require('watson-developer-cloud'),
    request  = require('request'),
    bodyParser = require('body-parser'),
    ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3'),
    alchemyDataNews = require('watson-developer-cloud/alchemy-data-news/v1'),
    keys     = require('./api/apiKeys'),
    Async    = require('async'),
    tagCloud = require('tag-cloud'),
    helpers  = require('./scripts/helpers').helpers,
    apiHelpers  = require('./scripts/helpers').apiHelpers,
    app      = express(),
    port     = process.env.PORT || 5000;


//========SET VIEW ENGINE=======
app.set('view engine', 'ejs');

// urlencoded tells bodyParser to extract data from form element
// middleware to read JSON data
app.use(bodyParser.urlencoded({extended: true}) )
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

//========GET REQUEST FOR HOMEPAGE=======
app.get('/', function(req, res) {
  res.render('index.ejs');
});

// //============Twitter===========
// var client = new Twitter({
//   consumer_key: process.env.twitterKey || keys.twitterKey,
//   consumer_secret: process.env.twitterSecret || keys.twitterSecret,
//   access_token_key: process.env.twitterToken || keys.twitterToken,
//   access_token_secret: process.env.twitterTokenSecret || keys.twitterTokenSecret
// });

//========Watson Tone Analyzer=======
var tone_analyzer = new ToneAnalyzerV3({
  username: process.env.watsonUsername || keys.watsonUsername,
  password: process.env.watsonPass || keys.watsonPass,
  version_date: '2016-05-19'
});

app.get('/news', function(req, res){
  res.render('test');
});

Promise.promisifyAll(tagCloud);

app.post('/searchresults', function(req, res){
  var keyword = req.body.keyword;
  var spanTags = apiHelpers.getRelatedTerms(keyword).then(function(terms) {
    var tags = terms[0].map(function(results) {
      var random = Math.floor(Math.random() * terms[0].length)
      return {tagName: results.text, count: random};
    });    
    return tagCloud.tagCloudAsync(tags, {
      randomize: false
    });
  });
  
  
  apiHelpers.getTweets(keyword).then(function(statuses) {
    //========Call Watson to get sentiments of Twitter data=======
      var highestTone = [];
      var emotionObj  = {
        Sadness : 0,
        Anger   : 0,
        Disgust : 0,
        Fear    : 0,
        Joy     : 0
      };
        Async.each(statuses, function(tweet, callback) {
          tone_analyzer.tone({ text: tweet.text},
            function(err, tone) {
              if(err){
                console.log(err);
              } else {
                var tone = tone.document_tone.tone_categories[0].tones;
                var singleTone = tone.reduce(function(tone1, tone2){
                  return tone1.score > tone2.score ? tone1 : tone2;
                });

                if(!emotionObj[singleTone.tone_name]){
                  emotionObj[singleTone.tone_name] = 1;
                } else {
                  emotionObj[singleTone.tone_name]++;
                }
                callback();
              }
          });
        }, function(err){
          if(err){
            console.log(err);
          } else {
            // console.log("Bing data:", spanTags);
            res.render('searchresults', {emotionObj: emotionObj, keyword : keyword, spanTags: spanTags, url: process.env.alchemyAPI2 || keys.alchemyAPI2});
          }
        });  //===end ASYNC Each
  })
}); // end post Call

app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});
