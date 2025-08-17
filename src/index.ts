import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { compare, hash } from "bcrypt"
import db from "./dbClient.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { createConversation, queryFunc } from "./generalised.js";


configDotenv();

const app = express();
app.use(cors());
app.use(express.json());

const verify = async(req : Request,res : Response,next : NextFunction) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1] || " ";

    jwt.verify(token,process.env.HASH_SECRET!,(err,decoded) => {
        if(err){
            return res.status(402).json({msg : "login again "});
        }
        else {
            //@ts-ignore
            req.body.userId = decoded.userId;
            next();
        }
    })
}

app.post('/signup', async (req : Request, res : Response) => {

    try {
        const { email, name, password } = req.body;

        const userExists = await db.user.findFirst({
            where: {
                email
            }
        })

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
            })
            return res.status(200).json({ msg: "User created Succesfully" });
        }
    } catch (e) {
        return res.status(401).json({ msg: "Server Error! try again later" });
    }
})

app.post('/login', async(req : Request, res : Response) => {
    try{
        const {email,password} = req.body;
        const userData = await db.user.findFirst({
            where : {
                email
            }
        })

        if(!userData) return res.status(402).json({msg : "no such user exists"});
        else {
            const isPasswordCorrect = await compare(password,userData.password);

            if(isPasswordCorrect){
                const token = jwt.sign({userId : userData.id, userEmail : userData.email },process.env.HASH_SECRET!,{ expiresIn: "7d" });
                return res.status(200).json({msg : "user logged in", token : token});
            }
            else return res.status(402).json({msg : "wrong password"});
        }
    }catch(e){
        console.log(e);
        return res.status(402).json({msg : "unable to login! try again later"});
    }
})
app.post('/new',verify, async(req : Request, res : Response) => {

    const { userId } = req.body;

    const result = await createConversation(userId);

    if(result){
        return res.status(200).json({conversationId : result});
    }
    else return res.status(402).json({msg : "unable to create"});
})

app.post('/query',verify,async(req : Request, res : Response) => {

    const { query, userId, docId } = req.body;
    const result = await queryFunc(query,userId,docId);

    return res.status(200).json({
        msg : result.msg
    })

})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`hi there! listening on port : ${PORT}`);
})
