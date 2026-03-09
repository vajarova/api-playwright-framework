const processENV = process.env.TEST_ENV
const env = processENV || 'dev'
console.log(`Test environment is:  ${env}`)


const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api/',
    userEmail: "nv4test@test.com",
    userPassword: "1q2w3e4r5t6y7u8"
}

if(env === 'staging'){
    config.userEmail = 'test@test.com'
    config.userPassword = 'Welcome'
}

if(env === 'qa'){
    config.userEmail = 'test2@test.com'
    config.userPassword = '12334567'
}

export {config}