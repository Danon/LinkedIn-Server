#!/usr/bin/env node

const bodyParser = require('body-parser');
const request = require('superagent');
const express = require('express');
const path = require('path');

const {parsed: {EXPRESS_APP_REDIRECT_URI, EXPRESS_APP_CLIENT_ID, EXPRESS_APP_CLIENT_SECRET}} = require('dotenv').config();

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/callback', (req, res) => {
    console.log("getting callback")
    request.post('https://www.linkedin.com/oauth/v2/accessToken')
        .query({
            grant_type: 'authorization_code',
            redirect_uri: EXPRESS_APP_REDIRECT_URI,
            client_id: EXPRESS_APP_CLIENT_ID,
            client_secret: EXPRESS_APP_CLIENT_SECRET,
            code: req.query.code,
            state: req.query.state
        })
        .then(({body}) => {
            request.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))')
                .set('Authorization', `Bearer ${(body.access_token)}`)
                .then(response => res.render('callback', {profile: response.body}));
        })
        .catch(error => {
            res.status(500).send(`${error}`);
            console.error(error);
        });
});

app.listen(3000);
