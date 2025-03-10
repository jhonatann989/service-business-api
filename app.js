import './configs/initEnv.js'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express'
import fileUpload from 'express-fileupload';
import { v4 } from 'uuid'
import cors from 'cors'
import fs from 'fs'
import modelEntity from './models/index.js';
import { crud } from 'express-crud-router'
import sequelizeCrud from 'express-crud-router-sequelize-v6-connector'

const port = process.env.PORT || 4000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const { models, crudableModels } = modelEntity

const app = express()

app.use(cors({ origin: 'http://localhost:3000', }))

app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.static('static'));

/** post routes middleware **/
app.use((err, req, res, next) => {
  console.error('ERROR: ', err);

  res.status(500).json({ error: true, message: err.message });
  next();
});


/**CRUD Handler */
for(const modelName of Object.keys(models)) {
  if(crudableModels.includes(modelName)) {
    app.use(crud(`/${modelName}`, sequelizeCrud.default(models[modelName])))
  }
}

app.get('/', async (req, res) => {
  res.send("Hello World!")
})

app.all('*', async (req, res) => {
  res.status(404).send({status: "Error", message: "route not found in server"})
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})