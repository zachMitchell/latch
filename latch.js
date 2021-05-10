//Made by Zachary Mitchell in 2021!
/*Latch is a modular, plug-n-play framework designed to work around the http module.
Designed with similar intents to lemonbot, it will help me make websites easier by building a small core with pre-built features.
The entire site is created around the core so anything can be plugged into latch with ease.
And if you're asking about the name, I had trouble coming up with something with that satisfying "click" or "clunk" sound when you insert something like a physical game cartridge, so I went with this name instead XP*/

const settings = require('./settings.json'),
    fs = require('fs'),
    latches = new Map(),
    plugins = {},
    pluginsDuringExec = {};

const protocols = {
    http: settings.http?require('http'):undefined,
    https: settings.https?require('https'):undefined,
},
defaultResponse = settings.defaultResponseFile?require(settings.defaultResponseFile):
(req,res,getParameters)=>{
    res.statusCode = 404;
    res.end();
};


//The core for loading latches and plugins. Takes in a list of directories and a key to be searching for.
function loadFromPathsAndKey(pathList,key, suffix = '.js'){
    var results = [];
    for(var folder of pathList){
        var dirObj = fs.opendirSync(folder);
        for(var currFile; currFile = dirObj.readSync();)
            if(currFile.name.indexOf(key) == 0 && currFile.name.indexOf(suffix) == currFile.name.length - suffix.length)
                results.push(require(folder + '/' + currFile.name))
        dirObj.close();
    }
    return results;
}

//Configure latches and plugins
for(var plugin of loadFromPathsAndKey(require('./plugins.json'),'plg_')){
    plugins[plugin.name] = plugin;
    pluginsDuringExec[plugin.name] = plugin.duringExec;
}

//Link the latches up so they can be looked up later
for(var latch of loadFromPathsAndKey(require('./latches.json'),'lch_')){
    if(typeof latch.setPlugins == 'function') latch.setPlugins(pluginsDuringExec);

    for(var path in latch.paths)
        latches.set(path,latch);
}

//The function used figure out the path the end user wants to visit.
function processRequest(req,res){

    //Grab the GET parameters:
    var getParameters = {};
    if(req.url.indexOf('?') > -1) for(var keyValue of req.url.split('?')[1].split('&')){
        var decodedStr = decodeURIComponent(keyValue);
        getParameters[decodedStr.substring(0,decodedStr.indexOf('='))] = decodedStr.substring(decodedStr.indexOf('=')+1);
    }

    //Figure out if the base path exists
    var targetPath = req.url.split('/')[1];
    if(targetPath.indexOf('?') > -1)
        targetPath = targetPath.split('?')[0];

    var pathExec = latches.get(targetPath);
    if(pathExec){
        var pathCanRun = true;
        //Plugins should run their checks before the path is run
        for(var i in plugins){
            if(plugins[i].beforeExec){
                var bExec = plugins[i].beforeExec;
                if(typeof bExec.pathCanRun == 'function' && !bExec.pathCanRun(req,res,getParameters,targetPath))
                    pathCanRun = false;
            }
        }

        //Run the code in this path. The function being executed is responsible for ending the response.
        if(pathCanRun){
            pathExec.paths[targetPath](req,res,getParameters);
            //Run plugin logic after the path runs
            for(var i in plugins){
                if(plugins[i].afterExec){
                    var aExec = plugins[i].afterExec;
                    if(typeof aExec.postPathExec == 'function')
                        aExec.postPathExec(req,res,getParameters,targetPath);
                }
            }
        }
        else defaultResponse(req,res,getParameters);

    }
    else defaultResponse(req,res,getParameters);
}

for(let i of ['http','https']){
    if(protocols[i]){
        var server = protocols[i].createServer(processRequest);
        server.listen(settings[i],()=>console.log(i + ' protocol running on port: '+settings[i]));
    }
}