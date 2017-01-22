var express  = require('express'),
    Twitter  = require('twitter'),
    Promise  = require('bluebird'),
    watson   = require('watson-developer-cloud'),
    request  = require('request');
    bodyParser = require('body-parser'), // middleware to get data from forms. Express can't do this.
    ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3'),
    alchemyDataNews = require('watson-developer-cloud/alchemy-data-news/v1'),
    keys     = require('./api/apiKeys'),
    Async    = require('async'),
    colors   = require('colors'),
    helpers  = require('./scripts/helpers');
    app      = express();
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



//========Call API's=======
// var getTweetData = function(keyword) {
//   return new Promise(function(resolve, reject) {
//     client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=10`, function(error, tweets, response) {
//       if(error) console.log(error);
//       resolve(tweets);
//     });
//   });
// };

app.get('/news', function(req, res){
res.render('test');
});

app.post('/searchresults', function(req, res){
  var keyword = req.body.keyword;

  //========Call Twitter for real time opinions on search terms=======
  client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&lang=en&result_type=mixed&count=100`, function(error, tweets, response) {
    var highestTone = [];
    var emotionObj  = {
      Sadness : 0,
      Anger   : 0,
      Disgust : 0,
      Fear    : 0,
      Joy     : 0
    };
    var relatedTerms = [];
    if(error) {
      console.log(error);
    } else {
      tweets.statuses.filter(function(tweetObj) {
        // console.log("Filter is working on:", tweetObj);
        return helpers.isReply(tweetObj);
      });    

      //========Call Watson to get sentiments of Twitter data=======
      Async.each(tweets.statuses, function(tweet, callback){
        // console.log(tweet.text.bold);
        tone_analyzer.tone({ text: tweet.text},
        function(err, tone){
          if(err){
            console.log(err);
          } else {
            //========Call Bing for related search terms=======
            var bingUrl = `https://api.cognitive.microsoft.com/bing/v5.0/search?q=${keyword}`;    
            var options = {
              url: bingUrl,
              method: 'GET',
              headers: {
                'Ocp-Apim-Subscription-Key': process.env.bing || keys.bing
              }
            };
            
            request(options, function (error, response, body) {
              var jsonData = JSON.parse(body);    
              if (!error && response.statusCode === 200) {  
                relatedTerms.push(jsonData.relatedSearches.value);
              }
            });            

            var tone = tone.document_tone.tone_categories[0].tones;
            var singleTone = tone.reduce(function(tone1, tone2){
              return tone1.score > tone2.score ? tone1 : tone2;
            });

             //console.log(singleTone.tone_name);
            //  highestTone.push([tweet.text,
            //      tone.reduce(function(tone1, tone2){
            //      if(tone1.score > tone2.score){
            //       return tone1;
            //      } else {
            //      return tone2;
            //     }
            //  }), tweet.user.name]);
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
          // console.log("Bing data:", relatedTerms);
          res.render('searchresults', {emotionObj: emotionObj, keyword : keyword, relatedTerms: relatedTerms, url: process.env.alchemyAPI2 || keys.alchemyAPI2});
        }
      });  //===end ASYNC Each
    }
  }); // end Twitter Call
}); // end post Call

app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});
