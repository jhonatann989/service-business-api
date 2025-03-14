import fs from 'fs'
import { Sequelize, DataTypes } from 'sequelize'
import server from './../configs/server.js'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as modelHelpers from './modelHelpers/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sequelize = new Sequelize(
    server.database,
    server.username,
    server.password,
    server
);

let rawModelObj = []
let models = {}
let crudableModels = []
/** 
 * Reading file Models...
 * filename will serve as the model name
 * the field definitions and model associations will be stored in modelData
*/
//Reading file Models
for(let file of fs.readdirSync(`${__dirname}`)) {
    let filename = file.split(".")
    try {
        if (filename[1] == "json") {
            rawModelObj.push({
                modelName: filename[0],
                modelData: JSON.parse(fs.readFileSync(`${__dirname}/${file}`))
            })
        }
    } catch (error) {
        console.error(error)
    }
}

/**
 * Initializing models 
 * the field definitions and model associations will be stored in modelData
 * the model name will also be the table name
 */
for(let rawModel of rawModelObj) {
    try {
            let {modelName, modelData} = rawModel
            let fieldsDefinitionKeys = Object.keys(modelData.fieldsDefinition)

            for(let fieldKey of fieldsDefinitionKeys) {
                //update the type from string to a valid sequelize value
                let genericFieldType = modelData.fieldsDefinition[fieldKey].type
                modelData.fieldsDefinition[fieldKey].type = DataTypes[genericFieldType]

                //Adding a custom getter if it was indicated in the model definition
                let getterFuncIndex = modelData.getterFunctions.findIndex(getter => getter.propertyName == fieldKey)
                if(getterFuncIndex >= 0) {
                    let functionName = modelData.getterFunctions[getterFuncIndex].functionName
                    modelData.fieldsDefinition[fieldKey].get = () => (modelHelpers[functionName](this.getDataValue(fieldKey)))
                }

                //Adding a custom setter if it was indicated in the model definition
                let setterFuncIndex = modelData.setterFunctions.findIndex(setter => setter.propertyName == fieldKey)
                if(setterFuncIndex >= 0) {
                    let functionName = modelData.setterFunctions[setterFuncIndex].functionName
                    modelData.fieldsDefinition[fieldKey].set = value => this.setDataValue(fieldKey, modelHelpers[functionName](value))
                }
            }

            models[modelName] = sequelize.define(modelName, modelData.fieldsDefinition, {tableName: modelName})
            
            if(modelData.accessibleViaRest) {
                crudableModels.push(modelName)
            }

    } catch (error) {
        console.error(error)
    }
}

//adding Associations
for(const rawModel of rawModelObj) {
    try {
            let {modelName, modelData} = rawModel
            for(const association of modelData.associations ) {
                models[modelName][association.relationType](models[association.relationModel])
            }
    } catch (error) {
        console.error(error)
    }
}

(async () => { await sequelize.sync(); })();

export default { sequelize, models, crudableModels }
