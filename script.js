class CalculadoraDerivadas {
    constructor() {
        this.str = "";
        this.pos = -1;
        this.ch = "";
        this.x_val = 0;
    }

    siguiente() {
        this.pos++;
        this.ch = (this.pos < this.str.length) ? this.str.charAt(this.pos) : "";
    }

    comer(charParaComer) {
        while (this.ch === ' ') this.siguiente();
        if (this.ch === charParaComer) {
            this.siguiente();
            return true;
        }
        return false;
    }

    parseExpresion() {
        let x = this.parseTermino();
        for (;;) {
            if (this.comer('+')) x += this.parseTermino();
            else if (this.comer('-')) x -= this.parseTermino();
            else return x;
        }
    }

    parseTermino() {
        let x = this.parseFactor();
        for (;;) {
            if (this.comer('*')) x *= this.parseFactor();
            else if (this.comer('/')) x /= this.parseFactor();
            // Soporte para casos pegados como 2x o 2(x)
            else if (this.ch === 'x' || this.ch === '(') x *= this.parseFactor();
            else return x;
        }
    }

    parseFactor() {
        if (this.comer('+')) return this.parseFactor();
        if (this.comer('-')) return -this.parseFactor();

        let x;
        let inicioPos = this.pos;

        if (this.comer('(')) {
            x = this.parseExpresion();
            this.comer(')');
        } else if ((this.ch >= '0' && this.ch <= '9') || this.ch === '.') {
            while ((this.ch >= '0' && this.ch <= '9') || this.ch === '.') this.siguiente();
            x = parseFloat(this.str.substring(inicioPos, this.pos));
        } else if (this.ch === 'x') {
            x = this.x_val;
            this.siguiente();
        } else {
            return 0;
        }

        if (this.comer('^')) x = Math.pow(x, this.parseFactor());
        return x;
    }

    evaluar(s, x) {
        // CORRECCIÓN CLAVE: Agrega '*' entre números y la variable x (ej: 3x -> 3*x)
        this.str = s.toLowerCase().replace(/(\d)(x)/g, '$1*$2');
        this.pos = -1;
        this.x_val = x;
        this.siguiente();
        return this.parseExpresion();
    }
}

// Interacción con el usuario
const calculadora = new CalculadoraDerivadas();
const btnCalcular = document.getElementById('btn-calcular');
const btnBorrar = document.getElementById('btn-borrar');
const outResultado = document.getElementById('resultado');

btnCalcular.addEventListener('click', () => {
    const funcionTxt = document.getElementById('funcion').value;
    const xValTxt = document.getElementById('x_val').value.replace(',', '.');
    const x0 = parseFloat(xValTxt);
    const h = 0.000001; // Paso pequeño para precisión

    if (isNaN(x0)) {
        outResultado.innerText = "Error X";
        return;
    }

    try {
        // Diferencia Central: [f(x+h) - f(x-h)] / (2h)
        const f1 = calculadora.evaluar(funcionTxt, x0 + h);
        const f2 = calculadora.evaluar(funcionTxt, x0 - h);
        const derivada = (f1 - f2) / (2 * h);

        if (!isFinite(derivada)) throw new Error();

        // Redondeo para limpiar basura decimal (ej: 44.00000001 -> 44.0000)
        const resFinal = Math.round(derivada * 10000) / 10000;
        outResultado.innerText = resFinal.toFixed(4);
    } catch (e) {
        outResultado.innerText = "Error";
    }
});

btnBorrar.addEventListener('click', () => {
    document.getElementById('funcion').value = "";
    document.getElementById('x_val').value = "";
    outResultado.innerText = "--";
    document.getElementById('funcion').focus();
});