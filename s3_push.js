const fs = require('fs');
const AWS = require('aws-sdk');
let testFolder = 'C:\\Users\\yadav\\OneDrive\\Desktop\\focus_quiz1'
// const s3 = new AWS.S3({
//     //1st) This will have to chnaged
//     //2nd) Will have to move it to the config file
//     accessKeyId: "AKIAJZYKEV677PVIWVCA",
//     secretAccessKey: "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"
// });

//File to be picked
const fileName = 'imageToUpload.jfif';

const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     const params = {
         //Bucket name will have to be changed
         Bucket: 'testbucketimageupload', 
         //Name to be used for saving the file 
         Key: 'Name.jfif', 
         Body: JSON.stringify(data, null, 2)
     };
     s3.upload(params, function(s3Err, data) {
         if (s3Err) throw s3Err
         console.log(`File uploaded successfully at ${data.Location}`)
     });
  });
};
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
const sec1 =  ["C" , "D" , "C" , "C" , "C" , "A" , "B" , "C" , "A,C,D" , "A,B,C"]
const sec2 = [7 , 3 , 8 , 101 , 6]
const sec3 = [1 , 8 , 3 , 6 , 4 , 5]
     
function createTestData(){
    const cloud_base_url = "https://focusedutech.s3.ap-south-1.amazonaws.com/"
    let quizData = new Test("Maths Internal" , [] , new Date("2020-12-22") , 60 , 77)
     
    const sections = ["Section_1" , "Section_2" , "Section_3" ]
    sections.forEach((section)=>{
        let sectionData = {}
        sectionData.sectionName = section
        sectionData.questions = []
        if(section=='Section_1'){
        for(let i = 0; i < 9 ; i++){
            let questionData = {}
            questionData.response = {
                input:'',
                checkBox:[]
            }
            if(i < 8){
                questionData.type="SingleChoice"

            }
            else{
                questionData.type="MultipleChoice"
            }
            questionData.optionFile = cloud_base_url+section+"/q"+(i+1)+".PNG"
            questionData.correctAnswer = sec1[i]
            questionData.questionIndex = i+1
            sectionData.questions.push(questionData)
        }
         
    }
    else if(section == 'Section_2'){
        for(let i = 0; i < 5 ; i++){
            let questionData = {}
            questionData.response = {
                input:'',
                checkBox:[]
            }
            
            questionData.type="NumericalType"
            questionData.optionFile = cloud_base_url+section+"/q"+(i+1)+".PNG"
            questionData.correctAnswer = sec2[i]
            questionData.questionIndex = i+1
            sectionData.questions.push(questionData)
        }
    }
    else{
        let questionData = {}
        questionData.response = {
            input:'',
            checkBox:[]
        }
        
        questionData.type="NumericalType"
        questionData.optionFile = cloud_base_url+section+"/q"+(1)+".PNG"
        questionData.correctAnswer = sec3[0]
        questionData.questionIndex = 1
        sectionData.questions.push(questionData)
    }
    quizData.sections.push(sectionData)

    })

     
    // sections.forEach((section)=>{
    //     let sectionData = {}
        
        
    //     sectionData.sectionName = section
    //     sectionData.questions = []
        
        
    //     if(section === "Maths"){
            
    //         sectionData.sectionMarks = 150
    //         for(let i = 1 ; i < 51 ; i++){
    //             let questionData = {}
    //              questionData.response = {
    //                  input:"",
    //                  checkBox:[]
    //              }
    //              questionData.type = "SingleChoice"
    //              questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
    //              questionData.correctAnswer = answerkey[i]
    //              questionData.questionIndex = i
    //             sectionData.questions.push(questionData)
    //         }
    //     }
    //     else if(section=="mental_ability"){
    //         sectionData.sectionMarks = 60
    //         for(let i = 81 ; i < 100 ; i++){
    //             let questionData = {}
    //              questionData.response = {
    //                  input:"",
    //                  checkBox:[]
    //              }
    //              questionData.type = "SingleChoice"
    //              questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
    //              questionData.correctAnswer = answerkey[i]
    //              questionData.questionIndex = i
    //             sectionData.questions.push(questionData)
    //         }
    //     }
    //     else{
    //         sectionData.sectionMarks = 45
    //         if(section =="Physics"){
    //             for(let i = 51 ; i < 66 ; i++){
    //                 let questionData = {}
    //                  questionData.response = {
    //                      input:"",
    //                      checkBox:[]
    //                  }
    //                  questionData.type = "SingleChoice"
    //                  questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
    //                  questionData.correctAnswer = answerkey[i]
    //                  questionData.questionIndex = i
    //                 sectionData.questions.push(questionData)
    //             }
    //         }else{
    //             for(let i = 66 ; i < 81 ; i++){
    //                 let questionData = {}
    //                  questionData.response = {
    //                      input:"",
    //                      checkBox:[]
    //                  }
    //                  questionData.type = "SingleChoice"
    //                  questionData.optionFile = cloud_base_url+"/"+section+"/q"+i+".PNG" 
    //                  questionData.correctAnswer = answerkey[i]
    //                  questionData.questionIndex = i
    //                 sectionData.questions.push(questionData)
    //             }
    //         }
           
    //     }
        
        
    //     quizData.sections.push(sectionData)
    // })
    console.log(JSON.stringify(quizData))
    
}

function fileUploadService(file , fileName){
    fs.readFile('test.json' , function(err , data){
    
    console.log(data)
    let access_key = 'AKIAJFRL3OCUMDBARK2A';
    let private_key = 'hDr/9iC+LhLEDRHzlpSfTgZg4eIvSF0vxsvFJ1u8';

    const contentType = file.type;
    const bucket = new AWS.S3(
      {
        accessKeyId:access_key,
        secretAccessKey:private_key,
        region:'ap-south-1'
      }
    ) ;
    const params = {
      Bucket : 'focusquizzes',
      Key : fileName,
      Body : data ,
      ACL : 'public-read',
      ContentType:contentType
    }

    bucket.upload(params , function(err , data){
        if(err){
          console.log('ERROR: ' , JSON.stringify(err));
          return {}
        }
        console.log('File Uploaded. ' , data )
        return data
    })
   })
    
  }


  fileUploadService({},'test/testData.json')