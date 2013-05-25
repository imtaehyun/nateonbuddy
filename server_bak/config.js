// 1. URL 및 Consumer 정보 설정
var config = {
    requestTokenUrl: "https://oauth.nate.com/OAuth/GetRequestToken/V1a",
	authorizeUrl: "https://oauth.nate.com/OAuth/Authorize/V1a",
	accessTokenUrl: "https://oauth.nate.com/OAuth/GetAccessToken/V1a",
	consumerKey: "0725cfa2a9c5e7aa48c5766691930e6d050400b5b",
	consumerSecret: "5c6b3ac5109589436808543c3377ef08",
	callbackUrl: "oob",
	apiUrl: "https://oauth.nate.com",
    resourceUrl: "https://openapi.nate.com/OApi/RestApiSSL/ON/250060/nateon_SendNote/v1"
}

// 외부 모듈에서 사용할 수 있도록 export
exports.config = config;