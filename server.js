require('dotenv').config();
var express = require('express');
var app = express();
var imageSearch = require('node-google-image-search');
var url = require('url');
var mongo = require('mongodb').MongoClient;

app.get('/*',function(req,res){
    var url_parts = url.parse(req.url, true);
    
    function callback(results) {
        var ret = [];
        for(var i = 0; i < results.length; i++){
            ret.push({"url":results[i]['link'], "snippet":results[i]['snippet'], "thumbnail":results[i]['image']['thumbnailLink'], "context":results[i]['image']['contextLink']});
        }
        res.send(ret);
    }
   
    /*function storeOnDatabase(){
       
    }*/
    
    if(url_parts["path"].toString().length > 1){
        var axx = url_parts["path"].split("?");
        if(axx.length == 2){
            var searchTerm = axx[0].substring(1,axx[0].length);
            var offset = axx[1].replace("offset=","");
            if(Number.isInteger(parseInt(offset))){
                mongo.connect('mongodb://localhost:27017/mydb', 
        	        function(err, db) {
    		            if (err) throw err;
    		            var d = new Date();
		                var obj1 = { 'term' : searchTerm.toString(),'when' : d.toISOString() };
		                var collection = db.collection("imagesearch");
		                collection.insert(obj1,function(err,data){
    			        if(err) throw err;
    		            db.close();
    		        });
    	        });
                var results = imageSearch(searchTerm, callback, 0, parseInt(offset));
            }else{
                res.send('Error: Wrong parameters');
            }
        }else{
            res.send('Error: Wrong parameters');
        }
    }else{
        mongo.connect('mongodb://localhost:27017/mydb', 
        	function(err, db) {
        		if (err) throw err;
        		var collection = db.collection("imagesearch");
        		collection.find().sort({"when":-1}).limit(10).toArray(function(err, documents){
        			if (err) throw err;
        			db.close();
        			res.send(documents);
        		});
        	}
        );
    }
});

app.listen(8080,function(){
    console.log('Listening on port 8080');
});