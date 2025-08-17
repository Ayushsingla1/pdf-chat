import express from "express";
import cors from "cors";
import { compare, hash } from "bcrypt";
import db from "./dbClient.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { addDocuments, createConversation, queryFunc } from "./generalised.js";
import multer from "multer";
configDotenv();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const verify = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log(authHeader);
    const token = authHeader?.split(" ")[1] || " ";
    console.log(token);
    jwt.verify(token, process.env.HASH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(402).json({ msg: "login again " });
        }
        else {
            console.log("verified");
            //@ts-ignore
            req.userId = decoded.userId;
            next();
        }
    });
};
app.post('/signup', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const userExists = await db.user.findFirst({
            where: {
                email
            }
        });
        if (userExists) {
            return res.status(402).json({ msg: "Email already exists" });
        }
        else {
            const hashedPassword = await hash(password, 10);
            await db.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword
                }
            });
            return res.status(200).json({ msg: "User created Succesfully" });
        }
    }
    catch (e) {
        return res.status(401).json({ msg: "Server Error! try again later" });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await db.user.findFirst({
            where: {
                email
            }
        });
        if (!userData)
            return res.status(402).json({ msg: "no such user exists" });
        else {
            const isPasswordCorrect = await compare(password, userData.password);
            if (isPasswordCorrect) {
                const token = jwt.sign({ userId: userData.id, userEmail: userData.email }, process.env.HASH_SECRET, { expiresIn: "7d" });
                return res.status(200).json({ msg: "user logged in", token: token });
            }
            else
                return res.status(402).json({ msg: "wrong password" });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(402).json({ msg: "unable to login! try again later" });
    }
});
app.post('/new', verify, async (req, res) => {
    const { userId } = req.body;
    const result = await createConversation(userId);
    if (result) {
        return res.status(200).json({ conversationId: result });
    }
    else
        return res.status(402).json({ msg: "unable to create" });
});
app.post('/upload', verify, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const buffer = req.file?.buffer;
    // @ts-ignore
    const response = await addDocuments(new Blob([buffer]), req.userId);
    console.log(response);
    return res.status(200).json({ response });
});
app.post('/query', verify, async (req, res) => {
    const { query, docId } = req.body;
    //@ts-ignore
    const result = await queryFunc(query, req.userId, docId);
    return res.status(200).json({
        msg: result.msg
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`hi there! listening on port : ${PORT}`);
});
//# sourceMappingURL=index.js.map