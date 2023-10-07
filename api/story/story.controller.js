import { storyService } from './story.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getStorys(req, res) {
    try {
        logger.debug('Getting Storys:', req.query)
        const filterBy = {
            txt: req.query.txt || '',
            pageIdx: req.query.pageIdx,
            userId: req.query.userId
        }
        const storys = await storyService.query(filterBy)
        res.json(storys)
    } catch (err) {
        logger.error('Failed to get storys', err)
        res.status(400).send({ err: 'Failed to get storys' })
    }
}

export async function getStoryById(req, res) {
    try {
        const storyId = req.params.id
        const story = await storyService.getById(storyId)
        res.json(story)
    } catch (err) {
        logger.error('Failed to get story', err)
        res.status(400).send({ err: 'Failed to get story' })
    }
}

export async function addStory(req, res) {
    const { loggedinUser } = req

    try {
        const story = req.body
        story.by = loggedinUser
        const addedStory = await storyService.add(story)
        socketService.broadcast({ type: 'story-added', data: addedStory, userId: loggedinUser._id })
        res.json(addedStory)
    } catch (err) {
        logger.error('Failed to add story', err)
        res.status(400).send({ err: 'Failed to add story' })
    }
}


export async function updateStory(req, res) {
    try {
        const story = req.body
        const updatedStory = await storyService.update(story)
        res.json(updatedStory)
    } catch (err) {
        logger.error('Failed to update story', err)
        res.status(400).send({ err: 'Failed to update story' })

    }
}

export async function removeStory(req, res) {
    const { loggedinUser } = req
    try {
        const storyId = req.params.id
        const removedId = await storyService.remove(storyId)
        socketService.broadcast({ type: 'story-removed', data: storyId, userId: loggedinUser._id })
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove story', err)
        res.status(400).send({ err: 'Failed to remove story' })
    }
}

export async function addStoryMsg(req, res) {
    const { loggedinUser } = req
    try {
        const storyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser
        }
        const savedMsg = await storyService.addStoryMsg(storyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update story', err)
        res.status(400).send({ err: 'Failed to update story' })

    }
}

export async function removeStoryMsg(req, res) {
    const { loggedinUser } = req
    try {
        const storyId = req.params.id
        const { msgId } = req.params

        const removedId = await storyService.removeStoryMsg(storyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove story msg', err)
        res.status(400).send({ err: 'Failed to remove story msg' })

    }
}


