class Caret {
    constructor(line) {
        this.line = line;
        this.offset = 0;
        this.#updateCaretPosition();
    }

    setPosition(line, offset) {
        this.line = line;
        this.offset = Math.min(offset, line.textContent.length);
        this.#updateCaretPosition();
    }

    moveLeft() {
        const lineLen = this.line.textContent.length;

        if (lineLen > 0 && this.offset > lineLen) {
            this.offset = lineLen - 1;
        } else if (lineLen > 0 && this.offset > 0) {
            this.offset--;
        } else {
            this.#goToEndOfPrevLine();
        }
        this.#updateCaretPosition();
    }

    moveRight() {
        if (this.offset < this.line.textContent.length) {
          this.offset++;
        } else {
            this.#goToStartOfNextLine();
        }
        this.#updateCaretPosition();
    }

    moveUp() {
        const prevLine = this.line.previousElementSibling;
        if (prevLine) {
            this.line = prevLine;
        }
        this.#updateCaretPosition();
    }

    moveDown() {
        const nextLine = this.line.nextElementSibling;
        if (nextLine) {
            this.line = nextLine;
        }
        this.#updateCaretPosition();
    }

    calculateOffset(line) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return 0;
        
        const range = selection.getRangeAt(0);
        
        if (range.startContainer === line.firstChild || range.startContainer === line) {
          return range.startOffset;
        }
        
        return 0;
    }

    #updateCaretPosition() {
        if (!this.line) return;
        
        const range = document.createRange();
        const selection = window.getSelection();
    
        range.setStart(this.line.firstChild || this.line, Math.min(this.offset, this.line.textContent.length));
        range.collapse(true);
    
        selection.removeAllRanges();
        selection.addRange(range);
    
        this.line.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }  

    #goToEndOfPrevLine() {
        const prevLine = this.line.previousElementSibling;
        if (prevLine) {
            this.line = prevLine;
            this.offset = prevLine.textContent.length;
        }
    }

    #goToStartOfNextLine() {
        const nextLine = this.line.nextElementSibling;
        if (nextLine) {
            this.line = nextLine;
            this.offset = 0;
        }
    }
}

class EditorWindow {
    constructor(editor) {
        this._editor = editor;

        const newLine = this.#addNewLine(null, 0);
        this.caret = new Caret(newLine);

        // caret movement
        this.#arrowsMovementHandler();
        this.#leftMouseClickHandler();

        // text editing
        
    }

    set dataSource(source) {
        this._dataSource = source;
    }

    async loadData() {
        if (this._dataSource) {
            const content = await this._dataSource.readData();
            this.#loadTextToEditor(content);
        } else {
            new Error("No file selected");
        }
    }

    #addNewLine(text, index) {
        const lineDiv = document.createElement("div");
        lineDiv.classList.add("editor-line");
        lineDiv.setAttribute("line-number", index + 1);
        lineDiv.textContent = text || ''; 
        lineDiv.contentEditable = true;

        this._editor.appendChild(lineDiv);

        return lineDiv;
    }

    #loadTextToEditor(content) {
        this._editor.innerHTML = '';
        const lines = content.split("\n");

        lines.forEach((line, index) => {
            this.#addNewLine(line, index);
        });

        this.caret.setPosition(this._editor.lastChild, 0)
    }

    #arrowsMovementHandler() {
        this._editor.addEventListener("keydown", (event) => {
            if (event.key === "ArrowUp") {
                this.caret.moveUp();
                event.preventDefault();
            } else if (event.key === "ArrowDown") {
                this.caret.moveDown();
                event.preventDefault();
            } else if (event.key === "ArrowLeft") {
                this.caret.moveLeft();
                event.preventDefault();
            } else if (event.key === "ArrowRight") {
                this.caret.moveRight();
                event.preventDefault();
            }
        });
    }

    #leftMouseClickHandler() {
        this._editor.addEventListener("click", (event) => {
            if (event.target.id === this._editor.id) {
                const lastLine = this._editor.lastChild;
                this.caret.setPosition(lastLine, lastLine.textContent.length);
            } else {
                const line = event.target;
                const offset = this.caret.calculateOffset(line);
                this.caret.setPosition(line, offset);
            }
        })
    }
}

class FileSource {
    constructor(file) {
        this.file = file
    }

    async readData() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                resolve(fileContent);
            }
    
            if (this.file) {
                reader.readAsText(this.file);
            } else {
                reject(new Error("No file selected"))
            }
        })
    }
}

const editor = document.getElementById("editor");
const editorWindow = new EditorWindow(editor);

const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const fileSource = new FileSource(file);

    editorWindow.dataSource = fileSource;
    await editorWindow.loadData();
});
