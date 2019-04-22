var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true });

var products = [
    new Product({
        imagePath: 'https://s1.thcdn.com/productimg/1600/1600/11778938-2094607976619602.jpg',
        title: 'FIFA 19',
        description: 'FIFA 19 is a football simulation video game developed by EA Vancouver as part of Electronic Arts FIFA series.',
        price: 150
    }),

    new Product({
        imagePath: 'https://s1.thcdn.com/productimg/1600/1600/11778938-2094607976619602.jpg',
        title: 'FIFA 19',
        description: 'FIFA 19 is a football simulation video game developed by EA Vancouver as part of Electronic Arts FIFA series.',
        price: 150
    }),


];

var ok = 0;

for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        ok++;
        if (ok === products.length) {
            exit();
        }
    });
}

function exit(){
    mongoose.disconnect();
}
