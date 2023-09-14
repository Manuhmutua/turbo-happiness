import { Database } from 'bun:sqlite'

interface car { 
   type:string, 
   model:string, 
   color:string 
} 

var cars:car[] = [{$type:"Fiat", $model:"500", $color:"white"}];

const db = new Database('mydb.sqlite');

const createTable = db.prepare("CREATE TABLE IF NOT EXISTS cars (type varchar(255) ,model varchar(255) ,color varchar(255))");

const insertCar = db.prepare("INSERT INTO cars (type, model, color) VALUES ($type, $model, $color)");

const insertCars = db.transaction(cars => {
  for (const car of cars) insertCar.run(car);
});

insertCars(cars);

const query = db.query("SELECT * FROM cars");
const results = query.all();

const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "http://192.168.56.1:5173/" }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (message) =>     {
        console.log(message);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
    });
});

http.listen(3000, () => console.log('listening on http://localhost:3000') );
