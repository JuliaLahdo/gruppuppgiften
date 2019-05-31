import express from 'express';
import bodyParser from 'body-parser';
import Database from './lib/db';
import Data from './animalData';

// Setup the server
const PORT = 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
 next();
});

// Setup the database
const db = new Database();
console.log('raw data: ', Data.cat);

db.addCollection('cats', Data.cat);
db.addCollection('pokemons', Data.pokemon);
db.addCollection('dogs', Data.dog);

// Setup the routes
function createAnimal(type, collection) {
  app.post(`/${type}`, (req, res) => {
    const newId = collection.push(req.data);

    if (!req.body.name) {
      console.log(req.body);
      return res.status(400).send({
        success: false,
        message: `Name is required for ${type}`,
      });
    }

    if (newId === 0) {
      return res.status(404).send({
        success: false,
        message: `Oops! Something went wrong, adding ${type} was not successful.`,
      });
    }

    return res.status(201).send({
      success: true,
      message: `${type} added successfully.`,
      id: newId,
    });
  });
}

function getAnimals(type, collection) {
  app.get(`/${type}s`, (req, res) => res.status(200).send({
    success: true,
    data: collection.all(),
  }));
}

function getAnimalId(type, collection) {
  app.get(`/${type}/:id`, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const animal = collection.find({ id });
    if (animal) {
      return res.status(200).send({
        success: true,
        data: animal,
      });
    }
    return res.status(404).send({
      success: false,
      message: `${type} not found`,
    });
  });
}

function searchAnimal(type, collection) {
  app.get(`/${type}Search/:key/:value`, (req, res) => {
    const result = collection.find({ [req.params.key]: req.params.value });

    if (result) {
      return res.status(200).send({
        success: true,
        data: result,
      });
    }
    return res.status(404).send({
      success: false,
      message: `${type} not found`,
    });
  });
}

[
  { type: 'cat', collection: db.cats },
  { type: 'dog', collection: db.dogs },
  { type: 'pokemon', collection: db.pokemons },
].forEach((animal) => {
  console.log('db: ', db.collections);
  console.log(`${animal.type}:`, animal.collection);
  getAnimals(animal.type, animal.collection);
  getAnimalId(animal.type, animal.collection);
  createAnimal(animal.type, animal.collection);
  searchAnimal(animal.type, animal.collection);
});

// Start server
app.listen(PORT, () => {
  console.log(`The server is listening on port ${PORT}`);
});
