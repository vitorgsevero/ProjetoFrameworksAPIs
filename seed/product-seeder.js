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
        imagePath: 'https://production-gameflipusercontent.fingershock.com/us-east-1:62017607-7999-4675-8ce7-a9cb55a7da08/04dffcfb-cbd8-4d24-a7d0-2b57678af330/8bc0a38a-cc3a-412d-8cf7-7a5e6f840678',
        title: 'FIFA 18',
        description: 'FIFA 18 is a football simulation video game developed by EA Vancouver as part of Electronic Arts FIFA series.',
        price: 150
    }),

    new Product({
        imagePath: 'https://images-na.ssl-images-amazon.com/images/I/813nKi%2BElmL._SY445_.jpg',
        title: 'GTA V',
        description: 'Grand Theft Auto V (also known as Grand Theft Auto Five, GTA 5 or GTA V) is a video game developed by Rockstar North. It is the fifteenth instalment in the Grand Theft Auto series and the successor of Grand Theft Auto IV',
        price: 150
    })
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
