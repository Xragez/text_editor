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

    #updateCaretPosition() {
        console.log(this.offset);
        if (!this.line) return;
        
        const range = document.createRange();
        const selection = window.getSelection();
    
        range.setStart(this.line.firstChild || this.line, Math.min(this.offset, this.line.textContent.length));
        range.collapse(true);
    
        selection.removeAllRanges();
        selection.addRange(range);
    
        this.line.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    moveLeft() {
        const lineLen = this.line.textContent.length;
        if (lineLen < this.offset && lineLen != 0) {
            this.offset = lineLen - 1;
        } else if (lineLen > 0 && this.offset > 0) {
            this.offset--;
        } else {
            const prevLine = this.line.previousElementSibling;
            if (prevLine) {
                this.line = prevLine;
                this.offset = prevLine.textContent.length;
          }
        }
        this.#updateCaretPosition();
    }

    moveRight() {
        if (this.offset < this.line.textContent.length) {
          this.offset++;
        } else {
          const nextLine = this.line.nextElementSibling;
          if (nextLine) {
            this.line = nextLine;
            this.offset = 0;
          }
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
}

class EditorWindow {
    constructor(editor) {
        this.editor = editor;
        const newLine = this.#addNewLine(null, 0);

        this.caret = new Caret(newLine);
        
        this.#arrowsMovementHandler()

        this._fileService = new FileService();

        const fileInput = document.getElementById("fileInput");
        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            const content = await this._fileService.readFromFile(file);
            console.log(content);
            this.#loadTextToEditor(content);
        })
    }

    getCaret() {
        return this.caret;
    }

    #addNewLine(text, index) {
        const lineDiv = document.createElement("div");
        lineDiv.classList.add("editor-line");
        lineDiv.setAttribute("line-number", index + 1);
        lineDiv.textContent = text || ''; 
        lineDiv.contentEditable = true;

        this.editor.appendChild(lineDiv);

        return lineDiv;
    }

    #loadTextToEditor(content) {
        this.editor.innerHTML = '';
        const lines = content.split("\n");

        lines.forEach((line, index) => {
            this.#addNewLine(line, index);
        });

        this.caret.setPosition(this.editor.lastChild, 0)
    }

    #arrowsMovementHandler() {
        this.editor.addEventListener("keydown", (event) => {
            const activeElement = document.activeElement;
    
            if (activeElement && activeElement.classList.contains("editor-line")) {
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
            }
        });
    }
}

class FileService {
    async readFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                resolve(fileContent);
            }
    
            if (file) {
                reader.readAsText(file);
            } else {
                reject(new Error("No file selected"))
            }
        })
    }
}

const editor = document.getElementById("editor");
const editorWindow = new EditorWindow(editor);
