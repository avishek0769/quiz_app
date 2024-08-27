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
let currentQuestionIndex = 0;
let timeLeft = 30;
const quizTimers = {};

let quiz;

io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
        socket.join(data.roomID);
        if (!data.admin) {
            io.to(data.roomID).emit("newUser", data.user)
        }
    })
    socket.on("leftRoom", ({ roomID, userID }) => {
        io.to(roomID).emit("userLeft", userID);
    })
    socket.on("navigate", ({ url, roomID, topic }) => {
        io.to(roomID).emit("navigateParts", { url, topic });
    })
    socket.on("joinQuiz", ({roomID, topic}) => {
        if(topic == "meme"){
            quiz = [
                {
                    question: "No 1 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 2 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 3 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 4 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 5 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 6 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 7 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 8 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 9 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 10 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                }
            ]
        }
        else{
            quiz = [
                {
                    question: "What country has the highest life expectancy?",
                    options: ["Hong Kong", "China", "Japan", "France"],
                    answer: "o1"
                },
                {
                    question: "Which language has the more native speakers?",
                    options: ["English", "Spanish", "Portuguese", "Russian"],
                    answer: "o2"
                },
                {
                    question: "Which planet in our solar system has the highest mountain?",
                    options: ["Earth", "Venus", "Mars", "Mercury"],
                    answer: "o3"
                },
                {
                    question: "What is the name of the second-largest moon of Saturn?",
                    options: ["Titan", "Rhea", "Iapetus", "Enceladus"],
                    answer: "o2"
                },
                {
                    question: "Which state-owned company was founded by Adolf Hitler's party in May 1937 and is known as 'The People's Car Company'?",
                    options: ["Mercedes-Benz", "Volkswagen", "BMW", "Porsche"],
                    answer: "o2"
                },
                {
                    question: "Which country was the first to abolish slavery?",
                    options: ["Haiti", "Brazil", "United States", "United Kingdom"],
                    answer: "o1"
                },
                {
                    question: "What is the primary purpose of the United Nations?",
                    options: ["To promote global trade", "To provide international aid", "To regulate global climate", "To maintain international peace and security"],
                    answer: "o4"
                },
                {
                    question: "Which ancient civilization is known for creating the first known system of writing?",
                    options: ["Sumerians", "Ancient Egyptians", "Ancient Greeks", "Indus Valley Civilization"],
                    answer: "o1"
                },
                {
                    question: "What is the concept of 'civil disobedience' best associated with?",
                    options: ["Martin Luther King Jr.", "Mahatma Gandhi", "Nelson Mandela", "Abraham Lincoln"],
                    answer: "o2"
                },
                {
                    question: "Which historical event led to the establishment of the United Nations?",
                    options: ["World War I", "World War II", "The Cold War", "The Korean War"],
                    answer: "o2"
                },
                {
                    question: "What is a group of pandas called?",
                    options: ["Pack", "Herd", "Embarrassment", "Clowder"],
                    answer: "o3"
                },
                {
                    question: "What type of bond involves the sharing of electron pairs between atoms?",
                    options: ["Ionic Bond", "Covalent Bond", "Hydrogen Bond", "Metallic Bond"],
                    answer: "o2"
                },
                {
                    question: "Which gas is most abundant in Earth's atmosphere?",
                    options: ["Oxygen", "Carbon Dioxide", "Argon", "Nitrogen"],
                    answer: "o4"
                },
                {
                    question: "What was the name of the atomic bomb dropped on Hiroshima during World War II?",
                    options: ["Fat Man", "Little Boy", "Big Boy", "Tall Man"],
                    answer: "o2"
                },
                {
                    question: "What is the pH level of pure water?",
                    options: ["7", "8", "9", "10"],
                    answer: "o1"
                }
            ]
        }

        socket.join(roomID);
        socket.emit("currentQuestion", {
            question: quiz[currentQuestionIndex].question,
            options: quiz[currentQuestionIndex].options,
            answer: quiz[currentQuestionIndex].answer,
            qNo: currentQuestionIndex + 1,
            timeLeft: timeLeft,
        });
    })
    socket.on("startQuiz", ({roomID, topic}) => {
        if(topic == "meme"){
            quiz = [
                {
                    question: "No 1 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 2 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 3 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 4 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 5 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 6 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 7 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 8 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 9 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                },
                {
                    question: "No 10 dummy Question of meme",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    answer: "o2"
                }
            ]
        }
        else{
            quiz = [
                {
                    question: "What country has the highest life expectancy?",
                    options: ["Hong Kong", "China", "Japan", "France"],
                    answer: "o1"
                },
                {
                    question: "Which language has the more native speakers?",
                    options: ["English", "Spanish", "Portuguese", "Russian"],
                    answer: "o2"
                },
                {
                    question: "Which planet in our solar system has the highest mountain?",
                    options: ["Earth", "Venus", "Mars", "Mercury"],
                    answer: "o3"
                },
                {
                    question: "What is the name of the second-largest moon of Saturn?",
                    options: ["Titan", "Rhea", "Iapetus", "Enceladus"],
                    answer: "o2"
                },
                {
                    question: "Which state-owned company was founded by Adolf Hitler's party in May 1937 and is known as 'The People's Car Company'?",
                    options: ["Mercedes-Benz", "Volkswagen", "BMW", "Porsche"],
                    answer: "o2"
                },
                {
                    question: "Which country was the first to abolish slavery?",
                    options: ["Haiti", "Brazil", "United States", "United Kingdom"],
                    answer: "o1"
                },
                {
                    question: "What is the primary purpose of the United Nations?",
                    options: ["To promote global trade", "To provide international aid", "To regulate global climate", "To maintain international peace and security"],
                    answer: "o4"
                },
                {
                    question: "Which ancient civilization is known for creating the first known system of writing?",
                    options: ["Sumerians", "Ancient Egyptians", "Ancient Greeks", "Indus Valley Civilization"],
                    answer: "o1"
                },
                {
                    question: "What is the concept of 'civil disobedience' best associated with?",
                    options: ["Martin Luther King Jr.", "Mahatma Gandhi", "Nelson Mandela", "Abraham Lincoln"],
                    answer: "o2"
                },
                {
                    question: "Which historical event led to the establishment of the United Nations?",
                    options: ["World War I", "World War II", "The Cold War", "The Korean War"],
                    answer: "o2"
                },
                {
                    question: "What is a group of pandas called?",
                    options: ["Pack", "Herd", "Embarrassment", "Clowder"],
                    answer: "o3"
                },
                {
                    question: "What type of bond involves the sharing of electron pairs between atoms?",
                    options: ["Ionic Bond", "Covalent Bond", "Hydrogen Bond", "Metallic Bond"],
                    answer: "o2"
                },
                {
                    question: "Which gas is most abundant in Earth's atmosphere?",
                    options: ["Oxygen", "Carbon Dioxide", "Argon", "Nitrogen"],
                    answer: "o4"
                },
                {
                    question: "What was the name of the atomic bomb dropped on Hiroshima during World War II?",
                    options: ["Fat Man", "Little Boy", "Big Boy", "Tall Man"],
                    answer: "o2"
                },
                {
                    question: "What is the pH level of pure water?",
                    options: ["7", "8", "9", "10"],
                    answer: "o1"
                }
            ]
        }

        if (!quizTimers[roomID]) {
            quizTimers[roomID] = setInterval(() => {
                io.to(roomID).emit("countDown", timeLeft);
                timeLeft--;

                if (timeLeft < 0) {
                    timeLeft = 30;
                    currentQuestionIndex++;

                    if (currentQuestionIndex >= quiz.length) {
                        clearInterval(quizTimers[roomID]);
                        io.to(roomID).emit("quizEnd");
                        currentQuestionIndex = 0;
                        delete quizTimers[roomID];
                        // NAVIGATE TO LEADERBOARD
                        io.to(roomID).emit("navigateToLead");
                    }
                    else {
                        io.to(roomID).emit("newQuestion", {
                            question: quiz[currentQuestionIndex].question,
                            options: quiz[currentQuestionIndex].options,
                            answer: quiz[currentQuestionIndex].answer,
                            qNo: currentQuestionIndex + 1
                        });
                    }
                }
            }, 1000);
        }
        else {
            socket.emit("currentQuestion", {
                question: quiz[currentQuestionIndex].question,
                options: quiz[currentQuestionIndex].options,
                answer: quiz[currentQuestionIndex].answer,
                qNo: currentQuestionIndex + 1,
                timeLeft: timeLeft,
            });
        }
    });

    socket.on("nextQuestion", (roomID)=>{
        currentQuestionIndex++;
        timeLeft = 30;
        if(currentQuestionIndex >= quiz.length){
            clearInterval(quizTimers[roomID]);
            currentQuestionIndex = 0;
            delete quizTimers[roomID];
            io.to(roomID).emit("navigateToLead");
        }
        else{
            io.to(roomID).emit("newQuestion", {
                question: quiz[currentQuestionIndex].question,
                options: quiz[currentQuestionIndex].options,
                answer: quiz[currentQuestionIndex].answer,
                qNo: currentQuestionIndex + 1
            });
        }
    })

    socket.on("pushObjectInLead", ({ roomID, leadID})=>{
        socket.to(roomID).emit("pushUser", leadID);
    })
    socket.on("firstAnswer", ({ roomID, fullname })=>{
        io.to(roomID).emit("firstUserToAns", fullname)
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
app.use(errorHandler)

// Files serving
app.get("/:slug", (req, res) => {
    if(req.params.slug == "health"){
        res.status(200).json({message: "Everything is good 😁"})
    }
    else{
        res.sendFile(`${req.params.slug}.html`, { root: `${__dirname}/public/` })
    }
})

// Routes
import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/user", userRouter)

import roomRouter from "./src/routes/room.routes.js";
app.use("/api/v1/room", roomRouter);

import leaderboardRouter from "./src/routes/leaderboard.routes.js";
app.use("/api/v1/leaderboard", leaderboardRouter)

// Server running and DB connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(db => {
    console.log("Database Connected !!");
    server.listen(3000, () => {
        console.log("Server running at 3000");
    })
})