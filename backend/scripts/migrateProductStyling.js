import mongoose from "mongoose";
import { loadEnvironment } from "../config/loadEnv.js";
import connectMongoDatabase from "../config/db.js";
import Product from "../models/productModel.js";

loadEnvironment();

const migrateProductStyling = async () => {
    try {
        await connectMongoDatabase();

        const filter = {
            $or: [
                { style: { $exists: false } },
                { vibe: { $exists: false } },
                { trending: { $exists: false } },
                { style: null },
                { vibe: null },
                { trending: null }
            ]
        };

        const beforeCount = await Product.countDocuments(filter);

        const result = await Product.collection.updateMany(filter, [
            {
                $set: {
                    style: { $ifNull: ["$style", ""] },
                    vibe: { $ifNull: ["$vibe", ""] },
                    trending: { $ifNull: ["$trending", false] }
                }
            }
        ]);

        const afterCount = await Product.countDocuments(filter);

        console.log(
            `[migrateProductStyling] Matched ${beforeCount}, modified ${result.modifiedCount}, remaining ${afterCount}.`
        );
        process.exit(0);
    } catch (error) {
        console.error("[migrateProductStyling] Failed:", error);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

migrateProductStyling();
