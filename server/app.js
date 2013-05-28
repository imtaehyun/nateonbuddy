var express = require('express')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs')
  // , config = require('./config').config
  , nateon = require('./nateon').nateon
  , weather = require('./weather')
  , querystring = require('querystring');
 
// ========================
// Server
// ========================

// Setup the server
var app = 
    express()
        .set('port', process.env.PORT || 3000)
        // The route base is ../app
        .set('views', path.resolve(__dirname, '../app'))
        // Render html by just spitting the file out
        .set('view engine', 'html')
        .engine('html', function (path, options, fn) {
            if ('function' == typeof options) {
                fn = options, options = {};
            }
            fs.readFile(path, 'utf8', fn);
        })
        .use(express.favicon())
        .use(express.bodyParser())
        .use(express.logger('dev'))
        // Serve the app folder statically
        .use(express.static(path.resolve(__dirname, '../app')));

// ========================
// API
// ========================

app
    .get('/admin', function (req, res, next) {
        res.redirect(nateon.auth_url);
    })
    .get('/auth', function (req, res, next) {
        //https://[redirect_uri]#access_token=74cfa5c6-be9e-42c9-b79a-9e4a6ea8a12c &expires_in=43199
        //https://[redirect_uri]?error=access_denied&error_description=User denied authorization of the authorization code
        var error = req.query['error'];
        
        if (error !== undefined) {
            // authorize error
            return console.error(error + ': ' + req.query['error_description']);
        } else {
            // authorize success
            res.render('auth.html');
        }
    })
    .post('/auth', function (req, res, next) {
        console.log(req.body.access_token);
        nateon.authorize(req.body.access_token);
        res.send('success');
    })
    .get('/sendNote', function (req, res, next) {
        res.render('sendNote.html');
    })
    .get('/add', function (req, res, next) {
        res.render('addBuddy.html');
    })
    .post('/api/send', function (req, res, next) {
        console.log(req.body.ref);
        console.log(req.body.body)
        nateon.sendNote(req.body.ref, req.body.body, 'Y', function(result) {
            console.log(result);
            var innerHTML = '<script type="text/javascript">'
                            + 'alert("' + result + '");'
                            + 'location.href = "/sendNote";'
                            + '</script>';
            res.send(innerHTML);
        });
    })
    .post('/api/add', function (req, res, next) {
        nateon.addBuddy(req.body.nateId, function(result) {
            if (result) res.send('친구 추가 완료');
            else res.send('친구 추가 실패');
        });
    });
    
// ========================
// App
// ========================

app
    .get('*', function (req, res) {
        res.render('index.html', { layout: null });
    });
    
app
    .use(app.router)
    .use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// ========================
// Go, go, go!
// ========================

http.createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
// var sendWeather = function () {
//     weather.getWeatherData('1120069000', function(data) {
//         sendNote('shocklance@nate.com', data, 'Y', function(result) {
//             console.log('result');
//         })
//     });
// };
// setInterval(function() { sendWeather(); }, 10000);