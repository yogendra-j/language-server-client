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
            rootUri: '/mnt/c/Users/yogendra/code-aid',
            capabilities: {},
            workspaceFolders: null
        };
        // Start listening to the LSP server
        connection.listen();
        const initResult = yield connection.sendRequest(lsp.InitializeRequest.type, initializeParams);
        // Handle the capabilities provided by the server
        // console.log(initResult.capabilities);
        // open file
        const openParams = {
            textDocument: {
                uri: '/mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java',
                languageId: 'java',
                version: 1,
                text: `
            package co.incubyte;

import co.incubyte.diagram.DiagramGenerator;
import co.incubyte.documentgenerator.MarkdownGenerator;
import co.incubyte.embeddings.EmbeddingService;
import co.incubyte.filesystem.FileServiceException;
import io.micronaut.configuration.picocli.PicocliRunner;
import io.micronaut.context.annotation.Value;
import io.micronaut.logging.LogLevel;
import io.micronaut.logging.LoggingSystem;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

@Command(name = "code-aid", description = "...", mixinStandardHelpOptions = true)
public class CodeAidCommand implements Runnable {

  private static final Logger logger = LoggerFactory.getLogger(CodeAidCommand.class);
  @Option(names = { "-v", "--verbose" }, description = "...")
  boolean verbose;
  @Value("\${args.input}")
  @Option(names = { "-i", "--input" }, description = "Input Directory")
  String input;
  @Value("\${args.output}")
  @Option(names = { "-o", "--output" }, description = "Output Directory")
  String output;
  @Value("\${args.include}")
  @Option(names = { "--include" }, description = "..")
  String filter;
  @Option(names = { "--estimate-cost", "-ec" }, description = "Estimate cost of query.")
  boolean estimateCost;
  @Option(names = { "-l",
      "--log" }, defaultValue = "INFO", description = "Log level, available: TRACE, DEBUG, INFO, "
          + "WARN, ERROR")
  String logLevel;
  @Inject
  private MarkdownGenerator markdownGenerator;
  @Inject
  private LoggingSystem loggingSystem;
  @Inject
  private EmbeddingService embeddingService;
  @Inject
  private DiagramGenerator diagramGenerator;

  public CodeAidCommand() {
  }

  public CodeAidCommand(boolean verbose, String input, String output,
      MarkdownGenerator markdownGenerator, String filter, String logLevel,
      LoggingSystem loggingSystem, EmbeddingService embeddingService,
      final DiagramGenerator diagramGenerator) {
    this.verbose = verbose;
    this.input = input;
    this.output = output;
    this.markdownGenerator = markdownGenerator;
    this.filter = filter;
    this.logLevel = logLevel;
    this.loggingSystem = loggingSystem;
    this.embeddingService = embeddingService;
    this.diagramGenerator = diagramGenerator;
  }

  public static void main(String[] args) {
    PicocliRunner.run(CodeAidCommand.class, args);
  }

  public void run() {
    loggingSystem.setLogLevel(Logger.ROOT_LOGGER_NAME, LogLevel.valueOf(logLevel));
    if (verbose) {
      logger.info("input: {}", input);
      logger.info("output: {}", output);
    }
    if (estimateCost) {
      double estimatedCost = markdownGenerator.aiMarkdownGenerator.estimateCost(input, filter);
      logger.info("Estimated cost: {}", estimatedCost);
      return;
    }
    markdownGenerator.generate(input, output, filter);
    embeddingService.save(output, filter);
    diagramGenerator.generateHierarchicalJson(output);
  }

  public void generate(String inputDir, String outputDir, String filter, int i) {
    try {
    } catch (FileServiceException e) {
      logger.error(e.getMessage());
    }
  }
}

            `
            }
        };
        yield connection.sendNotification(lsp.DidOpenTextDocumentNotification.type, openParams);
        // send get definition request at 80:27 for file /mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java
        const definitionParams = {
            textDocument: {
                uri: '/mnt/c/Users/yogendra/code-aid/src/main/java/co/incubyte/codeaid/CodeAidApplication.java'
            },
            position: {
                line: 80,
                character: 27
            }
        };
        const definitionResult = yield connection.sendRequest(lsp.DefinitionRequest.type, definitionParams);
        console.log('definitionResult');
        console.log(definitionResult);
        // Remember to listen for errors and close the connection properly
        connection.onError((e) => console.error(e));
        connection.onClose(() => console.log('Connection closed'));
    });
}
const lspPath = '/home/yjaiswal/language-server/bin/jdtls';
startLspClient(lspPath).catch(console.error);
