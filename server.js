





let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'catalogue'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })