function TestResponse(testName , sections , validBefore , remainingTime , isComplete ,testDuration , totalMarks){
    this.testName = testName
    this.sections = sections 
    this.validBefore = validBefore 
    this.remainingTime = remainingTime
    this.isComplete = isComplete
    this.testDuration = testDuration
    this.totalMarks = totalMarks
}
TestResponse.prototype.updateTest = function(val){
    const {testName , sections , validBefore , remainingTime , isComplete} = val
    this.testName = testName
    this.sections = sections 
    this.validBefore = validBefore 
    this.remainingTime = remainingTime
    this.isComplete = isComplete
    this.testDuration = testDuration
    this.totalMarks = totalMarks
}

module.exports = TestResponse