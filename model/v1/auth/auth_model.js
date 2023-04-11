var con = require('../../../config/database');
var common = require('../../../config/common');


var auth = {

    signup: function (request, callback) {
        auth.checkUserEmail(request, function (isExist) {
            var otp_code = common.randomeOTPGenerator();
            if (isExist) {
                common.sendEmail(request.email, "email Verification", `<h4>Your OTP is : <h2>${otp_code}</h2></h4>`, function (isSent) {
                    if (isSent) {
                        var userDetail = {
                            login_type: request.login_type,
                            social_id: request.social_id,
                            email: request.email,
                            user_name: request.user_name,
                            password: request.password,
                            otp: otp_code,
                            lattitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
                            longitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
                            user_profile: (request.user_profile == undefined) ? 'user.jpg' : request.user_profile
                        }
                        con.query(`INSERT INTO tbl_user SET ?`, [userDetail], function (error, result) {
                            if (!error) {
                                var id = result.insertId;
                                auth.getUserDetail(id, function (code, message, user_data) {
                                    if (user_data != null) {
                                        callback('1', 'user add successfull', user_data);
                                    } else {
                                        console.log(error);
                                        callback('0', 'user data not found', null)
                                    }
                                })
                            } else {
                                console.log(error);
                                callback('0', "something went wrong", null);
                            }
                        })
                    }
                })

            } else {
                callback('0', "Email already exist", null);
            }
        })
    },

    verifyOTPCode: function (request, callback) {

        auth.getUserDetail(request.user_id, function (code, message, user_data) {
            if (user_data != null) {
                if (user_data[0].verification_status == 'pending') {
                    if (user_data[0].otp == request.otp) {
                        var updparams = {
                            verification_status: 'verified'
                        }
                        auth.userDetailupdate(request.user_id, updparams, function (isUpd) {
                            if (isUpd) {
                                common.checkUpdateToken(request.user_id, request, function (token) {
                                    if (token) {
                                        auth.getUserDetail(request.user_id, function (code, message, user_data) {
                                            user_data[0].token = token;
                                            common.sendEmail(request.email, "Welcome to PizzaPoint", `<h4>${request.user_name}You are signup successfully in PizzPoint/h4>`, function (isSent) {
                                                callback('1', 'user add successfull', user_data);
                                            })
                                        })
                                    } else {
                                        callback("0", 'something went wrong', error);
                                    }
                                })
                            } else {
                                callback("0", 'something went wrong', error);
                            }
                        })
                    } else {
                        callback('0', 'invalid otp submited', null)
                    }
                } else {
                    callback("0", "You are ready verified. Pls Login", null)
                }
            } else {
                console.log(error);
                callback('0', 'user data not found', null)
            }
        })
    },

    login: function (request, callback) {
        con.query(`SELECT * FROM tbl_user WHERE email = ? AND password = ? `, [request.email, request.password], function (error, result) {
            if (!error && result.length > 0) {
                common.sendEmail(request.email, "Login to PizzaPoint", `${result[0].user_name} login successfully`, function (isSent) {
                    if (isSent) {
                        var id = result[0].id;
                        common.checkUpdateToken(id, request, function (token) {
                            result[0].token = token;
                            callback("1", "user login successfully", result);
                        });
                    } else {
                        callback("0", "login failed", null);
                    }
                })
            } else {
                callback("0", "wrong user detail", null);
            }
        })
    },

    checkUserEmail: function (request, callback) {
        con.query(`SELECT * FROM tbl_user WHERE email = ?`, [request.email], function (error, result) {
            if (!error && result.length > 0) {
                callback(false);
            } else {
                callback(true);
            }
        })
    },

    getUserDetail: function (user_id, callback) {
        con.query(`SELECT * FROM tbl_user WHERE id = ?`, [user_id], function (error, result) {
            if (!error && result.length > 0) {
                callback("1", "get user data successfully", result);
            } else {
                console.log(error);
                callback("0", "user data not found", null)
            }
        })
    },

    userDetailupdate: function (user_id, updparams, callback) {
        con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [updparams, user_id], function (error, result) {
            if (!error) {
                callback(true);
            } else {
                callback(false);
            }
        })
    },

    forgotpassword: function (req, callback) {
        var request = req.body;
        con.query(`SELECT * FROM tbl_user WHERE email = ? AND is_active = 1`, [request.email], function (error, result) {
            if (!error && result.length > 0) {
                require('../../../config/template').forgotPass(result, function (forgottemplate) {
                    common.sendEmail(request.email, "Forgot Password", forgottemplate, function (isSent) {
                        if (isSent) {
                            var onetime = {
                                is_forgot: "1",
                                token_time: new Date()
                            }
                            // console.log(onetime.token_time);
                            con.query(`UPDATE tbl_user SET is_forgot = ?, token_time = ? WHERE id = ? `, [onetime.is_forgot, onetime.token_time, result[0].id], function (error, result) {
                                if (!error) {
                                    callback("1", "reset_keyword_success_message", result);
                                } else {
                                    callback('0', "reset_keyword_something_wrong_message", error)
                                }
                            });
                        } else {
                            // console.log(error);
                            callback('0', "reset_keyword_something_wrong_message", error)
                        }
                    })
                })
            } else {
                console.log(error);
                callback("0", "reset_keyword_something_wrong_message", error)
            }
        })
    },

    // reset password
    resetpassword: function (request, id, callback) {
        // console.log("authmodel",request);
        var onetime = {
            is_forgot: "0"
        }
        con.query(`UPDATE tbl_user SET password = ?, is_forgot = ? WHERE id = ${id} `, [request.resetpass, onetime.is_forgot], function (error, result) {
            if (!error) {
                callback("1", "reset_keyword_success_message", null);
            } else {
                console.log(error);
                callback('0', 'something went wrong , please try again later', error)
            }
        })
    },

    resendotp: function (request, callback) {
        var otp_code = common.randomeOTPGenerator();
        con.query(`SELECT * FROM tbl_user WHERE id = ?`, [request.user_id], function (error, result) {
            if (!error && result.length > 0) {
                common.sendEmail(result[0].email, "email Verification", `<h4>Your OTP is : <h2>${otp_code}</h2></h4>`, function (isSent) {
                    if (isSent) {
                        var userDetail = {
                            otp: otp_code
                        }
                        auth.userDetailupdate(request.user_id,userDetail, function (isupdate) {
                            if (isupdate) {
                                auth.getUserDetail(request.user_id, function (code, message, user_data) {
                                    if (user_data != null) {
                                        callback('1', 'OTP send successfully', user_data);
                                    } else {
                                        console.log(error);
                                        callback('0', 'something went wrong', null)
                                    }
                                })
                            } else {
                                console.log(error);
                                callback('0', 'user data not found', null)
                            }
                        })
                    } else {
                        callback('0', 'something went wrong , please try again later', error)
                    }
                });
            } else {
                callback('0', 'something went wrong , please try again later', error)
            }
        })
    }
}

module.exports = auth;