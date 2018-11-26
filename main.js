/*
 * Copyright (c) 2018 Peter Flynn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
const {Artboard} = require("scenegraph");
const Viewport = require("viewport");

const DIALOG_CANCELED = "reasonCanceled";

var candidates;
var filtered;

function escape(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function gatherCandidates(root) {
    candidates = root.children.filter(node => node instanceof Artboard);
}

function updateList(filterText) {
    filterText = filterText.toLowerCase();
    filtered = candidates.filter(node => node.name.toLowerCase().indexOf(filterText) !== -1);
    filtered = filtered.slice(0, 5);

    var listItemsHTML = "";
    filtered.forEach(node => {
        listItemsHTML +=  `<div>${escape(node.name)}</div>`;
    });
    document.getElementById("list").innerHTML = listItemsHTML;
}

function quickNav(selection, root) {
    var dialog = document.createElement("dialog");
    dialog.innerHTML = `
        <style>
        .row {
            display: flex;
            align-items: center;
        }
        #list {
            padding-top: 8px;
            width: 300px;
        }
        #list div {
            height: 35px;
            padding: 5px;
            font-size: 12px;
        }
        </style>
        <form method="dialog">
            <h1>Artboard QuickNav</h1>
            <hr>
            <div class="row">
                <input type="text" uxp-quiet="true" id="input" />
            </div>
            <div id="list">
                <!-- since dialogs can't resize yet, allocate fixed space for 5 top 'hits' -->
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </form>`;
    document.appendChild(dialog);

    gatherCandidates(root);

    var input = document.getElementById("input");
    input.addEventListener("input", function () {
        updateList(input.value);
    });

    // Enter key automatically 'submits' the form
    // Esc key automatically cancels
    return dialog.showModal().then(function (reason) {
        dialog.remove();

        if (reason !== DIALOG_CANCELED && filtered.length > 0) {
            gotoArtboard(filtered[0]);
        }
    });
}

function gotoArtboard(artboard) {
    var bounds = artboard.globalBounds;
    Viewport.scrollToCenter(
        bounds.x + artboard.width / 2,
        bounds.y + artboard.height / 2
    );
}

module.exports = {
    commands: {
        quickNav: quickNav
    }
};