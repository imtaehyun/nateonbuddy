var cheerio = require('cheerio'),
    request = require('request');
    
var $;
request('http://www.kma.go.kr/weather/lifenindustry/sevice_rss.jsp', function(error, res, body) {
    if (!error && res.statusCode == 200) {
        console.log(res.statusCode);
        console.log(body);
        $ = cheerio.load(body);
        console.log('000' + $.html());
    } else {
        console.error(error);
    }
    
});



