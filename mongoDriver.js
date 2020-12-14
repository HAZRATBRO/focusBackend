var mongo = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/"
var dbo
const express = require("express")
const {check , validationResult} = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const router = express.Router() 
const auth = require('./middleware/auth')

const Course = require('./models/course')
const User   = require('./models/users')
const Test   = require('./models/test')
const TestResponse = require('./models/testResponse')
// var fs = require("fs");   
// var async = require('async');
// var jsonfile = require('jsonfile');
var markingSchema = {
    SingleChoice:{
        fullMarks:4,
        negativeMarks:-1

    },
    MultipleChoice:{
        fullMarks:4,
        negativeMarks:-2 ,
        partialMarks:[1 , 2 , 3]

    },
    NumericalType:{
        fullMarks:4,
        negativeMarks:0

    },
    FillInTheBlanks:{
        fullMarks:4,
        negativeMarks:0

    }
}     
 
mongo.connect(url , function(err , db){
    if (err) throw err;
    dbo = db.db("focusQuizzes")
    console.log("Connected to the DB successfully " + dbo)
 
 })

 

//----------Admin APIs---------------

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
router.get('/getAllQuizzes', auth,function(req , res){
    
const projection = { testName: 1 , _id:0 };    
dbo.collection('quizzes').find().project(projection).toArray(
    function(err , result){
        if(err){
            res.status(500).json({
                'error':'Error fetching DataBase'
            })
        }
        else{
            // console.log(JSON.stringify(result))
            res.send(result)
        }
    }
)
   
     
})

router.put('/updateQuiz/:quizName', auth, function(req , res){
var query = {testName :req.params.quizName};
    var quiz = {$set:req.body};
    console.log("Updating quiz " + req.params.quizName);
    dbo.collection("quizzes").updateOne(query , quiz , function(err , result){
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

router.get('/getQuiz/:quizName',auth, function(req , res){
    const query = {testName:req.params.quizName}
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
                res.json(result)
            }
        }
    )
       
         
    })



router.post('/createQuiz', auth,function(req , res){
    var quiz = req.body
    console.log("Adding Quiz to Knowledge Bank " + req.body.testName + " ...")
     
    dbo.collection('quizzes').insertOne(quiz , function(err , result){
            if(err){
                res.status(400).send({
                    'error':'Error Updating DataBase'
                })
            }
            else{
                // console.log(JSON.stringify(result))
                res.json({"success":"Successfully added to DB"})
            }
        })
     
})

router.delete('/deleteQuiz',auth,function(req, res) {
    var id = req.body;
    console.log('Deleting Test ... ' + id.testName);
    dbo.collection("quizzes").deleteMany(req.body, function(err, obj) {
        if(err){
            res.send({
                'error':'Error Completing Request'
            })
        }
        else{
            console.log("Success")
            res.send("Successfully deleted quiz")
        }
      });
})
router.delete('/deleteUserResponse',auth,function(req, res) {
    var testName = req.body.testName;
     const query =  {  
        $pull:{"userResponses": {"testName":testName}}
   }
   const search = {"userName":req.user}
    console.log('Deleting Test ... ' + testName + " " + req.user);


    dbo.collection("users").updateOne(search, query,function(err, obj) {
        if(err){
            res.send({
                'error':'Error Completing Request'
            })
        }
        else{
            console.log("Success")
            res.send("Successfully deleted quiz")
        }
      });
})
router.put('/updateCourse',auth ,function(req , res){
    var query = {courseName:req.body.courseName};
        const course = {$set:req.body};
        console.log("Updating quiz " + req.params.quizName);
        dbo.collection("courses").updateOne(query , course , function(err , result){
            if(err){
                res.status(500).json({
                    'error':'Error updating record'
                })
            }
            else{
                // console.log(JSON.stringify(result))
                res.send("Success")
            }
        })
    })
    router.get('/getCourses',auth ,function(req , res){
        
        const projection = { _id: 0 };    
        dbo.collection('courses').find().project(projection).toArray(
            function(err , result){
                if(err){
                    res.send({
                        'error':'Error fetching DataBase'
                    })
                }
                else{
                    // console.log(JSON.stringify(result))
                    res.send(result)
                }
            }
        )
           
             
        }) 
    router.get('/getCourse/:courseName',auth ,function(req , res){
        const query = {courseName:req.params.courseName}
        const projection = { _id: 0 };    
        dbo.collection('courses').find(query).project(projection).toArray(
            function(err , result){
                if(err){
                    res.send({
                        'error':'Error fetching DataBase'
                    })
                }
                else{
                    // console.log(JSON.stringify(result))
                    res.send(result)
                }
            }
        )
           
             
        })
    
    
    
    router.post('/createCourse',auth, function(req , res){
        const { courseName , dateEnrolled , validUntill , testList , courseFees , paid} = req.body
        let course = new Course(courseName , dateEnrolled , validUntill , testList , courseFees , paid)
        console.log("Adding Course to Knowledge Bank ... ")
        
        dbo.collection('courses').insertOne(course , function(err , result){
                if(err){
                    res.status(500).send({
                        'error':'Error Updating DataBase'
                    })
                }
                else{
                    // console.log(JSON.stringify(result))
                    res.json({"success":"Successfully added to DB"})
                }
            })
         
    })
//----------------------Admin APIs--------------------------





    

//---------------USER APIs---------------

//will need to update userResponses to array of objects review later
router.post('/getClassStatistics' , auth , function(req , res){
    let testName = req.body.testName
    const query ={ userName: { $ne: req.user }}
    const proj = {user, userResponses: { $elemMatch: { testName: testName } }}
    const project = {userResponses:1 , _id:0}
    dbo.collection('users').find(query).project(project).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error getting userData"
                })
            }
            else{
                // console.log(JSON.stringify(result))
                 
                res.json(result) 
                 
            }
        }
    )
})


router.get('/getEnrolledCourses', auth , function(req , res){
    console.log(req.user)
    const query = {userName : req.user}
    const project = {_id:0 , coursesEnrolled:1}        
    dbo.collection('users').find(query).project(project).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error getting courses"
                })
            }
            else{
                // console.log(JSON.stringify(result))
                 
                 
                res.json(result[0].coursesEnrolled)
            }
        }
    )
       
         
    
})  
router.post('/enrollToCourse', auth,function(req , res){
     
     
    const { courseName , dateEnrolled , validUntill , testList , courseFees , paid} =  req.body 
    const query = { userName : req.user }
    
    if(courseName === ""){
        res.status(400).json({"error":"Not a valid input"})
    }
    
    /*** 
     * here we collect user responses and the correct answers into a single location
     * Then we use that to mark out the correct answers and the wrong ones
      
    **/
   let course = new Course(courseName , dateEnrolled , validUntill , testList , courseFees , paid) 
    
   const update = { 
       "$push": {"coursesEnrolled":course} 
    } 
   dbo.collection("users").update(query , update , function(err , result){
        if(err){
            res.status(500).json({
                'error':'Error fetching DataBase'
            })
        }
        else{
            // console.log(JSON.stringify(result))
            res.send("Saved quiz")
        }
    }) 
    
 
})
router.post('/uploadUserQuiz', auth,function(req , res){
     
     
    const {testName , sections , scheduledDate , remainingTime , isComplete } =  req.body 
    console.log(testName)
    var quiz = new TestResponse(testName , sections , scheduledDate , remainingTime , isComplete)
    console.log("Start")
    compileFinalResult(quiz.testName , quiz)
    console.log("Waited")

    const query =  {  
        "userResponses.testName": testName
        ,"userName" :req.user
   }
    if(req.params.courseName === ""){
        res.status(400).json({"error":"Not a valid input"})
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
                    console.log(JSON.stringify(quiz))
                    res.status(500).json({"error":"Test Already exists"})
                } 
                else{
                     
                const query = { userName : req.user} 
                console.log("Am printed before")
                const update = { 
                    
                    "$push": {"userResponses":quiz} 
                    } 
                dbo.collection("users").update(query ,update , function(err , result){
                        if(err){
                            res.status(500).json({
                                'error':'Error fetching DataBase'
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
    )

    /*** 
     * here we collect user responses and the correct answers into a single location
     * Then we use that to mark out the correct answers and the wrong ones
      
    **/
   
    
 
})

router.post('/getAllQuizResponse', auth , function(req , res){
    console.log("in")
    const query = {userName : req.user} 
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
                    res.json(result)
            }
            }

        }
    )
})

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

router.post('/getCourseTestList' , auth , function(req , res){
    const courseName = req.body.courseName
    const projection = {_id:0  , "coursesEnrolled.testList":1}
    const query = {"userName" :req.user , "coursesEnrolled.courseName":courseName}
    dbo.collection('users').find(query).project(projection).toArray(
        function(err , result){
            if(err){
                res.send({
                    'error':'Error fetching DataBase'
                })
            }
            else{
                console.log(result)
                res.send(result)    
            }
        }
    )
       
         
    })
 


router.post('/getAllCourseQuizzes', auth , function(req , res){
     
    const testNames = req.body.testNames
    const projection = {_id:0  , testName:1, testDuration:1,totalMarks:1}
   const query = { testName: { $in: testNames } } 
    dbo.collection('quizzes').find(query).project(projection).toArray(
        function(err , result){
            if(err){
                res.status(500).json({
                    "error":"Error getting courses"
                })
            }
            else{
                // console.log(JSON.stringify(result))
                 
                 
                res.json(result)
            }
        }
    )
})
router.post('/matchQuizResponses',auth , function(req , res){

    const testNames = req.body.testNames
    console.log(testNames)
    const query =  {  
        "userResponses.testName": { "$all": testNames }
        ,"userName" :req.user
   }
    
   const projection = {_id:0  , userResponses:1  } 
        
    dbo.collection('users').find(query).project(projection).toArray(
        function(err , result){
            if(err){
                res.send({
                    'error':'Error fetching DataBase'
                })
            }
            else{
                console.log(result)
                if(result.length > 0)
                    res.send(result[0].userResponses)
                else
                    res.send(result)    
            }
        }
    )
       
         
    })
    
    router.put('/updateQuizResponse',auth ,function(req , res){
        const {testName , sections , scheduledDate , remainingTime , isComplete} =  req.body 
        const query = { userName : req.user , "userResponses.testName":testName}

        if(req.params.courseName === ""){
            res.status(400).json({"error":"Not a valid input"})
        }
        
        let quiz = new TestResponse(testName , sections , scheduledDate , remainingTime , isComplete)
        compileFinalResult(quiz.testName , quiz)

        const courseArray = { $set: { "userResponses.$": quiz } };
         dbo.collection("users").update(query , courseArray  ,function(err , result){
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
    

    // ---------------Get Single Response ---------------
    //--------------Needs Work -------------- 
    // router.get('/getQuizResponse', function(req , res){
    //     const query = {testName : req.body.testName , userName : req.body.userName}
            
    //     dbo.collection('userResponse').find(query).toArray(
    //         function(err , result){
    //             if(err){
    //                 res.send({
    //                     'error':'Error fetching DataBase'
    //                 })
    //             }
    //             else{
    //                 // console.log(JSON.stringify(result))
    //                 res.send(result)
    //             }
    //         }
    //     )
           
             
    //     })
 
    //----------------Needs Work done (To delete Response)-------------------
    //     router.delete("/deleteQuizResponse" ,  function(req, res) {
    //     var id = req.body;
    //     console.log('Deleting Test ... ' + req.body.testName);
        
    //     dbo.collection("userResponse").deleteMany(id, function(err, obj) {
    //         if(err){
    //             res.send({
    //                 'error':'Error Completing Request'
    //             })
    //         }
    //         else{
    //             console.log("Success")
    //             res.send("Successfully deleted quiz response")
    //         }
    //       });
    // })
   
    
  function compileFinalResult(testName , quizData) {
        console.log(testName + ' Saving...') 
        const query = {testName : testName}
        const projection = {_id:0 , testDuration:0 ,'sections.questions.questionFile':0 , 'sections.questions.optionFile':0}
        dbo.collection('quizzes').find(query).project(projection).toArray(
            function(err , result){
                if(err){
                   throw 'err'
                }
                else{
                    // console.log("result " +  result.sections.length)
                    // console.log(JSON.stringify(result))
                   result = result[0]
                   for(let i = 0 ; i < quizData.sections.length ; i++){
                       for(let j = 0 ; j < quizData.sections[i].questions.length ; j++){
                         
                        assignMarks(i , j ,quizData , result)
                       }
                   }     
                     
                }
            }
        )
    }
 

    function assignMarks( i , j , quizData , quiz){
        console.log(i + " " + j)
        console.log(JSON.stringify(quizData.sections[i]))
        console.log(JSON.stringify(quiz.sections[i]))
        console.log(quizData.sections[i].questions[j].type + " " + quiz.sections[i].questions[j].type)
        console.log(quizData.sections[i].questions[j].response + " " + quiz.sections[i].questions[j].correctAnswer)
        quiz.sections[i].questions[j].correctAnswer+=''
        if((quizData.sections[i].questions[j].type === "MultipleChoice")){
            quiz.sections[i].questions[j].correctAnswer = quiz.sections[i].questions[j].correctAnswer.split(',')
            console.log(quiz.sections[i].questions[j].correctAnswer.length)
            if(JSON.stringify(quizData.sections[i].questions[j].response.checkBox) === JSON.stringify(quiz.sections[i].questions[j].correctAnswer)){
                quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.fullMarks
                return
            }
            //partial marking logic
            else if(quizData.sections[i].questions[j].response.checkBox.length === 0 ){
                quizData.sections[i].questions[j].marksAwarded = 0
                return
            }
            else if(quizData.sections[i].questions[j].response.checkBox.length === 1){
                if(quiz.sections[i].questions[j].correctAnswer.includes(quizData.sections[i].questions[j].response.checkBox[0])){
                    if(quiz.sections[i].questions[j].correctAnswer.length >= 2){
                        quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.partialMarks[0]
                        return
                    }
                     
                }
                //wrong answer
                else{
                    quizData.sections[i].questions[j].marksAwarded = markingSchema.MultipleChoice.negativeMarks
                    return
                }
            }
            else if(quizData.sections[i].questions[j].response.checkBox.length === 2){
                let result = quizData.sections[i].questions[j].response.checkBox.every( e  => quiz.sections[i].questions[j].correctAnswer.includes(e));
                if(result){
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
                if(result){
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

       else if(quizData.sections[i].questions[j].type === "SingleChoice" ){
           if(quizData.sections[i].questions[j].response.input === quiz.sections[i].questions[j].correctAnswer){
            quizData.sections[i].questions[j].marksAwarded = markingSchema.SingleChoice.fullMarks
            return  
         }
           else{
            quizData.sections[i].questions[j].marksAwarded = markingSchema.SingleChoice.fullMarks
            return
        }
       }
       else if(quizData.sections[i].questions[j].type === "NumericalType" ){
        if(quizData.sections[i].questions[j].response.input === quiz.sections[i].questions[j].correctAnswer){
         quizData.sections[i].questions[j].marksAwarded = markingSchema.NumericalType.fullMarks
        return
        }
        else{
         quizData.sections[i].questions[j].marksAwarded = markingSchema.NumericalType.negativeMarks
        return
        }
    }
    else if(quizData.sections[i].questions[j].type === "FillInTheBlanks" ){
        if(quizData.sections[i].questions[j].response.input === quiz.sections[i].questions[j].correctAnswer){
         quizData.sections[i].questions[j].marksAwarded = markingSchema.FillInTheBlanks.fullMarks
        return
        }
        else{
         quizData.sections[i].questions[j].marksAwarded = markingSchema.FillInTheBlanks.negativeMarks
        return
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
                    res.status(400).json({
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
                    const salt = await bcrypt.genSalt(10);
                    const pass = await bcrypt.hash(password, salt);
                    let user = new User(email , username , pass , [] ,phone , '')   
                        
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
                        jwt.sign(
                            payload ,
                            "focusToken" , {
                                expiresIn:10000
                            } ,
                            (err , token)=>{
                                if(err) throw err;
                                res.status(200).json({
                                    token
                                })
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
      const projection = {_id:0 }
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

module.exports = router
     
