'use strict';

var obsidian = require('obsidian');

var __toCommonJS = (mod) => Object.assign(Object.defineProperty({}, '__esModule', { value: true }), mod);
var main_exports = {};

class HotkeysMvg extends obsidian.Plugin {
    onload() {
        this.addCommand({
            id: 'delete-line',
            name: 'Delete current line',
            editorCallback: (editor) => this.deleteLine(editor),
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'k' }],
        });
        this.addCommand({
            id: 'duplicate-lines-up',
            name: 'Duplicate line(s) up',
            editorCallback: (editor) => this.duplicateLines(editor, 'up'),
            hotkeys: [{ modifiers: ['Alt', 'Shift'], key: 'ArrowUp' }],
        });
        this.addCommand({
            id: 'duplicate-lines-down',
            name: 'Duplicate line(s) down',
            editorCallback: (editor) => this.duplicateLines(editor, 'down'),
            hotkeys: [{ modifiers: ['Alt', 'Shift'], key: 'ArrowDown' }],
        });
    }

    deleteLine(editor) {
        var cursor = editor.getCursor();
        var originalCh = cursor.ch;
        var lineCount = editor.lineCount();

        var fromLine, toLine;
        var sel = editor.getSelection();
        if (sel && sel.indexOf('\n') !== -1) {
            var anchor = editor.getCursor('from');
            var head = editor.getCursor('to');
            fromLine = anchor.line;
            toLine = head.line;
            if (head.ch === 0 && toLine > fromLine) toLine--;
        } else {
            fromLine = cursor.line;
            toLine = cursor.line;
        }

        if (toLine < lineCount - 1) {
            editor.replaceRange('', { line: fromLine, ch: 0 }, { line: toLine + 1, ch: 0 });
        } else if (fromLine > 0) {
            editor.replaceRange('',
                { line: fromLine - 1, ch: editor.getLine(fromLine - 1).length },
                { line: toLine, ch: editor.getLine(toLine).length }
            );
        } else {
            editor.replaceRange('', { line: 0, ch: 0 }, { line: toLine, ch: editor.getLine(toLine).length });
        }

        var newLineCount = editor.lineCount();
        var newLine = Math.min(fromLine, newLineCount - 1);
        var newCh = Math.min(originalCh, editor.getLine(newLine).length);
        editor.setCursor({ line: newLine, ch: newCh });
    }

    duplicateLines(editor, mode) {
        var selectedText = this.getSelectedLines(editor);
        var newString = selectedText.content + '\n';

        if (mode === 'down') {
            editor.replaceRange(newString, selectedText.start, selectedText.start);
        } else {
            if (selectedText.end.line === editor.lastLine()) {
                var newLastLine = editor.getLine(editor.lastLine()) + '\n';
                var anchor = editor.getCursor('anchor');
                var head = editor.getCursor('head');
                editor.setLine(editor.lastLine(), newLastLine);
                editor.setSelection(anchor, head);
                newString = selectedText.content;
            }
            var nextStart = { line: selectedText.end.line + 1, ch: 0 };
            editor.replaceRange(newString, nextStart, nextStart);
        }
    }

    getSelectedLines(editor) {
        if (editor.somethingSelected()) {
            var from = editor.getCursor('from');
            var to = editor.getCursor('to');
            var content = editor.getRange(
                { line: from.line, ch: 0 },
                { line: to.line, ch: editor.getLine(to.line).length }
            );
            return {
                start: { line: from.line, ch: 0 },
                end: { line: to.line, ch: editor.getLine(to.line).length },
                content,
            };
        } else {
            var line = editor.getCursor().line;
            var content = editor.getLine(line);
            return {
                start: { line, ch: 0 },
                end: { line, ch: content.length },
                content,
            };
        }
    }
}

main_exports.default = HotkeysMvg;
module.exports = __toCommonJS(main_exports);
