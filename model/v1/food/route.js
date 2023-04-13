const { request } = require('express');
var express = require('express');
var router = express.Router();
var middleware = require('../../../middleware/middleware');
var auth = require('./food');

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
});

router.post('/dishdetail', function(req,res){
    var request = req.body;
    console.log(request);
    auth.getDishDetail(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

module.exports = router;