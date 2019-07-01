const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('epress-session');
const flash = require('connect-flash');
require('dotenv').config();

const indexRouter = require('./routes');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pub');
app.ser('port', process.env.PORT || 8005);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(epress.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(flash());

app.use('/', indexRouter);

app.use((req, res, next) => {
    const err = new Error('Not  Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.local.error = req.app.get('env') === 'development' ? err: {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log('Listening on port ', app.get('port'));
})