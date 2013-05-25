var express = require('express')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs')
  , config = require('./config').config
  , querystring = require('querystring');
  
// ========================
// Nateon OAuth Setting
// ========================

var isAuth = false;

function postJSON(options, data, onResult)
{
    console.log("rest::postJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            console.log('end: ' + output);
            var obj = eval("(" + output + ")");
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log('error: ' + err.message);
    });

    req.write(querystring.stringify(data));
    req.end();
};


//https://apis.skplanetx.com/nateon/notes?version={version}
var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'appkey': config.appKey
};
var options = {
    host : 'apis.skplanetx.com',
    port : 443,
    path : '/nateon/notes?version=1', // the rest of the url with parameters if needed
    method : 'POST', // do GET
    headers: headers
};

var sendNote = function(receivers, message, confirm, callback) {
    // console.log("accessToken: " + _accessToken);
    // console.log("accessTokenSecret: " + _accessTokenSecret);
    // 6. 보호된 자원에 접근
	var body = {
        "receivers": receivers,
        "message": message,
        "confirm": confirm
    };
	// options.body = body;
    console.log(body);
    console.log('headers' + JSON.stringify(options.headers));
    postJSON(options, body, function(statusCode, result)
    {
        console.log('statusCode:' + statusCode);
        console.log('result:' + result);
        // The service will need the full objects for processing in the service
        // for (index in result.results)
        // {
        //     var student = result.results[index];
        //     console.log('student: ' + student.name);
        // }

        // res.statusCode = statusCode;
        // res.send(result);
    });
};

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
        var authUrl = 'https://oneid.skplanetx.com/oauth/authorize?client_id=' + config.clientId 
                    + '&response_type=token'
                    + '&scope=' + config.scope
                    + '&redirect_uri=' + config.redirectUri;
        res.redirect(authUrl);
    })
    .get('/auth', function (req, res, next) {
        //https://[redirect_uri]#access_token=74cfa5c6-be9e-42c9-b79a-9e4a6ea8a12c &expires_in=43199
        //https://[redirect_uri]?error=access_denied&error_description=User denied authorization of the authorization code
        var error = req.query['error'];
        console.log(error);
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
        headers.access_token = req.body.access_token;
        res.send('success');
    })
    .get('/send', function (req, res, next) {
        var innerHTML = 'You can send note now!!'
                        +'<form method="post" action="/api/send">'
                        + '<input type="text" name="ref"/>'
                        + '<input type="text" name="body"/>'
                        + '<input type="submit" value="submit"/>'
                        + '</form>';
        res.send(innerHTML);
    })
    // Get all programs
    .post('/api/send', function (req, res, next) {
        console.log(req.body.ref);
        console.log(req.body.body)
        sendNote(req.body.ref, req.body.body, 'Y', function(result) {
            console.log(result);
            var innerHTML = '<script type="text/javascript">'
                            + 'alert("' + result + '");'
                            + 'location.href = "/send";'
                            + '</script>';
            res.send(innerHTML);
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
