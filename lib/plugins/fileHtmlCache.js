var fs = require('fs');
var dir = './cache';



module.exports = {
    init: function() {
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
    },

    beforePhantomRequest: function(req, res, next) {
		if(req.method !== 'GET') {
            return next();
        }
		var cacheFile = req.prerender.url.replace(/[\/:*?"<>|.]/g, "");
		fs.exists(dir+'/'+cacheFile, function(exists) {
			if (exists) {
				fs.stat(dir+'/'+cacheFile, function(err,stats){
					if(err){
						return next();
					}
					
					var now = new Date();
					var cacheCreationTime = new Date(stats.ctime);
					var diffInHours = Math.abs(now - cacheCreationTime) / 36e5;
					if(diffInHours > 72){ //3 day cache time
						fs.unlink(dir+'/'+cacheFile, function(){
							return next();
						});
					} else {
						fs.readFile(dir+'/'+cacheFile, 'utf8', function (err,data) {
						  if (err) {
							return next();
						  }
						  
						  return res.send(200, data);
						  
						});
					}
					
				});
			} else {
				return next();
			}
		});
    },

    afterPhantomRequest: function(req, res, next) {
		var cacheFile = req.prerender.url.replace(/[\/:*?"<>|.]/g, "");
		fs.exists(dir+'/'+cacheFile, function(exists) {
			if (!exists) {
				fs.writeFile(dir+'/'+cacheFile, req.prerender.documentHTML, { flags: 'wx' }, function(err) {
					if(err){
						console.log(err);
					}
				});
			}
		});
		
        return next();
    }
}
