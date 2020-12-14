let express = require('express')
let app = express();
let apiRoutes = require('./focusBackendServer')
let bodyParser = require('body-parser')  
let cors = require('cors')

var port = process.env.PORT || 8080;

app.listen(port , function(){
    console.log("Started Node backend on " + port)
})

app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({
    extended:true
}));

//save quiz endpoints
app.use(bodyParser.json());
app.use(cors())
 


app.use('/focus' , apiRoutes) 