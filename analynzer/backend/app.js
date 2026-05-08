const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

app.use(cors());
/* for Angular Client (withCredentials) */
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:8081"],
//   })
// );

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
    sameSite: 'strict'
  })
);

const ConsultantRoute = require('./app/routes/consultant.routes')


// database
// const db = require("./app/models");
// const Role = db.role;

// db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
// app.get("/api/consultant/companies", (req, res) => {
//     console.log('ooooooooooooooooo')
//   res.json({ message: "Welcome to bezkoder application." });
// });

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
// require("./app/routes/consultant.routes")(app);

//Consultant Route

app.use('/api/consultant', ConsultantRoute);


function initial() {
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "moderator",
  });

  Role.create({
    id: 3,
    name: "admin",
  });
}


module.exports = app;