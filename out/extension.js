"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
const ollama_1 = require("ollama");
function activate(context) {
    console.log("DeepChat is now active!");
    const disposable = vscode.commands.registerCommand("myExtension.deepChat", () => {
        const panel = vscode.window.createWebviewPanel("deepChat", "Deep Seek Chat", vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "chat") {
                const userPrompt = message.text;
                let responseText = "";
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: "deepseek-r1:latest",
                        messages: [{ role: "user", content: userPrompt }],
                        stream: true,
                    });
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({
                            command: "chatReponse",
                            text: responseText,
                        });
                    }
                }
                catch (error) {
                    panel.webview.postMessage({
                        command: "chatResponse",
                        text: `Error: ${String(error)}`,
                    });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<style>
				body { font-family: sans-serif; margin: 1rem; }
				#prompt { width: 100%; box-sizing: border-box; }
				#response { border: 1px solid #ccc; margin-top: 1rem; padding: 0.5rem; min-height:}
			</style>
			<title>DeepChat</title>
		</head>
		<body>
			<h2>DeepChat</h2>
			<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br/>
			<button id="askBtn">Ask</button>
			<div id="response"></div>

			<script>
				const vscode = acquireVsCodeApi()

				document.getElementById('askBtn').addEventListener("click", () => {
					const text = document.getElementById('prompt').value;
					vscode.postMessage({ command: 'chat', text })
				});

				window.addEventListener('message', event => {
					const { command, text } = event.data;
					if (command === 'chatResponse') {
						document.getElementById('response').innerText = text;
					}
				})
			</script>
		</body>
		</html>
	`;
}
// This method is called when your extension is deactivated
// export function deactivate() {}
//# sourceMappingURL=extension.js.map