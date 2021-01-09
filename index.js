let express = require('express')
let app = express();
let apiRoutes = require('./focusBackendServer')
let adminRoutes = require('./focusAdmin')
let bodyParser = require('body-parser')  
let cors = require('cors')
var history = require('connect-history-api-fallback')
var port = process.env.PORT || 3000;
var compression = require('compression')
var helmet = require('helmet')

app.listen(port , function(){
    console.log("Started Node backend on " + port)
})

app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({
    extended:true
}));

//save quiz endpoints
app.use(compression())
 
app.use(history())
app.use(bodyParser.json());
app.use(cors())
 
app.use(express.static(process.cwd()+"/coaching-pwa"));

app.get('/', (req,res) => {
    res.sendFile(process.cwd()+"/coaching-pwa/index.html")
  });

app.use('/focus' , apiRoutes) 
app.use('/focusAdmin',adminRoutes)