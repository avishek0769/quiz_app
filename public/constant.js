import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const DOMAIN = "http://192.168.1.37:3000";
const socket = io();

const alerts = (message)=>{
    const div = document.createElement("div")
    div.classList.add("bg-[#a66ffe]", "p-3", "rounded-lg", "font-bold");
    div.innerHTML = message
    document.getElementById("alertDiv").insertAdjacentElement("beforeend", div)
    setTimeout(() => {
        div.remove();
    }, 3000);
}


export { socket, DOMAIN, alerts }
