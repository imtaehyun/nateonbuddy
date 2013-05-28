var http = require('http'),
    request = require('request'),
    parser = require('xml2json');

var user = {
    nezz: {
        locCode: '1120069000'
    }
};

var config = {
    url: {
        location: 'http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone='
    }
};
// convert xml to json
var xml2json = function(xml) {
    var options = {
        object: true,
        reversible: false,
        coerce: true,
        sanitize: false,
        trim: true,
        arrayNotation: false
    };
    return parser.toJson(xml, options);
};

// get xml data from url
var getXML = function(locCode, callback) {
    console.log(config.url.location + locCode);
    request(config.url.location + locCode, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(xml2json(body));
        }
    });
};
var makeString = function (locCode, callback) {
    var innerHTML = '';
    getXML(locCode, function(json) {
        var item = json.rss.channel.item;
        var data = item.description.body.data;
        var time = item.description.header.tm.toString();
        innerHTML += time.substring(0,4) + '년' + time.substring(4,6) + '월' + time.substring(6,8) + '일\n';
        innerHTML += item.category + ' 날씨입니다\n';
        // console.log(item.description.body.data);
        for (var i = 0; i<data.length/2; i++) {
            innerHTML += data[i].hour + '시 ';
            innerHTML += data[i].temp + '도 ';
            innerHTML += '/' + data[i].wfKor + '/\n';
        }
        callback(innerHTML);
    });    
}

// (user[nezz].locCode);
exports.getWeatherData = function(locCode, callback) {
    makeString(locCode, function(innerHTML) {
        callback(innerHTML);
    });
};

// getWeatherData(user['nezz'].locCode);