import express from "express";
import { Messages } from "../models/messageModel.js";
import { Conversation } from "../models/conversationModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js"; // Import `io` and `getReceiverSocketId`

const router = express.Router();

router.post('/send/:id', async (req, res) => {
	try {
	  const message = req.body.message;
	  const { id: receiverId } = req.params;
	  const senderId = req.body.userid;
  
	  let conversation = await Conversation.findOne({
		participants: { $all: [senderId, receiverId] },
	  });
  
	  if (!conversation) {
		conversation = await Conversation.create({
		  participants: [senderId, receiverId],
		});
	  }
  
	  const newMessage = new Messages({
		message,
		senderId,
		receiverId,
	  });
  
	  if (newMessage) {
		conversation.messages.push(newMessage._id);
	  }
  
	  await Promise.all([conversation.save(), newMessage.save()]);
  
	  const receiverSocketId = getReceiverSocketId(receiverId);
	  const senderSocketId = getReceiverSocketId(senderId);
  
	  // Emit the message to both sender and receiver
	  if (io) {
		if (receiverSocketId) {
		  io.to(receiverSocketId).emit("newMessage", newMessage);
		}
		if (senderSocketId) {
		  io.to(senderSocketId).emit("newMessage", newMessage); // Emit to sender as well
		}
	  }
  
	  res.status(201).json(newMessage);
	} catch (error) {
	  console.log("Error in sendMessage controller:", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
  });



router.get("/:id", async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.query.senderId;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
