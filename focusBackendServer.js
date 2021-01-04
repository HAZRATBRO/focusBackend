
var mongo = require('mongodb').MongoClient
require('dotenv').config();

var url ='mongodb+srv://focusUser:jUNY9KGSb3Uo61gQ@focusbackend.jmsmm.mongodb.net/<dbname>?retryWrites=true&w=majority'
// var url = 'mongodb://localhost:27017'
var dbo
const express = require("express")
const {check , validationResult} = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const router = express.Router() 
const auth = require('./middleware/auth')
const fs = require('fs')
const Course = require('./models/course')
const User   = require('./models/users')
const Test   = require('./models/test')
const TestResponse = require('./models/testResponse')
const quiz = JSON.parse(fs.readFileSync('./maths_dpp.json','utf-8'))
const sample_quiz = JSON.parse(fs.readFileSync('./test.json', 'utf-8')) 
var markingSchema = {
    notAttempted:0,
    SingleChoice:{
        fullMarks:3,
        negativeMarks:-1

    },
    MultipleChoice:{
        fullMarks:4,
        negativeMarks:-1 ,
        partialMarks:[1 , 2 , 3]

    },
    NumericalType:{
        fullMarks:4,
        negativeMarks:-1

    },
    FillInTheBlanks:{
        fullMarks:4,
        negativeMarks:0

    },
    ParagraphType:{
        fullMarks:3,
        negativeMarks:0
    },
    MatrixType:{
        fullMarks:8,
        negativeMarks:0
    }
}   

mongo.connect(url , function(err , db){
    if (err) throw err;
    dbo = db.db("focusQuizzes")
    console.log("Connected to the DB successfully " + dbo)
 
 })


 router.get('/getUser' , auth , function(req, res){
    
    const query =  {userName : req.user}
    const projection = {_id:0 ,avatar:1 , email:1 ,  phone:1 , userName:1 }
    dbo.collection("users").find(query).project(projection).toArray(
        function(err , result){
     if(err){
         res.status(500).json({
             'error':'Error fetching DataBase'
         })
     }
     else{
         // console.log(JSON.stringify(result))
         res.json(result)
     }
 })
 })
 router.put('/updateUser' , auth , function(req , res){
     const user = req.body.user
    const query =  {userName : req.user}
    dbo.collection("users").updateOne(query , user , function(err , result){
     if(err){
         res.status(500).json({
             'error':'Error fetching DataBase'
         })
     }
     else{
         // console.log(JSON.stringify(result))
         res.send("Success")
     }
 })
})

router.get('/getSampleQuiz' , auth , function(req , res){
    let response = JSON.parse(JSON.stringify(sample_quiz))
    
    response.sections.forEach(section => {
        section.questions.forEach(question=>{
            delete question.correctAnswer
        })
    });

    res.send(JSON.stringify(response))
})

router.get('/getFTSEQuiz' , auth , function(req , res){
    let response = JSON.parse(JSON.stringify(quiz))
    
    response.sections.forEach(section => {
        section.questions.forEach(question=>{
            delete question.correctAnswer
        })
    });
    console.log(response.testName)
     res.send(JSON.stringify(response))
})


//later change to return a list of completed quizzes
router.post('/completionStatus' , auth , function(req , res){
    console.log(req.body.quizName)
    const query = {"userResponses.testName":req.body.quizName , userName:req.user}
    const project = {_id : 0 , "userResponses.isComplete":1}
    dbo.collection('users').find(query).project(project).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error getting userData"
                })
            }
            else{
                // console.log(JSON.stringify(result))
               if(result.length > 0)  
                  res.json(result[0].userResponses[0]) 
               else
                  res.json({isComplete:false})     
            }
        }
    )
})
 

router.get('/getQuiz',auth, function(req , res){
    const query = {testName : req.query.testName}
    const projection = { _id: 0 , 'sections.questions.correctAnswer':0};    
    dbo.collection('quizzes').find(query).project(projection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    'error':'Error fetching DataBase'
                })
            }
            else{
                // console.log(JSON.stringify(result))
                res.json(result[0])
            }
        }
    )
       
         
    })

    
router.get('/getDashboardQuiz' , auth ,async function(req , res){
    const userQuery = {userName:req.query.userName}
    const projection = {_id:0 ,email:0 , userName:0 , password:0 , coursesEnrolled:0 , phone:0 , avatar:0,'userResponses.sections':0}
    const quizProjection = {_id:0,sections:0}
    let responseData 
    await dbo.collection('users').find(userQuery).project(projection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    'error':'Error fetching DataBase'
                })
            }
            else{
                // console.log(JSON.stringify(result))
                console.log(result[0].userResponses)
                responseData = result[0].userResponses
            }
        }
    )
    await dbo.collection('quizzes').find().project(quizProjection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    'error':'Error fetching DataBase'
                })
            }
            else{
                console.log((result))
                result.forEach(data =>{
                   let responseFlag = true 
                   for(let i = 0 ; i < responseData.length ; i++){
                       if(responseData[i].testName === data.testName){
                           responseFlag = false
                           break;
                       }
                   }
                   if(responseFlag === true){
                     data.isComplete = false  
                     responseData.push(data)
                   }
                })
                console.log(responseData)
                res.json(responseData)
            }
        }
    )
    
    
})

router.post('/uploadUserQuiz', auth,function(req , res){
     
     
        const {testName , sections , validBefore  , isComplete ,testDuration , totalMarks} =  req.body 
        console.log(JSON.stringify(sections))
        var quizData = new TestResponse(testName , sections , validBefore , req.body.remainingTime , isComplete , testDuration , totalMarks)
        console.log("Start")
        compileFinalResult(quizData.testName , quizData) //change to the var quiz
        console.log("Waited")
    
        const query =  {  
            "userResponses.testName": testName
            ,"userName" :req.user
       }
         
        dbo.collection('users').find(query).toArray(
            function(err , result){
                if(err){
    
                    
                    res.status(500).json({
                        "error":"Error getting courses"
                    })
                }
                else{
                    // console.log(JSON.stringify(result))
                    if(result.length>0){
                        console.log("Trick")
                        console.log(JSON.stringify(quizData))
                        res.status(500).json({"error":"Response Already Recorded"})
                    } 
                    else{
                         
                    const updateQuery = { userName : req.user} 
                    console.log("Am printed before " + " : " + req.user)
                    const update = { 
                        
                        "$push": {"userResponses":quizData} 
                        } 

                    dbo.collection("users").updateOne(updateQuery ,update , function(err , result){
                            if(err){
                                res.status(500).json({
                                    'error':'Error pushing to DataBase'
                                })
                            }
                            else{
                                // console.log(JSON.stringify(result))
                                res.json({"success":"Saved quiz"})
                            }
                        })  
                    }
                                    
                }
            }
        )})

        router.post('/getQuizResponse', auth , function(req , res){
            console.log("in")
            
            const query = {userName : req.user ,"userResponses.testName":req.body.testName } 
            const projection = {_id:0 , userResponses:1}
            dbo.collection('users').find(query).project(projection).toArray(
                function(err , result){
                    if(err){
                        res.status(500).json({
                            "error":"Error getting courses"
                        })
                    }
                    else{
                        // console.log(JSON.stringify(result))
                         
                         if(result.length>0){
                                res.json(result[0].userResponses)
                            }
                            else{
                                res.status(500).json({"err":"Empty"})
                            }
                    }
        
                }
            )
        })

        function compileFinalResult(testName , quizData) {
            console.log(testName + ' Saving...') 
            const query = {testName : testName}
            const projection = {_id:0 , testDuration:0 ,'sections.questions.questionFile':0 , 'sections.questions.optionFile':0}
             
                        // console.log("result " +  result.sections.length)
                        // console.log(JSON.stringify(result))\
                        let totalScore = 0
                       let quizClone = JSON.parse(JSON.stringify(quiz))
                       for(let i = 0 ; i < quizData.sections.length ; i++){
                           for(let j = 0 ; j < quizData.sections[i].questions.length ; j++){
                             
                            assignMarks(i , j ,quizData , quizClone)
                            totalScore +=quizData.sections[i].questions[j].marksAwarded
                           }
                       }     
                        quizData.totalScore = totalScore 
                    }
                
          
        function isEqual(a , b) 
        { 
             
            // if length is not equal 
            if(a.length!=b.length) 
                return "False"; 
             
            let b1 = a[0].charCodeAt(0) 
            let b2 = b[0].charCodeAt(0)                
            // comapring each element of array 
            for(let i = 0 ; i < a.length ; i++){
                b1^=a[i].charCodeAt(0) 
            }
            for(let i = 0 ; i < b.length ; i++){
                b2^=b[i].charCodeAt(0) 
            }  
            
            let res = b1^b2

            return res === 0
        } 
        
        function assignAbsolute(i , j , quizData , quiz){
            quiz.sections[i].questions[j].correctAnswer+=''
            if((quizData.sections[i].questions[j].type === "MultipleChoice")){
                quiz.sections[i].questions[j].correctAnswer =  quiz.sections[i].questions[j].correctAnswer.split(',')
                
                if(isEqual(quizData.sections[i].questions[j].response.checkBox , quiz.sections[i].questions[j].correctAnswer) === true){
                    console.log("Full Marks")
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.fullMarks
                    return
                }
                
                else if(quizData.sections[i].questions[j].response.checkBox.length === 0 ){
                    console.log("Zero Marks")
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.notAttempted
                    return
                }
                else{
                    console.log("Negative Marks")
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.negativeMarks

                }
            }
            else{
                if(quizData.sections[i].questions[j].response.input === quiz.sections[i].questions[j].correctAnswer){
                    quizData.sections[i].questions[j].marksAwarded = markingSchema[quizData.sections[i].questions[j].type].fullMarks
                    return  
                 }
                   else if(quizData.sections[i].questions[j].response.input === ''){
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.notAttempted
                    return
                }else{
                    quizData.sections[i].questions[j].marksAwarded = markingSchema[quizData.sections[i].questions[j].type].negativeMarks
                } 
            }
        }
        function assignMarks( i , j , quizData , quiz){
            
            quiz.sections[i].questions[j].correctAnswer+=''
            console.log(quiz.sections[i].questions[j].correctAnswer)
            if((quizData.sections[i].questions[j].type === "MultipleChoice")){
                quiz.sections[i].questions[j].correctAnswer =  quiz.sections[i].questions[j].correctAnswer.split(',')
                console.log(quiz.sections[i].questions[j].correctAnswer)
                if(isEqual(quizData.sections[i].questions[j].response.checkBox , quiz.sections[i].questions[j].correctAnswer) === true){
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.fullMarks
                    return
                }
                //partial marking logic
                else if(quizData.sections[i].questions[j].response.checkBox.length === 0 ){
                    console.log("Zero Marks")
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.notAttempted
                    return
                }
                else if(quizData.sections[i].questions[j].response.checkBox.length === 1){
                    if(quiz.sections[i].questions[j].correctAnswer.includes(quizData.sections[i].questions[j].response.checkBox[0])){
                        if(quiz.sections[i].questions[j].correctAnswer.length >= 2){
                            console.log("Partial mark 1")
                            quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.partialMarks[0]
                            return
                        }
                         
                    }
                    //wrong answer
                    else{
                        console.log("Wrong answer marked")
                        quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.negativeMarks
                        return
                    }
                }
                else if(quizData.sections[i].questions[j].response.checkBox.length === 2){
                    let result = quizData.sections[i].questions[j].response.checkBox.every( e  => quiz.sections[i].questions[j].correctAnswer.includes(e));
                    console.log(result)
                    if(result == true){
                        if(quiz.sections[i].questions[j].correctAnswer.length >= 3){
                            quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.partialMarks[1]
                            return
                        }
                         
                    }
                    else{
                        quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.negativeMarks
                        return
                    }
                }
                else if(quizData.sections[i].questions[j].response.checkBox.length === 3){
                    let result = quizData.sections[i].questions[j].response.checkBox.every( e  => quiz.sections[i].questions[j].correctAnswer.includes(e));
                    if(result == true){
                        if(quiz.sections[i].questions[j].correctAnswer.length > 3){
                            quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.partialMarks[2]
                            return
                        }
                         
                    }
                    else{
                        quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.negativeMarks
                        return
                    }
                }
           }
    
           
           else{
            if(quizData.sections[i].questions[j].response.input === quiz.sections[i].questions[j].correctAnswer){
                quizData.sections[i].questions[j].marksAwarded = markingSchema[quizData.sections[i].questions[j].type].fullMarks
                return  
             }
               else if(quizData.sections[i].questions[j].response.input === ''){
                quizData.sections[i].questions[j].marksAwarded = markingSchema.notAttempted
                return
            }else{
                quizData.sections[i].questions[j].marksAwarded = markingSchema[quizData.sections[i].questions[j].type].negativeMarks
            }
           }
        }

router.post("/signup" , 
    [
        check("phone" , "Enter a valid Phone Number").isMobilePhone("any"),
         check("email", "Please enter a valid email").isEmail(),
        check("username" , "Please Enter a Valid Username")
    .not().isEmpty() ,
    check("password", "Please enter a valid password").isLength({
        min: 6
    })],
    async (req , res) =>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array()
            });
        }
    
        const {
            phone,
            email ,
            username , 
            password
        } = req.body
       
        const query = {userName : username}
        const projection = {_id:0 }
        dbo.collection('users').find(query).project(projection).toArray(
          async  function(err , result){
                if(err){
                  res.status(400).json({
                      errors:"Cannot process request at the moment"
                  })
                }
                else{
                    // console.log("result " +  result.sections.length)
                    // console.log(JSON.stringify(result))
                   if(result.length > 0){
                    res.status(500).json({
                        errors:"User Already Exists"
                    })
                   }
                   else{

                    try{ 
                    //    const salt = 10
                       
                    //    password = await new Promise((resolve, reject) => {
                    //     bcrypt.hash(password, salt, function(err, hash) {
                    //       if (err) reject(err)
                    //       resolve(hash)
                    //     });
                    //   })
                    let userKey = ''
                    const salt = await bcrypt.genSalt(10);
                    const pass = await bcrypt.hash(password, salt);
                    let user = new User(email , username , pass,[],phone , '' , [])   
                        
                    dbo.collection('users').insertOne( user, function(err , result){
                        if(err){
                            res.status(400).send({
                                'error':'Error Updating DataBase'
                            })
                        }
                        else{
                            // console.log(JSON.stringify(result))
                            const payload = {
                                user:username
                            }
                            if(username === "admin"){
                                userKey = "focusAdminToken"
                            }
                            else{
                                userKey = "focusToken"
                            }
                        jwt.sign(
                            payload ,
                            userKey , {
                                expiresIn:"1d"
                            } ,
                            (err , token)=>{
                                if(err) throw err;
                                getUser(username , token , res)
                            } 
                            )    
                        }
                    })
                   }catch(err){
                    res.status(500).send("Error logging the user")
               }  
                   
                }
            }
            }
        )
      
    })

    
router.post(
    "/login",
    [
    check("username" , "Please Enter a Valid Username")
    .not().isEmpty() ,
    check("password", "Please enter a valid password").isLength({
        min: 6
    })],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
  
      const { username, password } = req.body;
      console.log(username)
      const query = {userName : username}
      const projection = {_id:0 ,userResponses:0 , coursesEnrolled:0}
      try {
        dbo.collection('users').find(query).project(projection).toArray(
        async    function(err , result){
                if(err){
                  res.status(400).json({
                      errors:"No users found"
                  })
                }
                else{
                    
                   if(result.length > 0){

                        
                        const isMatch = await bcrypt.compare(password, result[0].password);
                        if (!isMatch)
                            return res.status(400).json({
                            message: "Incorrect Password !"
                            });

                        const payload = {
                            user:username
                        };

                        jwt.sign(
                            payload,
                            "focusToken",
                            {
                            expiresIn: "1d"
                            },
                            (err, token) => {
                            if (err) throw err;
                              getUser(username , token , res) 
                             
                           
                            }
                        );
                   }
        
      }
    }) 
}    catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
    }
  );
  
 



   function getUser(username , token , res){
    
    const query =  {userName : username}
    const projection = {_id:0 ,avatar:1 , email:1 ,  phone:1 , userName:1 }
    dbo.collection("users").find(query).project(projection).toArray(
        function(err , result){
     if(err){
        throw err
     }
     else{
         // console.log(JSON.stringify(result))
         console.log(result)
         res.json({
             "token":token,
             "userName":result[0].userName,
             "phone":result[0].phone,
             "email":result[0].email,
             "avatar":result[0].avatar
         })
     }
 })
    
}
 
router.get('/healthcheck'  , function(req , res){
    res.json({responseData:"Hello From Backend"})
})


module.exports = router