var express  = require('express'),
    Twitter  = require('twitter'),
    Promise  = require('bluebird'),
    watson   = require('watson-developer-cloud'),
    bodyParser = require('body-parser'), // middleware to get data from forms. Express can't do this.
    ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3'),
    keys      = require('./api/apiKeys'),
    Async      = require('async'),
    app      = express();


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
  consumer_key: keys.twitterKey,
  consumer_secret: keys.twitterSecret,
  access_token_key: keys.twitterToken,
  access_token_secret: keys.twitterTokenSecret
});

//========Watson Tone Analyzer=======
var tone_analyzer = new ToneAnalyzerV3({
  username: keys.watsonUsername,
  password: keys.watsonPass,
  version_date: '2016-05-19'
});

//========Helper functions=======
var getHighestToneScore = function(tones) {
  var emotionTones = tones.document_tone.tone_categories[0].tones;  
  return emotionTones.reduce(function(tone1, tone2) {
    return tone1.score > tone2.score ? tone1 : tone2;
  });
}

var getTextTweets = function(arrayOfTweets) {
  return arrayOfTweets.statuses.map(function(tweetData) {
    return tweetData.text;
  });
}

var arrayOfTweets = function(messages) {
  return messages.map(function(messagesArray) {
    return messagesArray.text;
  });
}

var getToneData = function(scoreData) {
  console.log("Score Data from getToneData:", scoreData);
  return scoreData;
}

//========Call API's=======
var getTweetData = function(keyword) {
  return new Promise(function(resolve, reject) {
    client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=10`, function(error, tweets, response) {
      if(error) console.log(error);      
      resolve(tweets);   
    });
  });
};

app.post('/searchKeyword', function(req, res){
  var keyword = req.body.keyword;



  client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=100`, function(error, tweets, response) {
    var highestTone = [];

    if(error) {
      console.log(error);
    } else {


        Async.each(tweets.statuses, function(tweet, callback){
          tone_analyzer.tone({ text: tweet.text},
          function(err, tone){
            if(err){
              console.log(err);
            } else {
               var tone = tone.document_tone.tone_categories[0].tones;
               highestTone.push([tweet.text,
                   tone.reduce(function(tone1, tone2){
                   if(tone1.score > tone2.score){
                    return tone1;
                   } else {
                   return tone2;
                  }
               }), tweet.user.name]);
               callback();
            }
          });
        }, function(err){
          if(err){
            console.log(err);
          } else {
            console.log(highestTone);
            res.render('test', {highestTone: highestTone});
          }
        });
      }

  }); // end Twitter Call
});


//   getTweetData(keyword)
//   .then(function(data) {
//     var scoreData = arrayOfTweets(data.statuses); 
//     // use scoreData to pass into toneAnalyzer
//     // use toneAnalyzer to get tones
//     // res.send data from toneAnalyzer
//     res.send(scoreData);
//   }).catch(function(err) {
//     console.log(err);
//   });
// });


app.listen('5000', function(){
  console.log('Running');
});
