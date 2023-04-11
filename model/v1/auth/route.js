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

router.post('/forgotpass', function (req, res) {
    auth.forgotpassword(req, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
})

router.get('/resetform/:id', function (req, res) {
    auth.getUserDetail(req.params.id, function (code, message,userdata) {
        if (userdata != null) {
            var token_time = userdata.token_time;
            var current_time = new Date();
            // console.log("token_time",userdata.token_time);
            // console.log("current_time",current_time);
            var diffTime = current_time.getHours() - token_time.getHours();
            // console.log(diffTime);
            if (diffTime < '1') {
                if (userdata[0].is_forgot == '1') {
                    res.render('forgotpass.html', { id: req.params.id });
                } else {
                    res.send("your link is already used");
                }
            } else {
                res.send("your link is expired");
            }
        } else {
            console.log('error');
        }
    })
})

router.post('/resetpass/:id', function (req, res) {
    var request = req.body;
    var id = req.params.id;
    auth.resetpassword(request, id, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
})

module.exports = router;