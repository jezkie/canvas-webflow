const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express(),
      jsforce = require("jsforce"),
      bodyParser = require("body-parser");
port = 3080;
oauth2 = {};
conn = {};

app.use(session({
    secret: 's3cret',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(process.cwd() + "/dist/canvas-webflow"));


app.get('/canvas-webflow', (req, res) => {
    console.log("oauth wsf", req.body, req.params, req.query);
    console.log("redirecting to oauth2 auth url");

    oauth2 = new jsforce.OAuth2({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl: 'https://login.salesforce.com',
        clientId: '3MVG9n_HvETGhr3D22iIjRmHzSQKMI_p_mXBJIycDj_5IWpNV_KpAsv7v1bA8JM_KUc.HnbfChihv.l.ZghKF',
        clientSecret: 'C2A0D1612348690A1D7FCDB852D1A90144B961D0462C40352B3661C55C5B6970',
        redirectUri: 'http://localhost:3080/getAccessToken',
      });
    res.redirect(oauth2.getAuthorizationUrl({}));
});

app.get('/getAccessToken', (req, res) => {
    console.log("oauth wsf callback", req.body, req.params, req.query);
    var conn = new jsforce.Connection({ oauth2: oauth2 });
    var code = req.query.code;
    conn.authorize(code, function(err, userInfo) {
        if (err) {
            return console.error(err);
        }
        console.log("authorize response", conn.accessToken, userInfo);
        const accessTokenObj = { accessToken: conn.accessToken };
        fs.writeFile('conn.json', JSON.stringify(accessTokenObj), err => {
            console.log(err);
            res.sendFile(process.cwd() + "/dist/canvas-webflow/index.html");

        });

        conn.query('SELECT FIELDS(All) FROM EventLogFile LIMIT 200', function(err, res) {
            if (err) {
                console.log(err);
            }
            console.log('Event logs', res);
        });

    });
});

app.get('/accounts', (req, res) => {

    let rawData = fs.readFileSync('conn.json');
    let access = JSON.parse(rawData);

    // console.log('access token', access.accessToken);
    // var conn = new jsforce.Connection({ instanceUrl: 'https://mindful-narwhal-6i6s53-dev-ed.lightning.force.com', accessToken: req.session.access_token });
    // conn.query('SELECT FIELDS(All) FROM EventLogFile LIMIT 200', function(err, res) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     console.log('Event logs', res);
    // });
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
