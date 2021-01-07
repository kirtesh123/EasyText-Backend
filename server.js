// import dependencies
import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import cors from 'cors';
import mongoMessages from "./messageModel.js";

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1132727",
    key: "bc9f3e4c53a45152caee",
    secret: "e494aa6f2ccaa6e9670c",
    cluster: "us2",
    useTLS: true
  });

// middlewares
// allows to process to json
app.use(express.json());
app.use(cors());

// db config
const mongoURI = 'mongodb+srv://admin:mkFz56OhPVZvoEfd@cluster0.j9fba.mongodb.net/messageDB?retryWrites=true&w=majority'
mongoose.connect( mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.once('open', () => {
    console.log('DB connected!');

    const changeStream = mongoose.connection.collection('messages').watch()
    changeStream.on('change', (change) => {
        pusher.trigger('messages', 'newMessage', {
            'change': change
        })
    })

})

// api routes
app.get('/', (req, res) => res.status(200).send('Hello World!') );

app.post('/save/message',  (req, res) => {
    const dbMessage = req.body;

    // saving into database by creating a schema instance that we defined
    mongoMessages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
});

app.get('/retrieve/conversation', (req,res) => {
    mongoMessages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            data.sort((a,b) => {
                return a.timestamp - b.timestamp;
            })
            res.status(200).send(data);
        }
    })
})

// listener
app.listen(port, () => console.log(`listen on ${port}`));

// mkFz56OhPVZvoEfd