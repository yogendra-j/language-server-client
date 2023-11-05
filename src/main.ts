import * as child_process from 'child_process';
import * as lsp from 'vscode-languageserver-protocol';
import * as rpc from 'vscode-jsonrpc';
import { ReadableStreamMessageReader } from './message_reader';
import { WritableStreamMessageWriter } from './message_writer';

async function startLspClient(lspPath: string) {
    // Start the LSP server process
    const lspProcess = child_process.spawn(lspPath);
    lspProcess.on('error', (e) => console.error(e));
    lspProcess.stderr.on('data', (chunk: Buffer) => {
        // If you know the actual encoding, specify it here
        console.error(chunk.toString('utf8')); // or 'ascii', 'utf16le', etc.
    });

    // Create a message reader and a message writer to communicate with the LSP server
    const reader = new lsp.ReadableStreamMessageReader(new ReadableStreamMessageReader(lspProcess.stdout, lspProcess.stderr));
    const writer = new lsp.WriteableStreamMessageWriter(new WritableStreamMessageWriter(lspProcess.stdin));

    // Create the JSON-RPC connection
    const connection = rpc.createMessageConnection(reader, writer);

    // Initialize the LSP connection
    const initializeParams: lsp.InitializeParams = {
        processId: process.pid,
        rootUri: '/mnt/c/Users/yogendra/code-aid',
        capabilities: {}, // fill in the client capabilities
        workspaceFolders: null
    };
    // Start listening to the LSP server
    connection.listen();

    const initResult = await connection.sendRequest(lsp.InitializeRequest.type, initializeParams);

    // Handle the capabilities provided by the server
    // console.log(initResult.capabilities);

    // send get definition request at 80:27 for file /mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java
    const definitionParams: lsp.TextDocumentPositionParams = {
        textDocument: {
            uri: '/mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java'
        },
        position: {
            line: 80,
            character: 27
        }
    };
    const definitionResult = await connection.sendRequest(lsp.DefinitionRequest.type, definitionParams);
    console.log('definitionResult');
    console.log(definitionResult);

    // Remember to listen for errors and close the connection properly
    connection.onError((e) => console.error(e));
    connection.onClose(() => console.log('Connection closed'));


}

const lspPath = '/home/yjaiswal/language-server/bin/jdtls';
startLspClient(lspPath).catch(console.error);
