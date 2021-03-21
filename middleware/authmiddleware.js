const jwt = require('jsonwebtoken');
const config = require('config');

function auth(request, response, next){
    const token = request.header('x-auth-token');
    if(!token)
        return response.status(401).send('Access Denied. No valid token');
    try{
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    request.user = decoded;
    next();
    }
    catch(ex)
    {
        console.log(ex)
        return response.status(400).send('Invalid token')
    }
}

module.exports = auth;