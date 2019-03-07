const express = require('express');
const passport = require('passport');
const constants = require('../constants.js');
const jwt = require('jsonwebtoken');
const path = express.Router();

//End Point with verify Logic
path.post('/verify', function (req, res) {

  //prueba

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    if (token) {
      try {
        jwt.verify(token, constants.SECRET_JWT, function(err, decoded) {      
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
                // if everything is good return this json
                return res.json({ success: true, message: 'Is verified.' });  
              }
            });
          } catch (err) {
          res.send(400);
        }
      } else {
        res.send(400);
      }
  } else {
    res.send(401);
  }
    
    });
  
  //End Point with Google Auth
  path.get('/google',
    passport.authenticate('google', { scope: ['profile'] }));
  
  path.get('/google/callback', 
    passport.authenticate('google',{
      failureRedirect: "/auth/google",
      
      }),
    function(req, res) {
      let token = jwt.sign({
        profile: req.user,
    }, constants.SECRET_JWT, { expiresIn: constants.TOKEN_EXPIRE })
    // Successful authentication, send Token.
      res.json({ token: token });
    });
    
    path.post('/local', passport.authenticate('local', { session: false }), function(req,res){
      if(!req.user===false){
        let token = jwt.sign({
          profile : req.user
        }, constants.SECRET_JWT, { expiresIn: constants.TOKEN_EXPIRE })
    
        //res.locals.token=token;
        res.json({ token: token });
      }else{
        return res.json({ success: false, message: 'Failed to authenticate token.' });   
      }
     
  });
  module.exports = path;

  