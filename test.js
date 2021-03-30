function run() {
   let x="abc";
   x.that="def";
   console.log(x.that);
}

run();

// let y = Array (3);
// console.log(y)
// y[0] = "karolis";
// console.log(y)

var menu = [{name: "Margarita", price: 5.99}, {name: "Capricciosa", price: 7.99}, {name: "Pepperoni", price: 8.99}, {name: "Scones", price: 3.99}, {name: "Calzone", price: 8.99}, {name:"Chicago", price: 10.99}, {name: "Beverage", price: 1.99}]

console.log(menu[0].price)

var menu = {
   email:"joe.mcachin@uroboras.lt",
   password: "kittens",
   order: ["nulis",2,5,6]
   }

   console.log(menu.order.length)