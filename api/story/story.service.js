import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

const PAGE_SIZE = 3


async function query(filterBy = { txt: '' }) {
    try {
        console.log('filterBy',filterBy)
      
        const criteria = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('story')
        var storyCursor = await collection.find(criteria)

        if (filterBy.pageIdx !== undefined) {
            storyCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }

        const storys = storyCursor.toArray()
        return storys
    } catch (err) {
        logger.error('cannot find storys', err)
        throw err
    }
}

async function getById(storyId) {
    try {
        const collection = await dbService.getCollection('story')
        const story = collection.findOne({ _id: ObjectId(storyId) })
        return story
    } catch (err) {
        logger.error(`while finding story ${storyId}`, err)
        throw err
    }
}

async function remove(storyId) {
    try {
        const collection = await dbService.getCollection('story')
        await collection.deleteOne({ _id: ObjectId(storyId) })
        return storyId
    } catch (err) {
        logger.error(`cannot remove story ${storyId}`, err)
        throw err
    }
}

async function add(story) {
    try {
        const collection = await dbService.getCollection('story')
        await collection.insertOne(story)
        return story
    } catch (err) {
        logger.error('cannot insert story', err)
        throw err
    }
}

async function update(story) {
    try {
        const storyToSave = {
           ...story
        }
        delete storyToSave._id
        const collection = await dbService.getCollection('story')
        await collection.updateOne({ _id: ObjectId(story._id) }, { $set: storyToSave })
        return story
    } catch (err) {
        logger.error(`cannot update story ${storyId}`, err)
        throw err
    }
}

async function addStoryMsg(storyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('story')
        await collection.updateOne({ _id: ObjectId(storyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add story msg ${storyId}`, err)
        throw err
    }
}

async function removeStoryMsg(storyId, msgId) {
    try {
        const collection = await dbService.getCollection('story')
        await collection.updateOne({ _id: ObjectId(storyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add story msg ${storyId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const {  txt, userId } = filterBy
  
    const criteria = {}
  
    if (txt) {
      criteria.txt = { $regex: txt, $options: 'i' }
    }

    if (userId) {
        criteria['by._id'] = userId
    }
  
    
  
    return criteria
  }

export const storyService = {
    remove,
    query,
    getById,
    add,
    update,
    addStoryMsg,
    removeStoryMsg
}
