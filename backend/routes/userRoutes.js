import express from 'express';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

//user login
router.post('/login', async(req,res) => {
    console.log(req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username:user.username }, 'whyDoUWant', { expiresIn: '1h' });
    res.json({ token});
    // res.cookie("jwt",token);
    
});


//user register
router.post('/register',async(req,res) => {
    console.log(req.body);
    const { username, email, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'User ID and password are required' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(401).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword});
    try {
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


//get users
router.get('/users/:id',async(req,res) => {

    try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "username",
            "_id",
        ]);
        return res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})


export default router;