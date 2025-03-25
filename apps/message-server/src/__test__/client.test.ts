import { expect, test, describe, beforeAll, afterAll } from "@jest/globals";

const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("my awesome project", () => {
    let io, serverSocket, clientSocket;

    beforeAll((done) => {
        clientSocket = new Client(`http://localhost:5005`);
        io.on("connection", (socket) => {
            serverSocket = socket;
        });
        clientSocket.on("connect", ()=>{
            clientSocket.emit('join','adasdasd')
            done()
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
    });

    test("should work", (done) => {
        clientSocket.on("hello", (arg) => {
            expect(arg).toBe("world");
            done();
        });
    });

    test("should work (with ack)", (done) => {
        serverSocket.on("hi", (cb) => {
            cb("hola");
        });
        clientSocket.emit("hi", (arg) => {
            expect(arg).toBe("hola");
            done();
        });
    });
});