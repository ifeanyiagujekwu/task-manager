const express = require('express');
require('./db/mongoose')
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express();
const port = process.env.PORT || 3000

// app.use((req, res, next) => {
//     if (req.method) {
//         res.send('site on maintainance')
//     }
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('server is up and running on port 3000')
})