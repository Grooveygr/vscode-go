/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import cp = require('child_process');
import path = require('path');
import vscode = require('vscode');

import { getGoRuntimePath } from './goPath';
import { outputChannel } from './goStatus';

/**
 * If current active editor has a Go file, returns the editor.
 */
function checkActiveEditor(): vscode.TextEditor {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('Cannot run go generate. No editor selected.');
		return;
	}
	if (!editor.document.fileName.endsWith('.go')) {
		vscode.window.showInformationMessage('Cannot run go generate. File in the editor is not a Go file.');
		return;
	}
	if (editor.document.isDirty) {
		vscode.window.showInformationMessage('File has unsaved changes. Save and try again.');
		return;
	}
	return editor;
}


export function generateDir(): void {
	let editor = checkActiveEditor();
	if (!editor) {
		return;
	}
	let dir = path.dirname(editor.document.uri.fsPath);
	return generate(dir);
}

function generate(path: string): void {
	outputChannel.clear();
	outputChannel.show();

	let proc = cp.spawn(getGoRuntimePath(), ['generate'], { env: process.env, cwd: path });
	proc.stdout.on('data', chunk => outputChannel.append(chunk.toString()));
	proc.stderr.on('data', chunk => outputChannel.append(chunk.toString()));
	proc.on('close', code => outputChannel.append('[Generate exited with code ' + code + ']'));
}