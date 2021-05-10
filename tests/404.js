module.exports = (req,res,getParam)=>{
    res.statusCode = 404;
    res.setHeader('Content-type','application/json');
    res.end(JSON.stringify(getParam));
}