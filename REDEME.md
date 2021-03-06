Database
    database name xmeme
    Schema for memes is MemeSchema
    model name is meme

home.ejs for rendering home page
new.ejs for form for new campground.

ejs mate for layout

error are handeled and sent to error.ejs pag3

curl --location --request POST 'http://localhost:3000/memes' --header 'Content-Type: application/json' --data-raw '{ "name": "ashok kumar", "url": "https://images.pexels.com/photos/3573382/pexels-photo-357338.jpeg", "caption": "This is a meme"}'


<!-- to patch -->
curl --location --request PATCH 'http://localhost:3000/memes/602804ea1a2273ea72d0277a'  --header 'Content-Type: application/json' --data-raw '{  "caption": "new_caption" }'
