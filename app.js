
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
  client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=10`, function(error, tweets, response) {
    if(error) console.log(error);

app.get('/', function(req, res){
  client.get('https://api.twitter.com/1.1/search/tweets.json?q=macbook&count=10', function(error, tweets, response) {
  if(error) console.log(error);

  console.log(tweets.statuses[0].text);
  //console.log(response);  // Raw response object.
  tone_analyzer.tone({ text: tweets.statuses[0].text },
  function(err, tone) {
    if (err)
      console.log(err);
    else
      console.log(JSON.stringify(tone, null, 2));
});
  res.send(tweets.statuses[0].text);
});
});


app.listen('5000', function(){
  console.log('Running');
});
