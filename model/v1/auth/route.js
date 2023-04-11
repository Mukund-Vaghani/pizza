const { request } = require('express');
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
            var token_time = userdata[0].token_time;
            var current_time = new Date();
            var diffTime = current_time.getHours() - token_time.getHours();
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
    auth.getUserDetail(id,function(code,message,user_data){
        if(user_data[0].is_forgot == '1'){
            auth.resetpassword(request, id, function (code, message, data) {
                middleware.send_response(req, res, code, message, data);
            })
        }else{
            res.send("link is already used");
        }
    })
})

router.post('/resendotp', function(req,res){
    var request = req.body;

    var rules = {
        user_id:'required'
    }

    var message ={
        require:'You forgot the :attr field'
    }

    if(middleware.checkValidationRules(res, request, rules,message)){
        auth.resendotp(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }
})

router.post('/adddish', function(req,res){
    var request = req.body;

    var rules = {
        dish_name:'required',
        dish_title:'required',
        dish_description:'required',
        disc_price:'required'
    }

    var message ={
        require:'You forgot the :attr field'
    }

    if(middleware.checkValidationRules(res, request, rules,message)){
        auth.addDish(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }
})

router.get('/dishlisting',function(req,res){
    auth.dishListing(req,function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

router.post('/dishdetail', function(req,res){
    var request = req.body;
    console.log(request);
    auth.getDishDetail(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

router.post('/logout', function(req,res){
    var request = req.body;
    auth.logoutUser(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})
module.exports = router;