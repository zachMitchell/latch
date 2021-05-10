var pluginsYay;
module.exports = {
    paths:{
        'helloworld':(req,res,getParam)=>{
            res.statusCode = getParam.code || 200;
            res.setHeader('Content-type','text/html');
            res.end('<p style="text-align:center">Hello latch! Status code is '+res.statusCode+'</p>'+
            (getParam.add?'<p>Math answer:'+pluginsYay.testPlugin.add(...getParam.add.split(','))+'</p>':''));
        }
    },
    setPlugins: e=>{
        pluginsYay = e;
        console.log(pluginsYay);
    }
}