var config = require('./config').config
    , rest = require('./rest');

exports.nateon = {
    isAuthorized: false,
    access_token: null,
    options: null,
    auth_url: 'https://oneid.skplanetx.com/oauth/authorize?client_id=' + config.clientId 
            + '&response_type=token'
            + '&scope=' + config.scope
            + '&redirect_uri=' + config.redirectUri,
    authorize: function(access_token) {
        this.access_token = access_token;
        this.options = {
            host : 'apis.skplanetx.com',
            port : 443,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'appkey': config.appKey,
                'access_token': this.access_token
            }
        };
        this.isAuthorized = true;
    },
    //쪽지 발송
    sendNote: function(receivers, message, confirm, callback) {
        if (this.isAuthorized === false) {
            console.error('Unauthorized Access');
            return false;
        }
        
        var options = this.options;
        options.path = '/nateon/notes?version=1';
        
        var body = {
            "receivers": receivers, //쪽지를 수신할 사용자의 ID
            "message": message,     //쪽지 내용, 2000자를 초과 불가
            "confirm": confirm      //쪽지 수신 확인 여부 (Y: 수신 확인, N: 수신 확인 안함)
        };
        console.log(options);
        console.log(body);
        rest.postJSON(options, body, function(statusCode, result) {
            if (statusCode != 200 && statusCode != 204) {
                //오류
                console.error('[Error][sendNote][' + statusCode + ']');
                console.error(JSON.stringify(result));
                return false;
            } else {
                //발신성공
                console.log('[Success][sendNote]');
                console.log(JSON.stringify(result));
                return true;
            }
        });
    },
    //친구추가
    addBuddy: function(nateId, callback) {
        if (this.isAuthorized === false) {
            console.error('Unauthorized Access');
            return false;
        }
        var options = this.options;
        options.path = '/nateon/buddies?version=1';
        
        var body = {
            nateIds: nateId,
            message: '네이트온 친구입니다. 앞으로 고객님의 도우미가 되겠습니다.',
            groupid: 0
        };
        
        rest.postJSON(options, body, function(statusCode, result)
        {
            if (statusCode != 201) {
                //오류
                console.error('[Error][sendNote][' + statusCode + ']');
                console.error(JSON.stringify(result));
                return false;
            } else {
                //추가성공
                console.log('[Success][sendNote]');
                console.log(JSON.stringify(result));
                return true;
            }
        });
    },
    //읽지않은 쪽지 개수 조회
    unreadNote: function(callback) {
        if (this.isAuthorized === false) {
            console.error('Unauthorized Access');
            return false;
        }
        var options = this.options;
        options.path = '/nateon/notes/unread/counts?version=1';
        
        rest.postJSON(options, null, function(statusCode, result)
        {
            if (statusCode != 200) {
                //오류
                console.error('[Error][sendNote][' + statusCode + ']');
                console.error(JSON.stringify(result));
                return false;
            } else {
                //추가성공
                console.log('[Success][sendNote]');
                console.log(JSON.stringify(result));
                return true;
            }
        });
    }
}