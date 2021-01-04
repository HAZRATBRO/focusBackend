var mongo = require('mongodb').MongoClient
require('dotenv').config();

var url ='mongodb+srv://focusUser:jUNY9KGSb3Uo61gQ@focusbackend.jmsmm.mongodb.net/<dbname>?retryWrites=true&w=majority'
// var url = 'mongodb://localhost:27017'
var dbo
const express = require("express")
const {check , validationResult, query} = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const router = express.Router() 
const admin = require('./middleware/admin')
const fs = require('fs') 
const Course = require('./models/course')
const User   = require('./models/users')
const Test   = require('./models/test')
const TestResponse = require('./models/testResponse')
const quiz = JSON.parse(fs.readFileSync('./maths_dpp.json','utf-8'))
const sample_quiz = JSON.parse(fs.readFileSync('./test.json', 'utf-8')) 

mongo.connect(url , function(err , db){
    if (err) throw err;
    dbo = db.db("focusQuizzes")
    console.log("Connected to the DB successfully " + dbo)
 
 })

 
router.get('/getAllTests' , admin , function(req , res){
    
    const projection = {_id:0 ,  testName:1 , testDuration:1 , totalMarks:1 , validBefore:1 , "sections.sectionName":1}
    
    dbo.collection("quizzes").find().project(projection).toArray(
        function(err, result){
            if(err){
                res.status(500).json({
                    "error":"Unable to get database"
                })
            }
            else{
                res.json(result)
            }
        }
    )

})

router.get('/getSingleTest' , admin , function(req, res){
    const query = {testName : req.params.testName}

    dbo.collection("quizzes").find(query).toArray(
        function(err, result){
            if(err){
                res.status(500).json({
                    "error":"Unable to get test from database"
                })
            }
            else{
                if(result.length === 1){
                    res.json(result[0])
                }
                else{
                    res.json({"error":"No matching result"})
                }
            }
        }
    )
})
router.get('/getResultByTest' , admin , function(req , res){
    console.log(req.query.testName)
  const query = {"userResponses.testName":req.query.testName}
  const projection = {_id:0 , userResponses:1 , userName:1}
  dbo.collection("users").find(query).project(projection).toArray(
      function(err, result){
          if(err){
              res.status(500).json({
                  "error":"Error Fetching Data"
              })
          }
          else{
               
              res.json(result)
          }
      }
  )  
})

 
router.get('/getResultByUser', admin , function(req , res){
    const query = {"userName":req.query.userName}
    const projection = {_id:0 , userResponses:1}
    console.log(req.query.userName)
    dbo.collection("users").find(query).project(projection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error fetching data"
                })
            }
            else{

                res.json(result)
            }
        }
    )
})

router.get('/getUserList' , admin , function(req , res){
    const projection = {_id:0 , userName:1}
    dbo.collection("users").find().project(projection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error fetching data"
                })
            }
            else{

                res.json(result)
            }
        }
    )
})

router.get('/getAllUserResults' , admin ,function(req , res){
     
    const projection = {_id:0 ,userResponses:1, userName:1 }
    dbo.collection("users").find().project(projection).toArray(
        function(err , result){
     if(err){
        res.status(500).json({
            "error":"could not fetch users"
        })
     }
     else{
         // console.log(JSON.stringify(result))
        res.json(result)
     }
 })
})


router.post('/adminLogin' , async function(req , res){
     
    const {username , password} = req.body
    const matcher = Buffer.from("Zm9jdXNBZG1pbg==" , 'base64').toString()
    const isMatch = (password === matcher)

    if (!isMatch || username !== "focusAdmin")
        return res.status(400).json({
        message: "Incorrect Password !"
        });

    const payload = {
        user:username
    };

    jwt.sign(
        payload,
        "focusAdminToken",
        {
        expiresIn: "1d"
        },
        (err, token) => {
        if (err) throw err;
        getAdminUser(username , token , res)   
       
        }
    );
})


 
 
    function getAdminUser(username , token , res){
        res.json({
            "userName":username,
            "token":token
        })
    }



router.post('/uploadTest',admin ,function(req, res){
    let quizData = req.body
    dbo.collection("quizzes").insertOne(quizData , {upsert:true} , function(err ,result){
        if(err){
            res.status(500).json({
                "error":"Database Error"
            })
        }

        console.log(result)

        res.json({
            "success":"successFull"
        })
    })
})    

module.exports = router
 