import express from "express"
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors"
import http from "http"
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: "./.env"
})

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ message });
}

const app = express();
const server = http.createServer(app)
const io = new Server(server);
app.locals.io = io;
let currentQuestionIndex = {};
let timeLeft = {};
const quizTimers = {};
let quiz = {};
const topics = {
    gk: 9,
    cs: 18,
    maths: 19,
    sports: 21,
    geo: 22,
    anime: 31
}

io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
        if (!data.admin) {
            io.to(data.roomID).emit("newUser", data.user)
        }
        socket.join(data.roomID);
    })
    socket.on("leftRoom", ({ roomID, userID }) => {
        io.to(roomID).emit("userLeft", userID);
    })
    
    socket.on("joinQuiz", ({roomID, topic}) => {
        socket.join(roomID);        
        try {
            socket.emit("currentQuestion", {
                question: quiz[roomID][currentQuestionIndex[roomID]].question,
                options: quiz[roomID][currentQuestionIndex[roomID]].options,
                answer: quiz[roomID][currentQuestionIndex[roomID]].answer,
                qNo: currentQuestionIndex[roomID] + 1,
                timeLeft: timeLeft[roomID],
            });
        } catch (error) {
            io.to(roomID).emit("quizFinishedError");
        }
    })
    socket.on("startQuiz", ({leadID, url, roomID, topic}) => {
        if (!quizTimers[roomID]) {
            //  FETCHING THE QUESTIONS
            try {
                timeLeft[roomID] = 30;
                currentQuestionIndex[roomID] = 0;
                fetch(`https://opentdb.com/api.php?amount=15&category=${topics[topic]}&difficulty=easy&type=multiple`).then(res => res.json())
                .then(data => {
                    let originalData = data
                    quiz[roomID] = originalData.results.map((item, index) => {
                        const options = [...item.incorrect_answers];
                        const correctIndex = Math.floor(Math.random() * (options.length + 1));
                        options.splice(correctIndex, 0, item.correct_answer);
                        
                        return {
                            question: item.question,
                            options: options,
                            answer: `o${correctIndex + 1}`
                        };
                    });
                    io.to(roomID).emit("questionsReadyNowJoin", {leadID, url, topic });
                })
                //  COUNTDOWN AND END COUNTDOWN
                setTimeout(() => {
                    quizTimers[roomID] = setInterval(() => {
                        io.to(roomID).emit("countDown", timeLeft[roomID]);
                        timeLeft[roomID]--;
                        
                        if (timeLeft[roomID] < 0) {
                            timeLeft[roomID] = 30;
                            currentQuestionIndex[roomID]++;
        
                            if (currentQuestionIndex[roomID] >= quiz[roomID].length) {
                                clearInterval(quizTimers[roomID]);
                                io.to(roomID).emit("quizEnd");
                                delete currentQuestionIndex[roomID];
                                delete quizTimers[roomID];
                                delete timeLeft[roomID];
                                delete quiz[roomID];
                                
                                io.to(roomID).emit("navigateToLead"); // NAVIGATE TO LEADERBOARD
                            }
                            else {
                                io.to(roomID).emit("newQuestion", {
                                    question: quiz[roomID][currentQuestionIndex[roomID]].question,
                                    options: quiz[roomID][currentQuestionIndex[roomID]].options,
                                    answer: quiz[roomID][currentQuestionIndex[roomID]].answer,
                                    qNo: currentQuestionIndex[roomID] + 1
                                });
                            }
                        }
                    }, 1000);
                }, 3000);
            }
            catch (error) {
                io.to(roomID).emit("quizFinishedError");
            }
        }
        else {
            socket.emit("currentQuestion", {
                question: quiz[roomID][currentQuestionIndex[roomID]].question,
                options: quiz[roomID][currentQuestionIndex[roomID]].options,
                answer: quiz[roomID][currentQuestionIndex[roomID]].answer,
                qNo: currentQuestionIndex[roomID] + 1,
                timeLeft: timeLeft[roomID],
            });
        }
    });

    socket.on("disposeCall", (roomID)=>{
        socket.to(roomID).emit("dispose")
    })

    socket.on("nextQuestion", (roomID)=>{
        currentQuestionIndex[roomID]++;
        timeLeft[roomID] = 30;
        if(currentQuestionIndex[roomID] >= quiz[roomID].length){
            clearInterval(quizTimers[roomID]);
            delete currentQuestionIndex[roomID];
            delete quizTimers[roomID];
            delete timeLeft[roomID];
            delete quiz[roomID];
            io.to(roomID).emit("navigateToLead");
        }
        else{
            io.to(roomID).emit("newQuestion", {
                question: quiz[roomID][currentQuestionIndex[roomID]].question,
                options: quiz[roomID][currentQuestionIndex[roomID]].options,
                answer: quiz[roomID][currentQuestionIndex[roomID]].answer,
                qNo: currentQuestionIndex[roomID] + 1
            });
        }
    })

    socket.on("buffer", (roomID)=>{
        io.to(roomID).emit("bufferEveryone")
    })

    socket.on("pushObjectInLead", ({ roomID, leadID})=>{
        socket.to(roomID).emit("pushUser", leadID);
    })
    socket.on("firstAnswer", ({ roomID, fullname })=>{
        io.to(roomID).emit("firstUserToAns", fullname)
    })

    // FRIEND REQUESTS LOGIC
    socket.on("sendFrndReq", (data)=>{
        socket.to(data.socketID).emit("frndReq", data.currentUser);
    })
    
    socket.on("inviteEmit", (data)=>{
        socket.to(data.socketId).emit("invitation", data);
    })

})

// Some important configurations for every requests`
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())
app.use(express.static("./public"));

// Files serving
app.get("/:slug", (req, res) => {
    res.sendFile(`${req.params.slug}.html`, { root: `${__dirname}/public/` })
})
app.get("/health", (req, res) => {
    res.status(200).json({message: "Everything is good 😁"})
})

// Routes
import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/user", userRouter)

import roomRouter from "./src/routes/room.routes.js";
app.use("/api/v1/room", roomRouter);

import leaderboardRouter from "./src/routes/leaderboard.routes.js";
app.use("/api/v1/leaderboard", leaderboardRouter)

import notiRouter from "./src/routes/notification.routes.js";
app.use("/api/v1/notification", notiRouter)

app.use(errorHandler)

// Server running and DB connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(db => {
    console.log("Database Connected !!");
    server.listen(3000, () => {
        console.log("Server running at 3000");
    })
})