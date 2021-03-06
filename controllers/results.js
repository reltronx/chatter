

'use strict';

module.exports = function(_,async,Club,Users,Message) {

    return {

        setRouting : function(router){
          
            router.get('/results', this.getResults);
            router.get('/members', this.getMembers);

            router.post('/results',this.postResults)
            router.post('/members', this.postMembers);
           
            
        },

   
        getResults: function(req,res){
            res.redirect('/home');
        },

        
   
        postResults: function(req,res){
           async.parallel([
               function(callback){
                     
                  var regex = new RegExp(_.trim(req.body.country),'gi');

                 // var regex = _.trim(req.body.country)

                   Club.find({'$or' : [{'country':regex},{'name':regex}]},function(err,result){
                       callback(err,result);
                   })
               },
                // get the list of all countries from all the documents in the collection Club
                function(callback){
                    Club.aggregate([
                        {
                            $group:  {_id: "$country"  }
                        }
                    ], (err, newResult) => {
                        if(err) return console.log(err);
                       callback(err, newResult) ;
                    });
                },
                
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('requestReceived.userId')
                        
                        .exec((err, result) => {
                            callback(err, result);
                        })
                    },

                    function(callback){
                        const   nameRegex = new RegExp("^"+req.user.username.toLowerCase(),"i");
                        Message.aggregate([
                            {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                            {$sort:{"createdAt":-1}},
                            {
                                $group:{"_id":{
                                "last_message_between":{
                                    $cond:[
                                        {
                                            $gt:[
                                            {$substr:["$senderName",0,1]},
                                            {$substr:["$receiverName",0,1]}]
                                        },
                                        {$concat:["$senderName"," and ","$receiverName"]},
                                        {$concat:["$receiverName"," and ","$senderName"]}
                                    ]
                                }
                                }, "body": {$first:"$$ROOT"}
                                }
                            }],(err, result) => {
                                const arr = [
                                    {path: 'body.sender', model: 'Users'},
                                    {path: 'body.receiver', model: 'Users'}
                                ];
                                
                                Message.populate(result, arr, (err, newResult1) => {
                                  
                                    callback(err, newResult1);
                                });
                        })
                    }
            ],
            (err,results) => {

                if(err) return console.log(err);
                const res1 = results[0];
                console.log(res1,req.body.country);
                 const res2 = results[1];
                 const res3 = results[2];
                 const res4 = results[3];
                 

                const dataChunk  = [];
                const chunkSize = 3;
                for (let i = 0; i < res1.length; i += chunkSize){
                    dataChunk.push(res1.slice(i, i+chunkSize));
                }

                const sortedCountryList = _.sortBy(res2,'_id');

                res.render('results' , {chunk: dataChunk ,user: req.user, country: sortedCountryList,  data: res3,chat: res4});
             
            })
        },

        getMembers: function(req,res){
            async.parallel([
                function(callback){
    
 
                    Users.find({},function(err,result){
                        callback(err,result);
                    })
                },

                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate(' requestReceived.userId')
                        .exec((err, result) => {
                            callback(err, result);
                    })
                },

                function(callback){
                    const   nameRegex = new RegExp("^"+req.user.username.toLowerCase(),"i");
                    Message.aggregate([
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }],(err, result) => {
                            const arr = [
                                {path: 'body.sender', model: 'Users'},
                                {path: 'body.receiver', model: 'Users'}
                            ];
                            
                            Message.populate(result, arr, (err, newResult1) => {
                               
                                callback(err, newResult1);
                            });
                    })
                }
         
             ],
             (err,results) => {
 
                 if(err) return console.log(err);
                 const res1 = results[0];
                 const res2 = results[1];
                 const res3 = results[2];
                 const dataChunk  = [];
                 const chunkSize = 4;
                 for (let i = 0; i < res1.length; i += chunkSize){
                     dataChunk.push(res1.slice(i, i+chunkSize));
                 }
 
               
 
                 res.render('members' , {title:'members',chunk: dataChunk ,user: req.user,data: res2,chat:res3});
              
             })
        },


        postMembers: function(req,res){
            async.parallel([
                function(callback){
                    var regex = new RegExp(_.trim(req.body.username),'gi');
 
                    Users.find({'username': regex},function(err,result){
                        callback(err,result);
                    })
                },
                
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate(' requestReceived.userId')
                        .exec((err, result) => {
                            callback(err, result);
                    })
                },

                function(callback){
                    const   nameRegex = new RegExp("^"+req.user.username.toLowerCase(),"i");
                    Message.aggregate([
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }],(err, result) => {
                            const arr = [
                                {path: 'body.sender', model: 'Users'},
                                {path: 'body.receiver', model: 'Users'}
                            ];
                            
                            Message.populate(result, arr, (err, newResult1) => {
                             
                                callback(err, newResult1);
                            });
                    })
                }
         ],
                (err,results) => {
    
                    if(err) return console.log(err);
                    const res1 = results[0];
                    const res2 = results[1];
                    const res3 = results[2];
                    const dataChunk  = [];
                    const chunkSize = 4;
                    for (let i = 0; i < res1.length; i += chunkSize){
                        dataChunk.push(res1.slice(i, i+chunkSize));
                    }
    
                  
    
                    res.render('members' , {title:'members',chunk: dataChunk ,user: req.user,data: res2,chat:res3});
                 
                })
        }

    }
}