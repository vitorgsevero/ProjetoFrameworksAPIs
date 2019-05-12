var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var test = require('assert');

var ObjectId = new ObjectID();
test.equal(24, ObjectId.toHexString().length);

var csrfProtection = csrf();
router.use(csrfProtection);

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

        res.render('user/update-data', { csrfToken: req.csrfToken(), title: 'Update User Data', email: userEmail, password: userPassword })
    })
})

router.post('/update-data/:id', isLoggedIn, function (req, res) {

    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var id = req.params.id;

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


router.get('/update-order/', isLoggedIn, function (req, res) {

    Order.find({ user: req.user }, function (err, orders) {
        if (err) {
            return res.write('Error');
        }

        res.render('user/update-order', { title: 'Update User Order', orders: orders });

    });
});


router.get('/delete-data/', isLoggedIn, function (req, res) {
    var id = req.params.id;

    var userSchema = new mongoose.Schema({
        email: { type: String, required: true },
        password: { type: String, required: true }
    });

    var ObjectId = userSchema.ObjectId;
    var newObj = mongoose.Types.ObjectId(ObjectId);
    var db = mongoose.model('users', userSchema);

    // mongoose.model('users', userSchema).find(function (err, users) {
    //     res.send(users);
    // });

    // mongoose.model('users', userSchema).findByIdAndDelete({_id: idMongo}, function(req, res){
    //     console.log(idMongo);
    //     res.redirect('/');
    // });

    console.log('objoijffasj', newObj);

    db.deleteOne({ _id: id}, function () {
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

