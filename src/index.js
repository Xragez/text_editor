const editor = document.getElementById("editor");
const fileInput = document.getElementById("fileInput");
let caretOffset = 0;

init();

function init() {
    onInEditorClickHandler();
    arrowsMovementHandler();
    readingFromFileHandler();
}

function readingFromFileHandler() {
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
}

function onInEditorClickHandler() {
    editor.addEventListener("click", (event) => {
        console.log(event);
    })
}

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
    console.log(caretOffset);
    line.focus();
    const range = document.createRange();
    const selection = document.getSelection();
    range.setStart(line.firstChild || line, Math.min(offset, line.textContent.length));
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    line.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function arrowsMovementHandler() {
    editor.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.classList.contains("editor-line")) {
            const lines = Array.from(editor.children);
            const currentIndex = lines.indexOf(activeElement);
            const currentLine = lines[currentIndex];
    
            if (event.key === "ArrowUp") {
                onArrowUp(lines, currentIndex);
                event.preventDefault();
            } else if (event.key === "ArrowDown") {
                onArrowDown(lines, currentIndex);
                event.preventDefault();
            } else if (event.key === "ArrowLeft") {
                onArrowLeft(lines, currentIndex, currentLine, activeElement);
                event.preventDefault();
            } else if (event.key === "ArrowRight") {
                onArrowRight(lines, currentIndex, currentLine, activeElement);
                event.preventDefault();
            }
        }
    });

    function onArrowRight(lines, currentIndex, currentLine, activeElement) {
        const nextLine = lines[currentIndex + 1];
    
        if (caretOffset < currentLine.textContent.length) {
            caretOffset++;
            moveToLine(activeElement, caretOffset);
        } else if (nextLine) {
            caretOffset = 0;
            moveToLine(nextLine, caretOffset);
        }
    }
    
    function onArrowLeft(lines, currentIndex, currentLine, activeElement) {
        const previousLine = lines[currentIndex - 1];
    
        if (caretOffset > 0 && caretOffset < currentLine.textContent.length) {
            caretOffset--;
            moveToLine(activeElement, caretOffset);
        } else if (caretOffset != 0 && caretOffset >= currentLine.textContent.length) {
            caretOffset = currentLine.textContent.length - 1;
            moveToLine(activeElement, caretOffset);
        } else if (previousLine) {
            caretOffset = previousLine.textContent.length;
            moveToLine(previousLine, caretOffset);
        }
    }
    
    function onArrowUp(lines, currentIndex) {
        if (currentIndex > 0) {
            moveToLine(lines[currentIndex - 1], caretOffset);
        }
    }
    
    function onArrowDown(lines, currentIndex) {
        if (currentIndex < lines.length - 1) {
            moveToLine(lines[currentIndex + 1], caretOffset);
        }
    }
}