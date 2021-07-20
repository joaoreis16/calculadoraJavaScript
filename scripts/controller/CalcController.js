class CalcController {
    
    constructor() {

        this._audioOnOff = false;
        this._audio = new Audio("click.mp3");
        this._locale = 'pt-BR';
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];

        this._displayCalc  = document.querySelector("#display");
        this._date = document.querySelector("#data");
        this._time = document.querySelector("#hora");
        this._currentDate; 

        this.setDisplayCalc = '0';
        this.initialize();
        this.initButtonEvents();
        this.initKeyBoard();
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    initialize() {
        
        this.setDisplayDateTime();

        setInterval( () =>{
            this.setDisplayDateTime();

        }, 1000);

        this.pasteFromCliboard();

        document.querySelectorAll(".btn-ac").forEach(btn=>{

            btn.addEventListener("dblclick", e=>{
                this.toggleAudio();
            })
        });

    }

    setDisplayDateTime(){
        this.setDisplayDate = this.currentDate.toLocaleDateString(this._locale);
        this.setDisplayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    toggleAudio() {

        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {
        if (this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    // esta etapa faz-se porque estamos a trabalhar com um svg, se fosse HTML puro, feito por mim, não era necessário
    copy2Clipboard() {
        let input = document.createElement("input");
        input.value = this.getDisplayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");
        input.remove();
    }

    pasteFromCliboard() {
        document.addEventListener("paste", e=>{
            let text = e.clipboardData.getData("Text");

            this.setDisplayCalc = parseFloat(text);
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    initKeyBoard() {
        document.addEventListener('keyup', e=> {
            let value = e.key

            this.playAudio(); 

            switch (value) {
                case "Escape":
                    this._operation = [];
                    this._lastNumber = '';
                    this.lastOperator = '';
                    this.setDisplayCalc = '0';
                    break;
            
                case "Backspace":
                    this._operation.pop();
                    this.setDisplayCalc = this._operation[0];
                    break;
    
                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                    this.addOperation(value);
                    break;
    
                case "Enter":
                case "=":
                    this.calc();
                    break;
                
                case ".":
                case ",":
                    this.addDot();
                    break;
    
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.addOperation(value);
                    break;

                case "c":
                    if (e.ctrlKey) this.copy2Clipboard();
                    break;
    
            }
        });
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    initButtonEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach( (btn, index) => {

            this.addEventListenerAll(btn, "click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });

        });
    }

    addEventListenerAll( element, events, fn) {
        events.split(' ').forEach(e1 => {
            element.addEventListener(e1, fn, false);
        });
    }

    execBtn(value) {
        this.playAudio();

        switch (value) {
            case "ac":
                this._operation = [];
                this._lastNumber = '';
                this.lastOperator = '';
                this.setDisplayCalc = '0';
                break;
        
            case "ce":
                this._operation.pop();
                this.setDisplayCalc = this._operation[0];
                break;

            case "soma":
                this.addOperation('+');
                break;

            case "subtracao":
                this.addOperation('-');
                break;

            case "multiplicacao":
                this.addOperation('*');
                break;

            case "divisao":
                this.addOperation('/');
                break;

            case "porcento":
                this.addOperation('%');
                break;

            case "igual":
                this.calc();
                break;
            
            case "ponto":
                this.addDot();
                break;

            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.addOperation(value);
                break;

            default:
                this._displayCalc = "ERROR"
                break;
        }
    }

    addOperation(value) {

        if(isNaN(this._operation[ this._operation.length - 1])) {

            if ( ['+', '-', '*', '/', '%'].includes(value) ) {       // troca de sinal
                this._operation[ this._operation.length - 1] = value;

            } else {
                this._operation.push(value);
                if (this._operation.length > 3) this.calculate();
                this.setDisplayCalc = value;
                
            }

        } else {
            if (['+', '-', '*', '/', '%'].includes(value)) {
                this._operation.push(value);
                if (this._operation.length > 3) this.calculate();

            } else {
                let newValue = this._operation[ this._operation.length - 1].toString() + value.toString();
                this._operation[ this._operation.length - 1] = newValue;
                this.setDisplayCalc = newValue;

            }

        }

        console.log(this._operation);
    }

    calculate() {
        let last = this._operation.pop();
        let result = this.getResult();

        if (last == '%') {
            result /= 100;
            this._operation = [result];

        } else {
            this._operation = [result, last];
        }

        this.setDisplayCalc  = result;
    }

    calc() {
        let last = '';
        let result = this.getResult();
        if (!result) return;

        if (this._operation.length == 0) {
            this.setDisplayCalc  = "0";
            return
        }

        for(let i = this._operation.length - 1; i >= 0; i--) {
            if ( ['+', '-', '*', '/', '%'].includes(this._operation[i]) ) {
                this._lastOperator = this._operation[i];
                break;
            }
        }
        

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if(this._operation.length == 3) {
            for(let i = this._operation.length - 1; i >= 0; i--) {
                if ( !['+', '-', '*', '/', '%'].includes(this._operation[i]) ) {
                    this._lastNumber = this._operation[i];
                    break;
                }
            }
        }
        

        if (last == '%') result /= 100;

        this._operation = [result];
        this.setDisplayCalc  = result;
    }

    getResult() {
        try {
            return eval(this._operation.join("")).toString();
        } catch(e) {
            this.setDisplayCalc = "ERROR";
        }
    }

    addDot() {

        let lastOperation = this._operation[ this._operation.length - 1 ];

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if ( ['+', '-', '*', '/', '%'].includes(lastOperation) || !lastOperation ) {
            this._operation.push("0.");

        } else {
            this._operation[ this._operation.length - 1 ] = lastOperation + '.';
        }

        this.setDisplayCalc = this._operation[ this._operation.length - 1 ] ;

        console.log(lastOperation);

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    get getDisplayCalc() {
        return this._displayCalc.innerHTML;
    }

    set setDisplayCalc(value) {

        if (value.length > 10) {
            this._displayCalc.innerHTML = "ERROR";
            return;
        }
        this._displayCalc.innerHTML = value;
    }

    get getDisplayDate() {
        return this._date.innerHTML;
    }

    set setDisplayDate(value) {
        this._date.innerHTML = value;
    }

    get getDisplayTime() {
        return this._time.innerHTML;
    }

    set setDisplayTime(value) {
        this._time.innerHTML = value;
    }

    get getCurrentDate() {
        return this._currentDate;
    }

    set setCurrentDate(value) {
        this._currentDate = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

}