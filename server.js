const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express(),
      jsforce = require("jsforce"),
      bodyParser = require("body-parser");
port = 3080;
oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl: 'https://login.salesforce.com',
    clientId: '3MVG9n_HvETGhr3D22iIjRmHzSQKMI_p_mXBJIycDj_5IWpNV_KpAsv7v1bA8JM_KUc.HnbfChihv.l.ZghKF',
    clientSecret: 'C2A0D1612348690A1D7FCDB852D1A90144B961D0462C40352B3661C55C5B6970',
    redirectUri: 'http://localhost:3080/getAccessToken',
  });
conn = {};

app.use(session({
    secret: 's3cret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(process.cwd() + "/dist/canvas-webflow"));


app.get('/canvas-webflow', (req, res) => {
    console.log("oauth wsf", req.body, req.params, req.query);
    console.log("redirecting to oauth2 auth url");
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});

app.get('/getAccessToken', (req, res) => {
    console.log("oauth wsf callback", req.body, req.params, req.query);
    conn = new jsforce.Connection({ oauth2: oauth2 });
    var code = req.query.code;
    console.log('authorization code', code);
    conn.authorize(code, function(err, userInfo) {
        if (err) {
            return console.error(err);
        }
        console.log("authorize response", conn.accessToken, conn.instanceUrl, conn.refreshToken, userInfo);
        const accessTokenObj = { accessToken: conn.accessToken };

        fs.writeFile('conn.json', JSON.stringify(accessTokenObj), err => {
            console.log(err);
            res.sendFile(process.cwd() + "/dist/canvas-webflow/index.html");
        });

    });
});

app.get('/accounts', (req, res) => {

    let rawData = fs.readFileSync('conn.json');
    let access = JSON.parse(rawData);

    console.log('access token', access.accessToken);
    var conn = new jsforce.Connection({ oauth2 : {oauth2}, instanceUrl: 'https://mindful-narwhal-6i6s53-dev-ed.my.salesforce.com', accessToken: access.accessToken });
    conn.query('SELECT Id FROM EventLogFile LIMIT 200', function(err, res) {
        if (err) {
            console.log(err);
        }
        console.log('Event logs', res);
    });

});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});


// <1. ../authorize? -> request auth code
// >2. ../<callback>?code=<code> callback receive code
// <3.  Request access token using access token
// >4. receive the access token