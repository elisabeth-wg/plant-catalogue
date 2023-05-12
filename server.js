const express = require('express') 
const app = express() 
const MongoClient = require('mongodb').MongoClient 
const PORT = 2121 
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'catalogue'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())




app.get('/',async (request, response)=>{  //starts a get method when the root route is passed in, sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() //setting a variable and awaits ALL items form the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) //setting a variable and awaits a number of how many items that have a completed false - uncompleted - to display later in ejs
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) //rendering the ejs and passing through the db items and count remaining inside of an object 
    // below is the classic promise version - with thens -
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { // Starts a POST method when the add route is passed in -this time sent by the form in the ejs
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) //inserts a new item into todos collection - thing is being passed in from todoItem which comes from the input box in ejs named "todoItem". Also setting completed to false to show it isn't completed, which will add it to the list without text changes and add to number count
    .then(result => { //classic promise syntax. - if insert is successful do something
        console.log('Todo Added') //console log the action
        response.redirect('/') //redirection to get url - refreshing - move back "home" after going to the todo url due to form
    }) //closing the .then
    .catch(error => console.error(error)) //catching the errors
}) //ending the POST

app.put('/markComplete', (request, response) => {  //staring a PUT method when the mark complete route is passed in. Req and res passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //It will update the thing - it is matching on the task name from the DB -item from JS is from main.js where it grabbed the span info (from the clicked span) and called it "itemFromJS". It looks for the first match and tries to see if it can update that.
        $set: {
            completed: true //set completed status to true
          }
    },{ 
        sort: {_id: -1}, //moves the item to the bottom of the list
        upsert: false //if set to true if it didn't exist it would insert it (insert/update mashup) - we don't want that now 
    })
    .then(result => { //starts a then if update was successful
        console.log('Marked Complete') //logging successful completion
        response.json('Marked Complete') //sending back json 'marked complete' to function in main.js
    }) //closing then
    .catch(error => console.error(error)) //catching errors

}) //ending put

app.put('/markUnComplete', (request, response) => { ////staring a PUT method when the mark uncomplete route is passed in. Req and res passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //It will update the thing - it is matching on the task name from the DB -item from JS is from main.js where it grabbed the span info (from the clicked span) and called it "itemFromJS". It looks for the first match and tries to see if it can update that.
        $set: {
            completed: false //set completed status to false
          }
    },{
        sort: {_id: -1}, //moves the item to the bottom of the list
        upsert: false //if set to true if it didn't exist it would insert it (insert/update mashup) - we don't want that now 
    })
    .then(result => { //starts a then if update was successful
        console.log('Marked Complete') //logging successful completion
        response.json('Marked Complete') //sending back json 'marked complete' to function in main.js
    }) //closing the then
    .catch(error => console.error(error)) //catching the errors

}) //ending put

app.delete('/deleteItem', (request, response) => { //starts a delete method when the delete route is passed, req & res parameters
    db.collection('todos').deleteOne({thing: request.body.itemFromJS}) //using delete one method in our db collection - looking for the name from the span from ejs to main.js
    .then(result => { //starts a then if delete was successful
        console.log('Todo Deleted') //console log the results
        response.json('Todo Deleted') //sending response back to the sender
    }) //close then
    .catch(error => console.error(error)) //catch errors

}) //end delete


app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})

