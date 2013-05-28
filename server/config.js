// 1. URL 및 Consumer 정보 설정
exports.config = {
	appKey: 'fcb1a133-a4c7-3262-bf10-4e17a2789584',
    clientId: '0923817c-8d1d-394a-ab98-827d7376d636',
	clientSecret: 'fdcbc733-2e96-3923-957b-0f481ce70cd8',
	redirectUri: 'http://nateon.nezz.c9.io/auth',
    scope: 'nateon/note,nateon/buddy',
    url: {
        addBuddy: 'https://apis.skplanetx.com/nateon/buddies?version=1',
        sendNote: 'https://apis.skplanetx.com/nateon/notes?version=1',
        queryNote: 'https://apis.skplanetx.com/nateon/notes/{seq}?version={version}&direction={direction}&count={count}&boxType={boxType}',
        unreadNote: 'https://apis.skplanetx.com/nateon/notes/unread/counts?version={version}'
    }
}
