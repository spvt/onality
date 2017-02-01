var express  = require('express'),
    Promise  = require('bluebird'),
    watson   = require('watson-developer-cloud'),
    alchemyDataNews = require('watson-developer-cloud/alchemy-data-news/v1'),
    bodyParser = require('body-parser'),
    tagCloud = require('tag-cloud'),
    helpers  = require('./scripts/helpers').helpers,
    apiHelpers  = require('./scripts/helpers').apiHelpers,
    keys     = require('./api/apiKeys');
    app      = express(),
    port     = process.env.PORT || 5000;


//========SET VIEW ENGINE=======
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}) )
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

//========GET REQUEST FOR HOMEPAGE=======
app.get('/', function(req, res) {
  res.render('index.ejs');
});

Promise.promisifyAll(tagCloud);

app.post('/searchresults', function(req, res) {
  console.log("Checking the link value:",req.body);
  var keyword = req.body.keyword;
  var spanTags = apiHelpers.getRelatedTerms(keyword).then(function(terms) {
    return terms[0].map(function(result){
      return result.text;
    });;
  });

  apiHelpers.getTweets(keyword).then(function(statuses) {
    var emotionObj = apiHelpers.getTones(statuses);
      return emotionObj;
    }).then(function(emotionObj) {
        res.render('searchresults', {
          emotionObj: emotionObj,
          keyword : keyword,
          spanTags: spanTags,
          url: process.env.alchemyAPI2 || keys.alchemyAPI2
        });
      });
}); // end post Call

app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});
