const emailValidation = (email) => {
    // check if email is in format xyz@abv.123
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    // console.log(emailPattern.test(email))
    return emailPattern.test(email) 
}

module.exports = { emailValidation }