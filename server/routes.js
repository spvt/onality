var controller = require('./controller.js')

function router(app) {  
  app.get('/', function(req, res) {
	  res.render('index.ejs');
	});

  app.post('/searchresults', controller.searchResults)
}

module.exports = router