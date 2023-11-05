"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritableStreamMessageWriter = void 0;
class WritableStreamMessageWriter {
    constructor(writable) {
        this.writable = writable;
        this.listeners = {
            close: [],
            error: [],
            end: []
        };
        this.writable.on('close', () => {
            this.listeners.close.forEach((listener) => listener());
        });
        this.writable.on('error', (error) => {
            this.listeners.error.forEach((listener) => listener(error));
        });
        this.writable.on('end', () => {
            this.listeners.end.forEach((listener) => listener());
        });
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
    write(data, encoding) {
        return new Promise((resolve, reject) => {
            this.writable.write(data, encoding !== null && encoding !== void 0 ? encoding : 'utf-8', (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    end() {
        this.writable.end();
    }
}
exports.WritableStreamMessageWriter = WritableStreamMessageWriter;
