import mongoose from 'mongoose';
import Notification from './backend/models/notificationModel.js';
import dotenv from 'dotenv';

dotenv.config();

const checkNotifications = async () => {
    try {
        await mongoose.connect(process.env.DB_LOCAL_URI || process.env.DB_URI);
        console.log('Connected to DB');
        
        const latest = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest 5 Notifications:');
        latest.forEach(n => {
            console.log(`- Title: ${n.title}, Type: ${n.type}, CreatedAt: ${n.createdAt}, userId: ${n.userId}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkNotifications();
