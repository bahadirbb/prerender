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
				fs.readFile(dir+'/'+cacheFile, 'utf8', function (err,data) {
				  if (err) {
					return next();
				  }
				  
				  return res.send(200, data);
				  
				});
				
			} else {
				return next();
			}
		});
    },

    afterPhantomRequest: function(req, res, next) {
		var cacheFile = req.prerender.url.replace(/[\/:*?"<>|.]/g, "");
		fs.openSync(dir+'/'+cacheFile, 'w');
		fs.writeFile(dir+'/'+cacheFile, req.prerender.documentHTML, { flags: 'wx' }, function(err) {
			if(err){
				console.log(err);
			}
		});
        return next();
    }
}
