var con = require('../../../config/database');
var common = require('../../../config/common');
var asyncLoop = require('node-async-loop');

var auth = {

    addDish: function (request, callback) {
        var upddata = {
            dish_name: request.dish_name,
            dish_title: request.dish_title,
            dish_description: request.dish_description,
            disc_price: request.disc_price
        }
        con.query(`INSERT INTO tbl_dish SET ?`, [upddata], function(error, result){
            if(!error){
                var id = result.insertId;
                asyncLoop(request.dish_image, (item, next) => {
                    var images = {
                        dish_id: id,
                        dish_image: item
                    }

                    con.query("INSERT INTO tbl_dish_image SET ?", [images], (error, result) => {
                        if (!error) {
                            next()
                        } else {
                            next()
                        }
                    })
                }, () => {
                    auth.getDishDetail(id,function(dish_data){
                        if(dish_data){
                            callback("1","dish add",dish_data)
                        }else{
                            callback("0","something went wrong",null)
                        }
                    });
                })
            }else{
                callback("0", "something went wrong", null)
            }
        })
    },

    getDishDetail: function(id,callback){
        console.log(id);
        con.query(`SELECT * FROM tbl_dish WHERE id = ?`,[id.id], function(error, result){
            if(!error && result.length > 0){
                callback('1','data got',result);
            }else{
                callback(null);
            }
        })
    },

dishListing: function(request,callback){
    con.query(`SELECT d.*, di.dish_image FROM tbl_dish as d JOIN tbl_dish_image as di ON d.id = di.dish_id`, function(error,result){
        if(!error){
            callback("1","success",result);
        }else{
            callback("0","failed",null);
        }
    })
}

}

module.exports = auth;