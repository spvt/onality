var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 5000;

//========SET VIEW ENGINE=======
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}) )
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

//========GET REQUEST FOR HOMEPAGE=======
//connect on routes
require('./server/routes.js')(app)

app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});
