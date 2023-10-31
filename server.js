const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB!');
});

const userSchema = new mongoose.Schema({
    username: String,
    time: Number
  });
  
  const User = mongoose.model('User', userSchema);
  

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

let data = [];

app.get('/data', async (req, res) => {
    const users = await User.find().sort({ time: -1 });  // Sorting by time, descending.
    res.json(users);
  });
  
app.post('/addOrUpdate', async (req, res) => {
    const { username, time } = req.body;
  
    const user = await User.findOne({ username });
    if (user) {
      user.time = time;
      await user.save();
    } else {
      const newUser = new User({ username, time });
      await newUser.save();
    }
  
    res.json({ success: true });
  });
  
app.post('/delete', async (req, res) => {
    const { username } = req.body;
    await User.deleteOne({ username });
    res.json({ success: true });
});

app.get('/totalTime', async (req, res) => {
    const total = await User.aggregate([
        { $group: { _id: null, totalTime: { $sum: "$time" } } }
    ]);
    res.json(total[0] ? total[0].totalTime : 0);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
