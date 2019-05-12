var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var mongoose = require('mongoose');
// var bodyParser = require('body-parser');
// var app = express();
var idMongo = require('mongodb').ObjectID;
// const uri = 'mongodb://localhost:27017/shopping';

// app.use(bodyParser.urlencoded({ extended: true }))

var csrfProtection = csrf();
router.use(csrfProtection);

// var db = mongoose.Collection('users');
// var aux = db;

// MongoClient.connect(uri, (err, client) => {
//     if (err) return console.log(err)
//     db = client.db('shopping') // coloque o nome do seu DB

//   })

router.get('/profile', isLoggedIn, function (req, res) {
    Order.find({ user: req.user }, function (err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });

        res.render('user/profile', { title: 'My Orders', orders: orders });
    });
});

router.get('/data', isLoggedIn, function (req, res) {
    User.find({ user: req.user }, function (err) {
        if (err) {
            return res.write('Error detected!');
        }

        res.render('user/data', { title: 'User Data', email: req.user.email, password: req.user.password });
    });
});

router.get('/update-data', isLoggedIn, function (req, res) {
    var userEmail = req.user.email;
    var userPassword = req.user.password;

    User.find({ user: req.user }, function (err) {
        if (err) {
            return res.write('Error')
        }

        console.log('KDFASKJDNJKASNDFJASNJDFASJDNJSAN')
        res.render('user/update-data', { csrfToken: req.csrfToken(), title: 'Update User Data', email: userEmail, password: userPassword })
    })
})

router.post('/update-data/:id', isLoggedIn, function (req, res) {

    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var id = req.params.id;

    // console.log('KDFASKJDNJKASNDFJASNJDFASJDNJSAN');
    console.log(newEmail);
    console.log(newPassword);

    User.updateOne({ _id: ObjectId(id) }, {
        $set: {
            email: newEmail,
            password: newPassword
        }
    }, function (err) {
        if (err) {
            return res.send(err);
        }
        res.redirect('/');
        console('TUDO OK');
    });
});


// var db = MongoClient.client.db('shopping');

// const updates = {
//         email: newEmail,
//         password: newPassword
//     };

// User.find({ user: req.user }, function (err) {
//     if (err) {
//         return res.write('Error');
//     }

// User.updateOne(
//         {
//             email: newEmail,
//             password: newPassword      
//         }
//     );


// User.findByIdAndUpdate(_id, updates, function (err, result) {
//     if (err){
//         return res.send(err);
//     } 
//     res.render('user/data', { title: 'User Data', email: newEmail, password: newPassword });
// })
// res.send('Done!');
// });


router.get('/update-order/', isLoggedIn, function (req, res) {

    Order.find({ user: req.user }, function (err, orders) {
        if (err) {
            return res.write('Error');
        }

        res.render('user/update-order', { title: 'Update User Order', orders: orders });

    });
});


router.get('/delete-data/:id', function (req, res) {
    var id = req.params.id;
    var email = req.body.email;

    var userSchema = new mongoose.Schema({
        email: { type: String, required: true },
        password: { type: String, required: true }
    });


    var db = mongoose.model('users', userSchema);

    // mongoose.model('users', userSchema).find(function (err, users) {
    //     res.send(users);
    // });

    // mongoose.model('users', userSchema).findByIdAndDelete({_id: idMongo}, function(req, res){
    //     console.log(idMongo);
    //     res.redirect('/');
    // });

    db.deleteOne({email: email}, function(){
        console.log('opa deu certo hein');
        res.redirect('/');
    });


    // aux.deleteOne({_id: idMongo(id)}, function(err){
    //     if(err){
    //         return res.send(500, err);
    //     }
    //     console.log('Deletado do BD');
    //     res.redirect('/');
    // });

});

router.get('/logout', isLoggedIn, function (req, res) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function (req, res) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});


module.exports = router;

function isLoggedIn(req, res, next) { //verify if the user is logged
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) { //verify if the user is not logged
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

