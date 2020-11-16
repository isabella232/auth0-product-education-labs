const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const { createServer } = require("http");
// 👉 Replace this with express-openid-connect require 👈

const {
  checkUrl,
  APP_URL, // Public URL for this app
  API_URL, // URL for Expenses API
  ISSUER_BASE_URL, // Auth0 Tenant Url
  CLIENT_ID, // Auth0 Web App Client
  CLIENT_SECRET, // Auth0 Web App CLient Secret
  SESSION_SECRET, // Cookie Encryption Key
  PORT,
} = require("./env-config");

const app = express();

app.use(checkUrl()); // Used to normalize URL in Vercel
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 👉 Replace this with auth middleware 👈

const expenses = [
  {
    date: new Date(),
    description: "Pizza for a Coding Dojo session.",
    value: 102,
  },
  {
    date: new Date(),
    description: "Coffee for a Coding Dojo session.",
    value: 42,
  },
];

app.get("/", (req, res) => {
  res.render("home", {
    user: req.oidc && req.oidc.user,
    total: expenses.reduce((accum, expense) => accum + expense.value, 0),
    count: expenses.length,
  });
});

// 👇 add requiresAuth middlware to these private routes  👇

app.get("/user", (req, res) => {
  res.render("user", { user: req.oidc && req.oidc.user });
});

app.get("/expenses", async (req, res, next) => {
  res.render("expenses", {
    user: req.oidc && req.oidc.user,
    expenses,
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

createServer(app).listen(PORT, () => {
  console.log(`WEB APP: ${APP_URL}`);
});
