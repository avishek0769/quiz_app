import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const DOMAIN = "https://r51klsgs-3000.inc1.devtunnels.ms";
const socket = io();

const alerts = (message)=>{
    const div = document.createElement("div")
    div.classList.add("py-3", "px-5", "rounded-xl", "font-semibold", "text-sm", "text-white", "animate-slide-down", "border", "border-accent/20", "shadow-glow");
    div.style.background = "rgba(168, 85, 247, 0.15)";
    div.style.backdropFilter = "blur(16px)";
    div.style.webkitBackdropFilter = "blur(16px)";
    div.innerHTML = message
    document.getElementById("alertDiv").insertAdjacentElement("beforeend", div)
    setTimeout(() => {
        div.remove();
    }, 3000);
}


export { socket, DOMAIN, alerts }
