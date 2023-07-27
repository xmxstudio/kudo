var express = require('express');
var router = express.Router();
let multer = require('multer');
let upload = multer({dest: 'public/uploads/'});
const fs = require('fs');
const axios = require('axios');
const passport = require('passport');
const path = require('path');
router.use(passport.initialize());
router.use(passport.session());

router.get('/logout', (req, res) => {
  req.logout(()=>{res.redirect('/'); });
  // res.redirect('/'); 
});


// Twitch authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user.login + " is authenticated");
    return next();
  }
  res.redirect('/auth'); // Redirect to Twitch authentication if not authenticated
}

router.get('/', async (req, res) => {
  try {

    const cards = fs.readdirSync('public/cards', { withFileTypes: true });
    const files = cards.filter(card => card.isFile()).map(card => card.name);
    const cardContents = await Promise.all(files.map(card => fs.promises.readFile(`public/cards/${card}`, 'utf8')));
    // res.json(cardContents);
    res.render('index', { cards:  cardContents });
    // res.render('index', {cards: []});
  } catch (error) {
    console.error(error);
    res.render("error");
    // res.status(500).send('Internal Server Error');
  }
});

router.get('/giphy',async (req,res)=>{
  const apiKey =req.app.apiKey;
  const searchQuery = req.query.q || 'any';
  const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchQuery}&limit=10`);
  const data = await response.data;
  try {
    const gifUrl = data.data[0].images.original.url;
    res.render('giphy',{giphy: data.data});  
  } catch (error) {
    res.render('giphy',{giphy: []});
  }

  
});

//app.get('/sign', passport.authenticate('twitchtv', { scope: ['user:read:email'] }));
// router.get('/sign', passport.authenticate('twitchtv', { scope: ['user:read:email'] }));
//   res.render('sign');
// });
router.get('/sign', ensureAuthenticated, (req, res) => {
  res.render('sign',{user: req.user});
});
router.get('/login',ensureAuthenticated,(req,res)=>{
  res.redirect('/sign');
} )


router.post('/sign',ensureAuthenticated, upload.single('image'),(req,res)=>{
  let image;
  if(req.file?.path){
  fs.rename(req.file.path, req.file.destination + req.file.originalname,()=>{});
    image = `/uploads/${req.file.originalname}`;
  }else{
    image = req.body.giphyurl;
  }
  let name =req.user.display_name;// req.body.name  || 'unknown';
  let comment = req.body.comment;
  let x ={ name,comment,image,timestamp: new Date().getTime()};
  fs.writeFile(`public/cards/${new Date().getTime()}.json`, JSON.stringify(x), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving the file.');
    } else {
      setTimeout(function(){ res.render('thanks',{x})},100);
    }
  });
});


router.get('/auth/cb',passport.authenticate('twitchtv', { failureRedirect: '/' }),(req, res) => {
    // Redirect or respond with success message, as desired
    res.redirect('/sign'); // Replace with the desired route after successful login
  }
);


router.get('/nimda',(req,res)=>{
  res.render('admin');
})
module.exports = router;