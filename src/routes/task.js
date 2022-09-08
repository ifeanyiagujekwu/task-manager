const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/task', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e());
  }
});

// GET /tasks?completed=true&limit=10&skip=20
router.get('/tasks', auth, async (req, res) => {
  // limit() is to limit the number of tasks shown per page
  // the error with the route is that if you remove all the query parameters, it won't get all the tasks as it should
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  //sort by time created
  if (req.query.sort) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
  }

  try {
    //const tasks = await Task.find({ owner: req.user._id, completed: match.completed })
    
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    })
    res.status(200).send(req.user.tasks)
    
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/task/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findOne({ id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/task/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ['description', 'completed'];
  const validupdate = updates.every((update) =>
    allowedupdates.includes(update)
  );

  if (!validupdate) {
    res.status(400).send('invalid updates!');
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/task/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
