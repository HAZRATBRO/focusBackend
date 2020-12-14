function User(email , username , password , coursesEnrolled , phone , avatar , userResponses){
    this.email = email
    this.userName = username 
    this.password = password 
    this.coursesEnrolled = coursesEnrolled 
    this.phone = phone
    this.avatar = avatar
    this.userResponses = userResponses
}

User.prototype.updateVal = function(val){
const { avatar , coursesEnrolled , email , password , phone , username ,userResponses} = val 
this.userName = username
this.phone = phone
this.password = password
this.email = email
this.coursesEnrolled = coursesEnrolled
this.avatar = avatar
this.userResponses = userResponses
}

module.exports = User