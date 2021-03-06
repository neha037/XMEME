const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const memes = require('./models/memes');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// moongoose connection and connection error handeling
mongoose.connect('mongodb://localhost:27017/xmeme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>
{
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
// setting view
app.set('view engine', 'ejs');
// location of frontend
app.set('views', path.join(__dirname, './frontend/views'))
// Frontend/views/home.ejs
app.use(express.urlencoded({ extended: true }));
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.json());
mongoose.set('returnOriginal', false);


app.get('/', async(req, res) =>
{
    const allmemes = await memes.find({}).limit(100).sort({ $natural: -1 });
    res.render('memeland/index', { allmemes });

})

//to render home page
app.get('/memeland', catchAsync(async (req, res) =>
{
    const allmemes = await memes.find({}).limit(100).sort({ $natural: -1 });
    res.render('memeland/index', { allmemes });
}))

//Get request to get latest 100 memes
app.get('/memes', catchAsync(async (req, res) =>
{
    const allmemes = await memes.find({}).limit(100).sort({ $natural: -1 });
    res.send(allmemes);
}))

//Get request to get detail by id
app.get('/memes/:id', async (req, res) =>
{
    try
    {
        const requestedMeme = await memes.findById(req.params.id);
        res.status(302).send(requestedMeme);
    }
    catch (e)
    {
        res.status(404).send('404: Page not Found');
    }

})
//REST api to post memes and get id returned
//duplicate will fetch 409 request
app.post('/memes', async (req, res) =>
{
    const newmeme = new memes(req.body);
    const checkdupli = await memes.findOne({ url: newmeme["url"] })
    if (checkdupli != null && newmeme["url"] == checkdupli["url"])
    {
        return res.status(409).send('409: Record already exist');
    }
    await newmeme.save();
    var text = '{"id" : "' + newmeme["_id"] + '"}'
    res.send(JSON.parse(text));
})

//REST api to patch 
app.patch('/memes/:id', async (req, res) =>
{
    try
    {
        const { id } = req.params;
        const meme = await memes.findByIdAndUpdate(id, (req.body));
        res.send('204');
    }
    catch (e)
    {
        res.status(404).send('404: Page not Found');
    }


});

// get request to get render form
app.get('/new', (req, res) =>  
{
    res.render('memeland/new');
})

//post a meme and the redirect to the home page
app.post('/memeland', catchAsync(async (req, res) =>
{
    const newmeme = new memes(req.body.meme);
    await newmeme.save();
    res.redirect(`/memeland/${newmeme._id}`);
}))

// show the meme page for single meme
app.get('/memeland/:id', catchAsync(async (req, res,) =>
{
    const meme = await memes.findById(req.params.id);
    res.render('memeland/show', { meme });
}))

//patch meme
app.put('/memeland/:id', catchAsync(async (req, res) =>
{
    const { id } = req.params;
    const meme = await memes.findByIdAndUpdate(id, { ...req.body.meme });
    res.redirect(`/memeland/${meme._id}`);

}));

// edit a meme
app.get('/memeland/:id/edit', catchAsync(async (req, res) =>
{
    const meme = await memes.findById(req.params.id);
    res.render('memeland/edit', { meme });

}))

app.delete('/memeland/:id', catchAsync(async (req, res) =>
{
    const { id } = req.params;
    await memes.findByIdAndDelete(id);
    res.redirect('/memeland');
}))

app.all('*', (req, res, next) =>
{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) =>
{
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(8081, () =>
{
    console.log('Serving on 8081');
})