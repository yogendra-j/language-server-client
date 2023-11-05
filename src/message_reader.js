"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadableStreamMessageReader = void 0;
class ReadableStreamMessageReader {
    constructor(readable, error) {
        this.readable = readable;
        this.error = error;
        this.listeners = {
            data: [],
            close: [],
            error: [],
            end: []
        };
        this.readable.on('data', (chunk) => {
            this.listeners.data.forEach((listener) => listener(chunk));
        });
        this.readable.on('close', () => {
            this.listeners.close.forEach((listener) => listener());
        });
        this.readable.on('error', (error) => {
            this.listeners.error.forEach((listener) => listener(error));
        });
        this.readable.on('end', () => {
            this.listeners.end.forEach((listener) => listener());
        });
        this.error.on('data', (error) => {
            this.listeners.error.forEach((listener) => listener(error));
        });
    }
    onData(listener) {
        this.listeners.data.push(listener);
        return {
            dispose: () => {
                this.listeners.data = this.listeners.data.filter((l) => l !== listener);
            },
        };
    }
    onClose(listener) {
        this.listeners.close.push(listener);
        return {
            dispose: () => {
                this.listeners.close = this.listeners.close.filter((l) => l !== listener);
            },
        };
    }
    onError(listener) {
        this.listeners.error.push(listener);
        return {
            dispose: () => {
                this.listeners.error = this.listeners.error.filter((l) => l !== listener);
            },
        };
    }
    onEnd(listener) {
        this.listeners.end.push(listener);
        return {
            dispose: () => {
                this.listeners.end = this.listeners.end.filter((l) => l !== listener);
            },
        };
    }
    listen(callback) {
        this.onData(callback);
    }
}
exports.ReadableStreamMessageReader = ReadableStreamMessageReader;
