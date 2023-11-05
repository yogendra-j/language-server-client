"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = __importStar(require("child_process"));
const lsp = __importStar(require("vscode-languageserver-protocol"));
const rpc = __importStar(require("vscode-jsonrpc"));
const message_reader_1 = require("./message_reader");
const message_writer_1 = require("./message_writer");
function startLspClient(lspPath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Start the LSP server process
        const lspProcess = child_process.spawn(lspPath);
        lspProcess.on('error', (e) => console.error(e));
        lspProcess.stderr.on('data', (chunk) => {
            // If you know the actual encoding, specify it here
            console.error(chunk.toString('utf8')); // or 'ascii', 'utf16le', etc.
        });
        // Create a message reader and a message writer to communicate with the LSP server
        const reader = new lsp.ReadableStreamMessageReader(new message_reader_1.ReadableStreamMessageReader(lspProcess.stdout, lspProcess.stderr));
        const writer = new lsp.WriteableStreamMessageWriter(new message_writer_1.WritableStreamMessageWriter(lspProcess.stdin));
        // Create the JSON-RPC connection
        const connection = rpc.createMessageConnection(reader, writer);
        // Initialize the LSP connection
        const initializeParams = {
            processId: process.pid,
            rootUri: null,
            capabilities: {
                textDocument: {
                    definition: {
                        dynamicRegistration: false
                    }
                },
            },
            workspaceFolders: null
        };
        // Start listening to the LSP server
        connection.listen();
        const initResult = yield connection.sendRequest(lsp.InitializeRequest.type, initializeParams);
        // Handle the capabilities provided by the server
        console.log(initResult.capabilities);
        // const didOpenParams: lsp.DidOpenTextDocumentParams = {
        //     textDocument: {
        //         uri: '/home/yjaiswal/code-aid',
        //         languageId: 'java', // The language id.
        //         version: 1, // The version of the document (it will increase after each change, including undo/redo).
        //         text: '' // The content of the document.
        //     }
        // };
        // const opened = await connection.sendNotification(lsp.DidOpenTextDocumentNotification.type, didOpenParams);
        // console.log('didOpenParams');
        // console.log(opened);
        // send get definition request at 80:27 for file /mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java
        const definitionParams = {
            textDocument: {
                uri: 'file:///home/yjaiswal/code-aid/src/main/java/co/incubyte/CodeAidCommand.java'
            },
            position: {
                line: 80,
                character: 20
            }
        };
        const definitionResult = yield connection.sendRequest(lsp.DefinitionRequest.type, definitionParams);
        console.log('definitionResult');
        console.log(JSON.stringify(definitionResult));
        // Remember to listen for errors and close the connection properly
        connection.onError((e) => console.error(e));
        connection.onClose(() => console.log('Connection closed'));
    });
}
const lspPath = '/home/yjaiswal/language-server/bin/jdtls';
startLspClient(lspPath).catch(console.error);
