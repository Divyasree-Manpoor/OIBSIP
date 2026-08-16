// ========================================
// Get Elements
// ========================================

const currentDisplay = document.getElementById("current-display");
const previousDisplay = document.getElementById("previous-display");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");

const clearButton = document.querySelector("[data-action='clear']");
const deleteButton = document.querySelector("[data-action='delete']");
const equalsButton = document.querySelector("[data-action='equals']");


// ========================================
// Calculator State
// ========================================

let currentValue = "";
let previousValue = "";
let selectedOperator = null;
let shouldResetDisplay = false;


// ========================================
// Update Display
// ========================================

function updateDisplay() {
    currentDisplay.textContent = currentValue || "0";

    if (previousValue && selectedOperator) {
        previousDisplay.textContent =
            `${previousValue} ${selectedOperator}`;
    } else {
        previousDisplay.textContent = "";
    }
}


// ========================================
// Add Number
// ========================================

function appendNumber(number) {

    if (shouldResetDisplay) {
        currentValue = "";
        shouldResetDisplay = false;
    }

    // Prevent multiple decimal points
    if (number === "." && currentValue.includes(".")) {
        return;
    }

    // Don't allow multiple leading zeros
    if (number === "0" && currentValue === "0") {
        return;
    }

    // If decimal is pressed first
    if (number === "." && currentValue === "") {
        currentValue = "0.";
        updateDisplay();
        return;
    }

    currentValue += number;

    updateDisplay();
}


// ========================================
// Choose Operator
// ========================================

function chooseOperator(operator) {

    if (currentValue === "" && previousValue === "") {
        return;
    }

    // Allow changing operator before entering
    // the next number
    if (currentValue === "" && previousValue !== "") {
        selectedOperator = operator;
        updateDisplay();
        return;
    }

    // If there is already an operation,
    // calculate it first
    if (previousValue !== "" && selectedOperator) {
        calculate();
    }

    previousValue = currentValue;
    selectedOperator = operator;
    currentValue = "";
    shouldResetDisplay = false;

    updateDisplay();
}


// ========================================
// Calculate Result
// ========================================

function calculate() {

    if (
        previousValue === "" ||
        currentValue === "" ||
        selectedOperator === null
    ) {
        return;
    }

    const firstNumber = Number(previousValue);
    const secondNumber = Number(currentValue);

    let result;

    switch (selectedOperator) {

        case "+":
            result = firstNumber + secondNumber;
            break;

        case "−":
            result = firstNumber - secondNumber;
            break;

        case "×":
            result = firstNumber * secondNumber;
            break;

        case "÷":

            if (secondNumber === 0) {
                currentValue = "Cannot divide by zero";
                previousValue = "";
                selectedOperator = null;
                shouldResetDisplay = true;

                updateDisplay();
                return;
            }

            result = firstNumber / secondNumber;
            break;

        default:
            return;
    }

    // Avoid very long decimal results
    result = Number(result.toFixed(10));

    currentValue = String(result);

    previousValue = "";
    selectedOperator = null;
    shouldResetDisplay = true;

    updateDisplay();
}


// ========================================
// Clear Calculator
// ========================================

function clearCalculator() {

    currentValue = "";
    previousValue = "";
    selectedOperator = null;
    shouldResetDisplay = false;

    updateDisplay();
}


// ========================================
// Delete Last Character
// ========================================

function deleteLastCharacter() {

    if (shouldResetDisplay) {
        return;
    }

    currentValue = currentValue.slice(0, -1);

    updateDisplay();
}


// ========================================
// Number Button Events
// ========================================

numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        const number = button.dataset.number;

        appendNumber(number);
    });

});


// ========================================
// Operator Button Events
// ========================================

operatorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const operator = button.dataset.operator;

        chooseOperator(operator);
    });

});


// ========================================
// Other Button Events
// ========================================

clearButton.addEventListener("click", clearCalculator);

deleteButton.addEventListener("click", deleteLastCharacter);

equalsButton.addEventListener("click", calculate);


// ========================================
// Keyboard Support
// ========================================

document.addEventListener("keydown", event => {

    const key = event.key;

    // Numbers and decimal
    if (
        (key >= "0" && key <= "9") ||
        key === "."
    ) {
        appendNumber(key);
        return;
    }

    // Operators
    if (key === "+") {
        chooseOperator("+");
        return;
    }

    if (key === "-") {
        chooseOperator("−");
        return;
    }

    if (key === "*") {
        chooseOperator("×");
        return;
    }

    if (key === "/") {
        chooseOperator("÷");
        return;
    }

    // Enter / =
    if (key === "Enter" || key === "=") {
        calculate();
        return;
    }

    // Backspace
    if (key === "Backspace") {
        deleteLastCharacter();
        return;
    }

    // Escape
    if (key === "Escape") {
        clearCalculator();
    }

});