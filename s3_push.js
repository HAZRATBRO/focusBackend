// const fs = require('fs');
// const AWS = require('aws-sdk');
// let testFolder = 'C:\\Users\\yadav\\OneDrive\\Desktop\\focus_quiz1'
// const s3 = new AWS.S3({
//     //1st) This will have to chnaged
//     //2nd) Will have to move it to the config file
//     accessKeyId: "AKIAJZYKEV677PVIWVCA",
//     secretAccessKey: "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"
// });

// //File to be picked
// const fileName = 'imageToUpload.jfif';

// const uploadFile = () => {
//   fs.readFile(fileName, (err, data) => {
//      if (err) throw err;
//      const params = {
//          //Bucket name will have to be changed
//          Bucket: 'testbucketimageupload', 
//          //Name to be used for saving the file 
//          Key: 'Name.jfif', 
//          Body: JSON.stringify(data, null, 2)
//      };
//      s3.upload(params, function(s3Err, data) {
//          if (s3Err) throw s3Err
//          console.log(`File uploaded successfully at ${data.Location}`)
//      });
//   });
// };
const Test   = require('./models/test')

const answerkey = [
    "A",
    "B",
    "D",
    "A",
    "C",
    "A",
    "A",
    "C",
    "B",
    "B",
    "B",
    "B",
    "D",
    "B",
    "C",
    "A",
    "C",
    "C",
    "B",
    "B",
    "B",
    "C",
    "D",
    "C",
    "B",
    "C",
    "C",
    "B",
    "D",
    "A",
    "A",
    "B",
    "B",
    "C",
    "B",
    "B",
    "C",
    "B",
    "B",
    "B",
    "A",
    "C",
    "A",
    "B",
    "A",
    "A",
    "C",
    "A",
    "C",
    "D",
    "A",
    "C",
    "A",
    "A",
    "A",
    "C",
    "D",
    "B",
    "B",
    "C",
    "A",
    "D",
    "B",
    "A",
    "C",
    "D",
    "C",
    "A",
    "A",
    "B",
    "A",
    "A",
    "D",
    "C",
    "C",
    "A",
    "B",
    "B",
    "B",
    "A",
    "C",
    "D",
    "B",
    "C",
    "D",
    "C",
    "D",
    "A",
    "B",
    "A",
    "A",
    "B",
    "D",
    "C",
    "D",
    "B",
    "B",
    "B",
    "B",
    "C"
  ]
     
function createTestData(){
    const cloud_base_url = "https://focusquiz.s3-ap-southeast-1.amazonaws.com"
    let quizData = new Test("FTSE" , [] , new Date("2020-12-20") , 180 , 300)
     
    const sections = ["Maths" , "Physics" , "Chemistry" , "mental_ability"]

    sections.forEach((section)=>{
        let sectionData = {}
        
        
        sectionData.sectionName = section
        sectionData.questions = []
        
        
        if(section === "Maths"){
            
            sectionData.sectionMarks = 150
            for(let i = 1 ; i < 51 ; i++){
                let questionData = {}
                 questionData.response = {
                     input:"",
                     checkBox:[]
                 }
                 questionData.type = "SingleChoice"
                 questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
                 questionData.correctAnswer = answerkey[i]
                 questionData.questionIndex = i
                sectionData.questions.push(questionData)
            }
        }
        else if(section=="mental_ability"){
            sectionData.sectionMarks = 60
            for(let i = 81 ; i < 100 ; i++){
                let questionData = {}
                 questionData.response = {
                     input:"",
                     checkBox:[]
                 }
                 questionData.type = "SingleChoice"
                 questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
                 questionData.correctAnswer = answerkey[i]
                 questionData.questionIndex = i
                sectionData.questions.push(questionData)
            }
        }
        else{
            sectionData.sectionMarks = 45
            if(section =="Physics"){
                for(let i = 51 ; i < 66 ; i++){
                    let questionData = {}
                     questionData.response = {
                         input:"",
                         checkBox:[]
                     }
                     questionData.type = "SingleChoice"
                     questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
                     questionData.correctAnswer = answerkey[i]
                     questionData.questionIndex = i
                    sectionData.questions.push(questionData)
                }
            }else{
                for(let i = 66 ; i < 81 ; i++){
                    let questionData = {}
                     questionData.response = {
                         input:"",
                         checkBox:[]
                     }
                     questionData.type = "SingleChoice"
                     questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
                     questionData.correctAnswer = answerkey[i]
                     questionData.questionIndex = i
                    sectionData.questions.push(questionData)
                }
            }
           
        }
        
        
        quizData.sections.push(sectionData)
    })
    console.log(JSON.stringify(quizData))
    console.log()
}

createTestData()
