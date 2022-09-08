const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        reqired: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: { // this is to label every task with the ID of the person that created it 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task