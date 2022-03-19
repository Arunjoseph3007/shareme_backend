const router = require("express").Router();
const Message = require('../models/Message')

//Create a message
router.post('/',async (req,res) => {
	const newMessage = new Message(req.body)

	try{
		const savedMessage = await newMessage.save();
		res.status(200).json(savedMessage)
	}catch(error){
		res.status(500).json(error)
	}
})

//Get messages from a conversation
router.get('/:conversationId',async (req,res) => {
	try{

		const message = await Message.find({conversationId: req.params.conversationId}).limit(100).sort({createdAt:1});
		res.status(200).json(message)
	}catch(error){
		res.status(500).json(error)
	}
})


module.exports=router