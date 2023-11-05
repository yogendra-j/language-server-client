import { Writable } from 'stream';
import { Disposable } from 'vscode-jsonrpc';

interface MessageWriter {
    onClose(listener: () => void): Disposable;
    onError(listener: (error: any) => void): Disposable;
    onEnd(listener: () => void): Disposable;
    write(data: Uint8Array): Promise<void>;
    write(data: string, encoding: 'ascii' | 'utf-8'): Promise<void>;
    end(): void;
}

export class WritableStreamMessageWriter implements MessageWriter {
    private listeners: { [type: string]: Function[] } = {
        close: [],
        error: [],
        end: []
    };

    constructor(private writable: Writable) {
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

    write(data: Uint8Array): Promise<void>;
    write(data: string, encoding: 'ascii' | 'utf-8'): Promise<void>;
    write(data: Uint8Array | string, encoding?: 'ascii' | 'utf-8'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.writable.write(data, encoding ?? 'utf-8', (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    end(): void {
        this.writable.end();
    }
}
