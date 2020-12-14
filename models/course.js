function Course(courseName , dateEnrolled , validUntill , testList , courseFees , paid){
    this.courseName = courseName
    this.dateEnrolled = dateEnrolled 
    this.validUntill = validUntill 
    this.testList = testList 
    this.courseFees = courseFees
    this.paid = paid
}


Course.prototype.updateTestList = function(newTest){
    this.testList.push(newTest)
}

Course.prototype.updateVal = function(val){
    const { courseName , dateEnrolled , validUntill , testList , courseFees , paid} = val 
    this.courseName = courseName
    this.dateEnrolled = dateEnrolled 
    this.validUntill = validUntill 
    this.testList = testList 
    this.courseFees = courseFees
    this.paid = paid
    }

module.exports = Course    