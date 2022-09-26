// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// @ts-ignore
const isGeoJSONValid = require('geojson-is-valid');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "geojson-preview" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('geojson-preview.preview', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from GeoJSON Preview!');
		
		const content = vscode.window.activeTextEditor?.document.getText();
		if (!content) {
			return vscode.window.showErrorMessage('empty file');
		}

		try {
			JSON.parse(content);
		} catch (error) {
			return vscode.window.showErrorMessage('invalid JSON file');
		}

		if (!isGeoJSONValid(content)) {
			return vscode.window.showErrorMessage('invalid GeoJSON file');
		}

		// Create and show panel
		const panel = vscode.window.createWebviewPanel(
			'geoJSONPreview',
			'GeoJSON Preview',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		// And set its HTML content
		panel.webview.html = getWebviewContent(content);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function getWebviewContent(geoJSON: string) {
	return `<!DOCTYPE html>
	<html lang="en">
	
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>GeoJSON Preview</title>
	
		<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css"
			integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin="" />
	
		<script src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js"
			integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s=" crossorigin=""></script>
	
		<style>
			#map {
				width: 100vw;
				height: 100vh;
			}
		</style>
	</head>
	
	<body>
		<div id="map"></div>
	
		<script>
			var map = L.map('map').setView([1.1199440590508158, 104.04821455478667], 12);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '© OpenStreetMap'
			}).addTo(map);
	
			var geojsonFeature = ${geoJSON};
			const feature = L.geoJSON(geojsonFeature).addTo(map);
			map.fitBounds(feature.getBounds());
		</script>
	</body>
	
	</html>`;
}
