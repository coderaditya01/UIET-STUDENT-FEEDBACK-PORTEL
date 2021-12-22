const passport = require('passport');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive2002";
const JWT_RESET_KEY = "jwtreset2002";

//------------ User Model ------------//
const User = require('../models/User');
const Feedb = require('../models/Feed');
const Queryy = require('../models/Query');
const Contacts = require('../models/Contact');
//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
    const { name, email, course,branch,year, phoneno, password, password2 } = req.body;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!name || !email || !course || !branch || !year || !phoneno || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    //------------ Checking password mismatch ------------//
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (year > 5) {
        errors.push({ msg: 'Year should be less then 5' });
    }
    //------------ Checking password length ------------//
    if (password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters' });
    }
    if (phoneno.length < 10 || phoneno.length > 10) {
        errors.push({ msg: 'Phone No must be 10 digit' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            course,
            branch,
            year,
            phoneno,
            password,
            password2
        });
    } else {
        //------------ Validation passed ------------//
        User.findOne({ email: email }).then(user => {
            if (user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'Email ID already registered' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    course,
                    branch,
                    year,
                    phoneno,
                    password,
                    password2
                });
            } else {

                const oauth2Client = new OAuth2(
                    "213207826462-2dpeqbdjt1sfqeb6dkii5fmsemsf5ahs.apps.googleusercontent.com", // ClientID
                    "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", // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                );

                oauth2Client.setCredentials({
                    refresh_token: "1//045KJdr5Kii7ICgYIARAAGAQSNwF-L9IriVLCDOvNH5qtEc9S5ViXREzGVtrC9zrTLJW9qBnyGX-AJnw0ty9NiUIvuU_2rJ7yqo8"
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ name, email, course,branch,year, phoneno, password }, JWT_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;

                const output = `
                <h2>Please click on below link to activate your account</h2>
                <p>${CLIENT_URL}/auth/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
                `;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: "OAuth2",
                        user: "atul.etoos111@gmail.com",
                        clientId: "213207826462-2dpeqbdjt1sfqeb6dkii5fmsemsf5ahs.apps.googleusercontent.com",
                        clientSecret: "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",
                        refreshToken: "1//045KJdr5Kii7ICgYIARAAGAQSNwF-L9IriVLCDOvNH5qtEc9S5ViXREzGVtrC9zrTLJW9qBnyGX-AJnw0ty9NiUIvuU_2rJ7yqo8",
                        accessToken: accessToken
                    },
                });

                // send mail with defined transport object
                const mailOptions = {
                    from: '"UIET FEEDBACK PORTEL Admin" <atul.etoos111@gmail.com>', // sender address
                    to: email, // list of receivers
                    subject: "Account Verification: UIET FEEDBACK PORTEL Auth ✔", // Subject line
                    generateTextFromHTML: true,
                    html: output, // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        req.flash(
                            'error_msg',
                            'Something went wrong on our end. Please register again.'
                        );
                        res.redirect('/auth/login');
                    }
                    else {
                        console.log('Mail sent : %s', info.response);
                        req.flash(
                            'success_msg',
                            'Activation link sent to email ID. Please activate to log in.'
                        );
                        res.redirect('/auth/login');
                    }
                })

            }
        });
    }
}

//------------ Activate Account Handle ------------//
exports.activateHandle = (req, res) => {
    const token = req.params.token;
    let errors = [];
    if (token) {
        jwt.verify(token, JWT_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please register again.'
                );
                res.redirect('/auth/register');
            }
            else {
                const { name, email, course,branch,year, phoneno, password } = decodedToken;
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash(
                            'error_msg',
                            'Email ID already registered! Please log in.'
                        );
                        res.redirect('/auth/login');
                    } else {
                        const newUser = new User({
                            name,
                            email,
                            course,
                            branch,
                            year,
                            phoneno,
                            password
                        });

                        bcryptjs.genSalt(10, (err, salt) => {
                            bcryptjs.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(user => {
                                        req.flash(
                                            'success_msg',
                                            'Account activated. You can now log in.'
                                        );
                                        res.redirect('/auth/login');
                                    })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }

        })
    }
    else {
        console.log("Account activation error!")
    }
}

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    let errors = [];

    //------------ Checking required fields ------------//
    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
    }

    if (errors.length > 0) {
        res.render('forgot', {
            errors,
            email
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'User with Email ID does not exist!' });
                res.render('forgot', {
                    errors,
                    email
                });
            } else {

                const oauth2Client = new OAuth2(
                    "213207826462-2dpeqbdjt1sfqeb6dkii5fmsemsf5ahs.apps.googleusercontent.com", // ClientID
                    "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", // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                );

                oauth2Client.setCredentials({
                    refresh_token: "1//045KJdr5Kii7ICgYIARAAGAQSNwF-L9IriVLCDOvNH5qtEc9S5ViXREzGVtrC9zrTLJW9qBnyGX-AJnw0ty9NiUIvuU_2rJ7yqo8"
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;
                const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                `;

                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'Error resetting password!' });
                        res.render('forgot', {
                            errors,
                            email
                        });
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: "OAuth2",
                                user: "atul.etoos111@gmail.com",
                                clientId: "213207826462-2dpeqbdjt1sfqeb6dkii5fmsemsf5ahs.apps.googleusercontent.com",
                                clientSecret: "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",
                                refreshToken: "1//045KJdr5Kii7ICgYIARAAGAQSNwF-L9IriVLCDOvNH5qtEc9S5ViXREzGVtrC9zrTLJW9qBnyGX-AJnw0ty9NiUIvuU_2rJ7yqo8",
                                accessToken: accessToken
                        
                            },
                        });

                        // send mail with defined transport object
                        const mailOptions = {
                            from: '"UIET FEEDBACK PORTEL Admin" <atul.etoos111@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Account Password Reset: UIET FEEDBACK PORTEL Auth ✔", // Subject line
                            html: output, // html body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                req.flash(
                                    'error_msg',
                                    'Something went wrong on our end. Please try again later.'
                                );
                                res.redirect('/auth/forgot');
                            }
                            else {
                                console.log('Mail sent : %s', info.response);
                                req.flash(
                                    'success_msg',
                                    'Password reset link sent to email ID. Please follow the instructions.'
                                );
                                res.redirect('/auth/login');
                            }
                        })
                    }
                })

            }
        });
    }
}

//------------ Redirect to Reset Handle ------------//
exports.gotoReset = (req, res) => {
    const { token } = req.params;

    if (token) {
        jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please try again.'
                );
                res.redirect('/auth/login');
            }
            else {
                const { _id } = decodedToken;
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'User with email ID does not exist! Please try again.'
                        );
                        res.redirect('/auth/login');
                    }
                    else {
                        res.redirect(`/auth/reset/${_id}`)
                    }
                })
            }
        })
    }
    else {
        console.log("Password reset error!")
    }
}


exports.resetPassword = (req, res) => {
    var { password, password2 } = req.body;
    const id = req.params.id;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!password || !password2) {
        req.flash(
            'error_msg',
            'Please enter all fields.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    //------------ Checking password length ------------//
    else if (password.length < 8) {
        req.flash(
            'error_msg',
            'Password must be at least 8 characters.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    //------------ Checking password mismatch ------------//
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    else {
        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;

                User.findByIdAndUpdate(
                    { _id: id },
                    { password },
                    function (err, result) {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'Error resetting password!'
                            );
                            res.redirect(`/auth/reset/${id}`);
                        } else {
                            req.flash(
                                'success_msg',
                                'Password reset successfully!'
                            );
                            res.redirect('/auth/login');
                        }
                    }
                );

            });
        });
    }
}

const Feed = require('../models/Feed');

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
}

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
}
exports.feedback = (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be emtpy!" });
        return;
    }

    // new user
    const Feed = new Feedb({
        email1: req.body.email1,
        feedback: req.body.feedback,
        
        feedback_reply: req.body.feedback_reply,
      
        
    })

    // save user in the database
       Feed .save(Feed)
        .then(data => {
            //res.send(data)
            req.flash('success_msg', 'Feedback Submitted !!!');
            res.redirect('/view_feedback');
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a create operation"
            });
        });

}
var moment = require('moment');
exports.index = function(req, res) {
    res.render('index', { moment: moment });
}
exports.query = (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be emtpy!" });
        return;
    }

    // new user
    const Query = new Queryy({
        email1: req.body.email1,
       
        query: req.body.query,
        
        query_reply: req.body.query_reply
        
    })

    // save user in the database
       Query.save(Query)
        .then(data => {
            //res.send(data)
            req.flash('success_msg', 'Query Submitted !!!');
            res.redirect('/view_query');
        })
        .catch(err => {
            req.flash('error_msg', 'Query Not Submitted !!!');
            res.redirect('/submit_query');
        });

}
exports.contact = (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be emtpy!" });
        return;
    }

    // new user
    const Contact = new Contacts({
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        message: req.body.message,
       
    
        
    })

    // save user in the database
       Contact.save(Contact)
        .then(data => {
            //res.send(data)
            req.flash('success_msg', 'Message Submitted !!!');
            res.redirect('/home');
        })
        .catch(err => {
            req.flash('error_msg', 'Message Not Submitted !!!');
            res.redirect('/contact');
        });

}
exports.find = (req, res) => {

    if (req.query.id) {
        const id = req.query.id;

        Feedb.findById(id)
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: "Not found user with id " + id })
                } else {
                    res.send(data)
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Erro retrieving user with id " + id })
            })

    } else {
        Feedb.find()
            .then(Feed => {
                res.send(Feed)
            })
            .catch(err => {
                res.status(500).send({ message: err.message || "Error Occurred while retriving user information" })
            })
    }


}

 
   
 
