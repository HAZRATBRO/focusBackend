function TestResponse(testName , sections , scheduledDate , remainingTime , isComplete){
    this.testName = testName
    this.sections = sections 
    this.scheduledDate = scheduledDate 
    this.remainingTime = remainingTime
    this.isComplete = isComplete
}
TestResponse.prototype.updateTest = function(val){
    const {testName , sections , scheduledDate , remainingTime , isComplete} = val
    this.testName = testName
    this.sections = sections 
    this.scheduledDate = scheduledDate 
    this.remainingTime = remainingTime
    this.isComplete = isComplete
}

module.exports = TestResponse