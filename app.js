
var express  = require('express'),
    Twitter  = require('twitter'),
    watson   = require('watson-developer-cloud'),
    bodyParser = require('body-parser'), // middleware to get data from forms. Express can't do this.
    ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3'),
    keys      = require('./api/apiKeys'),
    app      = express();


//========SET VIEW ENGINE=======
app.set('view engine', 'ejs');
// urlencoded tells bodyParser to extract data from form element
// middleware to read JSON data
app.use(bodyParser.urlencoded({extended: true}) )
app.use(bodyParser.json());

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

//========Call API's=======
app.post('/searchKeyword', function(req, res){
  var keyword = req.body.keyword;


  client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=100`, function(error, tweets, response) {
    var highestTone = [];

    if(error) {
      console.log(error);
    } else {
      tweets.statuses.forEach(function(tweet){

        tone_analyzer.tone({ text: tweet.text },
         function(err, tone) {
          if (err){
           console.log(err);
          } else{
          //console.log(JSON.stringify(tone, null, 2));

          var tone = tone.document_tone.tone_categories[0].tones;

          highestTone.push([tweet.text,
           tone.reduce(function(tone1, tone2){
           if(tone1.score > tone2.score){
            return tone1;
           } else {
           return tone2;
          }
       })]);

           }
         });
      }); //===== End Looping through each tweet //
    }

    console.log(highestTone);
    setTimeout(function(){
        res.render('test', {highestTone: highestTone});
    }, 2000);

  }); // end Twitter Call
});


app.listen('5000', function(){
  console.log('Running');
});
