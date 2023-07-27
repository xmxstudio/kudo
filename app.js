var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

const fs = require('fs');

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;



var indexRouter = require('./routes/index');


var app = express();


app.use(
  session({
    secret: '_super_taco_', 
    resave: false,
    saveUninitialized: false,
  })
);


/*****************************************************************************************************/
// twitch auth stuff
const twitchClientId = 'y74yeci228ipaxqbju278arb8kdpn8';
const twitchClientSecret = 'b2gzfzyl7a611y4cs8bxnhfpgmddeu';
const twitchCallbackUrl = 'https://localhost/auth/cb';

passport.use(
  'twitch',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
      tokenURL: 'https://id.twitch.tv/oauth2/token',
      clientID: twitchClientId,
      clientSecret: twitchClientSecret,
      callbackURL: twitchCallbackUrl,
    },
  async (accessToken, refreshToken, profile, done) => {
  try {
    const userProfileResponse = await fetch('https://api.twitch.tv/helix/users', {headers: {'Authorization': `Bearer ${accessToken}`,'Client-ID': twitchClientId}});
    const userData = await userProfileResponse.json();
    if (userData.data && userData.data.length > 0) {
      const userProfile = userData.data[0];
      return done(null, userProfile);
    } else {
      return done(new Error('Unable to fetch user profile from Twitch'));
    }
  } catch (error) {
    return done(error);
  }
}));



passport.serializeUser((user, done)   => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });


function attachUserToRequest(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(attachUserToRequest); 


app.get('/auth', passport.authenticate('twitch'));
app.get('/auth/cb',passport.authenticate('twitch', {failureRedirect: '/', successRedirect: '/sign'})
);


/*****************************************************************************************************/

app.apiKey = 'Mq3BYWv4MldqLq9d1ZG98IhGSABQybVt';
app.sdkkey = 'wrV0z2FNMeeJUUssPPQ7mZ5qV06Em93i';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.requestedURI = req.originalUrl;
  res.locals.path = req.path;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const livereload = require('livereload');
let server = livereload.createServer({
  exts: ['jade','html','sass','css']});
  server.watch(process.cwd());
app.locals.pretty=true;
module.exports = app;

/*SERVER PORT STUFF*/ 

const port = 443;
const https = require('https');
// const sslPath = '/etc/letsencrypt/live/credits.timeenjoyed.dev/';
const sslPath = '';
const options = {
  key: fs.readFileSync(path.join(sslPath, 'private-key.pem')),
  cert: fs.readFileSync(path.join(sslPath, 'certificate.pem'))
};
https.createServer(options, app).listen(443,()=>{
  console.log('server is running on port 443')
})



