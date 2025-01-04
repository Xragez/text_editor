const editor = document.getElementById("editor");
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log
            const fileContent = e.target.result;
            console.log(fileContent);
            loadFileToEditor(fileContent);
        }
        reader.readAsText(file);
    }
})

editor.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;

    if (activeElement && activeElement.classList.contains("editor-line")) {
        const lines = Array.from(editor.children);
        const currentIndex = lines.indexOf(activeElement);
        let caretOffset = 0;

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            caretOffset = selection.getRangeAt(0).startOffset;
        }

        if (event.key === "ArrowUp") {
            if (currentIndex > 0) {
                moveToLine(lines[currentIndex - 1], caretOffset);
            }
            event.preventDefault();
        } else if (event.key === "ArrowDown") {
            if (currentIndex < lines.length - 1) {
                moveToLine(lines[currentIndex + 1], caretOffset);
            }
            event.preventDefault();
        }
    }
})

function loadFileToEditor(content) {
    editor.innerHTML = '';
    const lines = content.split("\n");
    console.log(lines);
    lines.forEach((line, index) => {
        const lineDiv = document.createElement("div");
        lineDiv.textContent = line;
        lineDiv.setAttribute("tabindex", "0")
        lineDiv.classList.add("editor-line");
        lineDiv.setAttribute("data-line-number", index + 1);
        lineDiv.contentEditable = true;
        editor.appendChild(lineDiv);
    });
}

function moveToLine(line, offset) {
    line.focus();
    const range = document.createRange();
    const selection = document.getSelection();
    range.setStart(line.firstChild || line, Math.min(offset, line.textContent.length));
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    line.scrollIntoView({ behavior: "smooth", block: "nearest" });
}