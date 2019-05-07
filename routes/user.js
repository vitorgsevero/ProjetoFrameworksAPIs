var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');

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

router.get('/update-data/', isLoggedIn, function (req, res) {
    User.find({ user: req.user }, function (err) {
        if (err) {
            return res.write('Error detected!');
        }
        res.render('user/update-data', { title: 'Update User Data', email: req.user.email, password: req.user.password });
    });
});


router.post('/update-data/:id', isLoggedIn, function (req, res) {

    console.log('OPa');
    var id = req.params.id;
    var newEmail = req.body.email;
    var newPassword = req.body.password;

    db.collection('users').updateOne({ _id: ObjectId(id) }, {
        $set: {
            email: newEmail,
            password: newPassword
        }
    }, (err, result) => {
        if (err) {
            return res.send(err);
        }
        res.redirect('user/data');
        console.log('Atualizado no Banco de Dados');
    });
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
