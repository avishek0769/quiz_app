import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const DOMAIN = "http://localhost:3000";
const socket = io();


export { socket, DOMAIN }
