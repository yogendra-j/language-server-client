import { Readable } from "stream";
import { Disposable } from "vscode-jsonrpc";

interface MessageReader {
    onData(listener: (data: Uint8Array) => void): Disposable;
    onClose(listener: () => void): Disposable;
    onError(listener: (error: any) => void): Disposable;
    onEnd(listener: () => void): Disposable;
}

export class ReadableStreamMessageReader implements MessageReader {
    private listeners: { [type: string]: Function[] } = {
        data: [],
        close: [],
        error: [],
        end: []
    };

    constructor(private readable: Readable, private error: Readable) {
        this.readable.on('data', (chunk: Buffer) => {
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

    onData(listener: (data: Uint8Array) => void): Disposable {
        this.listeners.data.push(listener);
        return {
            dispose: () => {
                this.listeners.data = this.listeners.data.filter((l) => l !== listener);
            },
        };
    }

    onClose(listener: () => void): Disposable {
        this.listeners.close.push(listener);
        return {
            dispose: () => {
                this.listeners.close = this.listeners.close.filter((l) => l !== listener);
            },
        };
    }

    onError(listener: (error: any) => void): Disposable {
        this.listeners.error.push(listener);
        return {
            dispose: () => {
                this.listeners.error = this.listeners.error.filter((l) => l !== listener);
            },
        };
    }

    onEnd(listener: () => void): Disposable {
        this.listeners.end.push(listener);
        return {
            dispose: () => {
                this.listeners.end = this.listeners.end.filter((l) => l !== listener);
            },
        };
    }

    listen(callback: (data: any) => void): void {
        this.onData(callback as any);
    }
}
