/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectId;
var expect = require('chai').expect;

//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find({}, {}).toArray((err, docs) => {
        if(err)
          return res.json('Error while retrieving books.');
        docs = docs.map((doc) => {
          doc.commentcount = doc.comments.length;
          return doc;
        });
        return res.json(docs);
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title)
        return res.send('Please inform the title.');
      //response will contain new book object including atleast _id and title
      db.collection('books').insertOne(
        { title: title, comments: [] }, {},
        (err, doc) => {
          if(err)
            return res.send("Could not add new book.");
          return res.json(doc.ops[0]);
        }
      );
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection('books').deleteMany({}, {}, (err, result) => {
        if(err)
          return res.send('Could not delete books.');
        return res.send('Complete delete successful.');
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    
      if(!bookid || !ObjectId.isValid(bookid))
        return res.send('Please inform a valid id.');
    
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({ _id: ObjectId(bookid) }, {}, (err, doc) => {
        if(err)
          return res.send(`Could not find a book with id ${bookid}.`);
        return res.json(doc);
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      if(!bookid || !ObjectId.isValid(bookid))
        return res.send('Please inform a valid id.');
    
      //json res format same as .get
      db.collection('books').findOneAndUpdate(
        { _id: ObjectId(bookid) }, 
        { $push: { comments: comment } },
        { returnOriginal: false },
        (err, doc) => {
          if(err)
            return res.send(`Could not update book ${bookid}.`);
          return res.json(doc.value);
        }
      );
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      
      if(!bookid || !ObjectId.isValid(bookid))
        return res.send('Please inform a valid id.');
    
      //if successful response will be 'delete successful'
      db.collection('books').findOneAndDelete(
        { _id: ObjectId(bookid) }, {},
        (err, doc) => {
          if(err)
            res.send(`Could not delete book ${bookid}.`);
          res.send('Delete successful.');
        }
      );
    });
  
};
