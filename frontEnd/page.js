let FirstName;
let age;
let occupation;

FirstName = "Ahmed";
age = 25;
occupation = "Student";

console.log(FirstName);
console.log(occupation);
console.log(age);

console.log(`My name is ${FirstName} ,and my age is ${age} ,and i'm a ${occupation}`);

let colors = ["red", "green", "blue"];

colors.push("black");
console.log(colors);

colors.shift();
colors[0] = "blue";
colors[1] = "green";
console.log(colors);

colors.unshift("yellow");
console.log(colors);


console.log("-----------------------------------------------------------------------------------------------------------------------");

let grade = 'A';

switch (grade) {
    case 'A':
        console.log("You got an A, so here's a Chocolate for you!");
        break;
    case 'B':
        console.log("You got a B, here's a Cookie for you!");
        break;
    case 'C':
        console.log("You got a C, there's room for improvement and here's your Candy!");
        break;
    default:
        console.log("No reward to give.");
};


console.log("-----------------------------------------------------------------------------------------------------------------------");

let dote = "*";
for (let i = 0; i < 5; i++) {
    console.log(dote);
    dote += "*";
}

console.log("-----------------------------------------------------------------------------------------------------------------------");

for (let i = 5; i > 0; i--) {
    dote = dote.slice(0, -1);
    console.log(dote);
}

console.log("-----------------------------------------------------------------------------------------------------------------------");

function calculateSquare(side) {
    let aria = side * side;
    let perimeter = 4 * side;

    console.log(`The square side is ${side}`);
    console.log(`The area of the square is ${aria}`);
    console.log(`The perimeter of the square is ${perimeter}`);
};

calculateSquare(8);

console.log("-----------------------------------------------------------------------------------------------------------------------");

let person =
{
    Name: "Alex",
    age: 22,
    greet() {
        console.log(`Hello! My name is ${this.Name} and I'm ${this.age} years old.`);
    }
};

person.greet();