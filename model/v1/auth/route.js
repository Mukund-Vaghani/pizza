var express = require('express');
var router = express.Router();
var middleware = require('../../../middleware/middleware');
var auth = require('./auth_model');

router.post('/signup',function(req,res){

    var request = req.body;

    var rules = {
        login_type:'required',
        social_id:'',
        email:'required|email',
        user_name:'required'
    }

    var message ={
        require:'You forgot the :attr field',
        email:'email is not valid'
    }

    if(middleware.checkValidationRules(res, request, rules,message)){
        auth.signup(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }

})

router.post('/verifyotp',function(req,res){

    var request = req.body;

    var rules = {
        user_id:'required',
        otp:'required'
    }

    var message ={
        require:'You forgot the :attr field',
        email:'email is not valid'
    }

    if(middleware.checkValidationRules(res, request, rules,message)){
        auth.verifyOTPCode(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }

})

router.get('/login', function (req, res) {
    var request = req.body;
    var rules = {
        email: 'required|email',
        password: 'required'
    };

    var message = {
        require:'You forgot the :attr field',
        email:'email is not valid'
    };

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.login(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
})

module.exports = router;