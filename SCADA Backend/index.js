const express = require('express');
//const url = require('url');
//const path = require('path');
var cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const mongoose = require('mongoose');
const debug = require('debug')('app:debug');
const home_404=require('./routes/404');
const insertData=require('./routes/insertData');
const timestampRoutes=require('./routes/timestamp');
const userRoutes=require('./routes/user');
const navbarRoutes=require('./routes/navbar');

const siteRoutes=require('./routes/site');
const dashboardRoutes=require('./routes/dashboard');
const scbRoutes=require('./routes/scb');
const inverterRoutes=require('./routes/inverter');
const weatherStationRoutes=require('./routes/weatherStation');
const meterRoutes=require('./routes/meter');
const alarmRoutes=require('./routes/alarm');
const reportRoutes=require('./routes/report');
const informationRoutes=require('./routes/information');
const scheduleTask=require('./controllers/scheduleTaskController');

const app = express();
const server = require('http').Server(app);

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

//mongoose.connect('mongodb://rooftop_db:HolmiumRooftop_db@localhost/RooftopRMS_db')
mongoose.connect('mongodb://localhost/GM_db')
.then(()=>console.log("Connected to Database..."))
.catch(err=>console.log("Could Not connect to Database...",err));

//console.log(`NODE-ENV: ${process.env.NODE_ENV}`);
//console.log(`app:${app.get('env')}`);

console.log('Application Name: ' + config.get('name'));
console.log('Database Server: '+ config.get('database.host'));
//console.log('Password: '+ config.get('database.password'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(helmet());

if(app.get('env')==='development'){
    app.use(morgan('short'));
    debug("Morgan is enabled");
}

scheduleTask.thirtySecondTaskController.start();
scheduleTask.oneMinuteTaskController.start();
scheduleTask.twoMintuteTaskController.start();
//scheduleTask.fiveMintuteTaskController.start();
scheduleTask.twentyOneHourTaskController.start();

app.use('/api/user/', userRoutes);
app.use('/api/navbar/', navbarRoutes);

app.use('/api/alarm/', alarmRoutes);
app.use('/api/site/', siteRoutes);
app.use('/api/dashboard/', dashboardRoutes);
app.use('/api/scb/', scbRoutes);
app.use('/api/inverter/', inverterRoutes);
app.use('/api/weatherstation/', weatherStationRoutes);
app.use('/api/meter/', meterRoutes);
app.use('/api/report/', reportRoutes);
app.use('/api/information/', informationRoutes);
app.use('/api/timestamp/', timestampRoutes);
app.use('/api/', insertData);
app.use(home_404);

const port = process.env.PORT || 7000;
server.listen(port, () => console.log(`Listening on port ${port}...`));