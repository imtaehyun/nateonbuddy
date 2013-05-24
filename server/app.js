var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , config = require('./config').config
  , OAuth = require('oauth').OAuth
  , read = require('read')
  , XmlDocument = require('xmldoc').XmlDocument;
  
// ========================
// Nateon OAuth Setting
// ========================

var _requestToken = "",
    _requestTokenSecret = "",
    _accessToken = "",
    _accessTokenSecret = "",
    isAuth = false;
    
// Service Provider와 통신할 인터페이스를 갖고 있는 객체 생성.
var oauth = new OAuth(config.requestTokenUrl, config.accessTokenUrl,
    config.consumerKey, config.consumerSecret,
	"1.0", config.callbackUrl, "HMAC-SHA1");

// 2. Request Token 요청
// oauth.getOAuthRequestToken(function(err, requestToken, requestTokenSecret, results) {
//     if (err) {
//         console.error(err);
// 	} else {
//         // 3. 사용자 인증(Authentication) 및 권한 위임(Authorization)
// 		console.log(config.authorizeUrl + "?oauth_token=" + requestToken);
// 		console.log("웹브라우저에서 위 URL로 가서 인증코드를 얻고 입력하세요.");
        
//         // 4. verifier 입력 받기
//     	read({prompt: "verifier: "}, function(err, verifier) {
// 			if(err) {
// 				console.error(err);
// 			} else {

// 				// 5. Request Token을 AccessToken 으로 교환
				// oauth.getOAuthAccessToken(requestToken, requestTokenSecret, verifier, function(err, accessToken, accessTokenSecret, result) {
				// 	if (err) {
				// 		console.error(err);
				// 	} else {
				// 		console.log("Access Token = " + accessToken);
				// 		console.log("Access Token Secret = " + accessTokenSecret);
    //                     _accessToken = accessToken;
    //                     _accessTokenSecret = accessTokenSecret;
				// 	}
				// });
// 			}
// 		});
// 	}
// });
 
var sendNote = function(ref, body, callback) {
    console.log("accessToken: " + _accessToken);
    console.log("accessTokenSecret: " + _accessTokenSecret);
    // 6. 보호된 자원에 접근
	var body = {
        "body": body,
        "ref": ref
    };
	oauth.post(config.resourceUrl, _accessToken, _accessTokenSecret, body, null, function(err, data, res) {
		if(err) {
			console.error(err);
		} else {
            // console.log(data);
            var results = new XmlDocument(data);
            console.log(results);
            
            var header = results.childNamed('header');
            var rcode = header.childNamed('rcode');
            // var rmsg = results.childNamed('rmsg');
            console.log(rcode.val);
            console.log(results.childNamed('header').childNamed('rcode').val);
            // console.log(rmsg.val);
            callback(results.childNamed('header').childNamed('rcode').val);
		}
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
        console.log(isAuth);
        if (isAuth === true) {
            res.redirect('/send');
        }
        oauth.getOAuthRequestToken(function(err, requestToken, requestTokenSecret, results) {
            if (err) {
                res.send(err);
                console.error(err);
            } else {
                _requestToken = requestToken;
                _requestTokenSecret = requestTokenSecret;
                var innerHTML = '<p><a href="' + config.authorizeUrl + "?oauth_token=" + requestToken + '" target="_blank">' + config.authorizeUrl + "?oauth_token=" + requestToken + '</a></p>'
                                + '<form method="post" action="/admin">'
                                + '<input type="text" name="token"/>'
                                + '<input type="submit" value="Submit"/>'
                                + '</form>';
                res.send(innerHTML);
            }
        });
    })
    .post('/admin', function (req, res, next) {
        console.log(req.body.token);
        oauth.getOAuthAccessToken(_requestToken, _requestTokenSecret, req.body.token, function(err, accessToken, accessTokenSecret, result) {
			if (err) {
                res.send(err);
				console.error(err);
			} else {
				console.log("Access Token = " + accessToken);
				console.log("Access Token Secret = " + accessTokenSecret);
                _accessToken = accessToken;
                _accessTokenSecret = accessTokenSecret;
                isAuth = true;
                res.redirect('/send');
			}
		});
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
        sendNote(req.body.ref, req.body.body, function(result) {
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
