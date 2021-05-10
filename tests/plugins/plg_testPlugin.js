/*Plugins provide logic before, during, and after executing a path. 
Anything not directly corilated to the base code itself can have this applied, like a database or logic to prevent
pages from being accessed too frequently.*/

module.exports = {
    name:'testPlugin',
    beforeExec:{
        pathCanRun:(req,res,getParam,pathName)=>getParam.ohno!="this is bad"
    },
    duringExec:{
        //These are open-ended. If a latch accepts the ability to view plugins, these will be available.
        hotdog:{},
        add:function(){
            var res = 0;
            for(var i of arguments) res+=i*1;
            return res;
        }
    },
    afterExec:{
        //It's not possible to add anything to the response after this, but you can use these to do any last-minute cleanup
        postPathExec:(req,res,getParam,pathName)=>{
            if(pathName == 'helloworld') console.log('nice');
        }
        //There aren't many items in here yet, but this function is in this object in the event growing is a thing.
    }
}