function ClassStats(testName , sections , vailidBefore , testDuration , totalMarks){
    this.testName = testName
    this.sections = sections 
    this.vailidBefore = vailidBefore 
    this.testDuration = testDuration
    this.totalMarks = totalMarks
}
Test.prototype.updateTest = function(val){
    const {testName , sections , vailidBefore , testDuration, totalMarks} = val
    this.testName = testName
    this.sections = sections 
    this.vailidBefore = vailidBefore 
    this.testDuration = testDuration
    this.totalMarks = totalMarks
}

module.exports = Test