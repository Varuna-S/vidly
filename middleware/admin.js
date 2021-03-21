
function admin(request, response, next){
    if(!request.user.isAdmin)
        return response.status(403).send("Access Denied");
    next();
}

module.exports = admin;