import Decimal from '../decimal.js-master/decimal.mjs'

const calculator = document.querySelector('.calculator')
const keys = calculator.querySelector('.calculator__keys')
const display = calculator.querySelector('.calculator__display')

keys.addEventListener('click', event => {
  if (!event.target.closest('button')) return

  const key = event.target
  const keyValue = key.textContent
  const displayValue = display.textContent
  const { type } = key.dataset
  const { previousKeyType } = calculator.dataset

  // Is this a number key?
  if (type === 'number') {
    if (displayValue === '0') {
      display.textContent = keyValue
    } else if (previousKeyType === 'operator' || previousKeyType === 'equal') {
      display.textContent = keyValue
    } else {
      display.textContent = displayValue + keyValue
    }
  }

  // Is this an operator key?
  if (type === 'operator') {
    const operatorKeys = keys.querySelectorAll('[data-type="operator"]')
    operatorKeys.forEach(el => (el.dataset.state = ''))

    key.dataset.state = 'selected'

    // Check previous key
    if (previousKeyType === 'equal') {
      delete calculator.dataset.firstNumber
    }

    if (previousKeyType !== 'operator') {
      // if there is no firstNumber, store in firstNumber
      if (!calculator.dataset.firstNumber) {
        calculator.dataset.firstNumber = displayValue
      } else if (calculator.dataset.firstNumber) {
        calculator.dataset.firstNumber = calculate(
          calculator.dataset.firstNumber,
          calculator.dataset.operator,
          displayValue
        )
        display.textContent = calculator.dataset.firstNumber
      }
    }

    calculator.dataset.operator = key.dataset.key
  }

  if (type === 'equal') {
    // Do nothing if there's no first number
    if (!calculator.dataset.firstNumber || previousKeyType === 'operator') {
      return
    }

    if (previousKeyType !== 'equal') {
      calculator.dataset.secondNumber = displayValue
    }

    calculator.dataset.firstNumber = calculate(
      calculator.dataset.firstNumber,
      calculator.dataset.operator,
      calculator.dataset.secondNumber
    )
    display.textContent = calculator.dataset.firstNumber

    // Perform Calculation

    // display.textContent = calculate(firstNumber, operator, displayValue)
  }

  // Clear key
  if (type === 'clear') {
    display.textContent = '0'
    delete calculator.dataset.firstNumber
    delete calculator.dataset.secondNumber
    delete calculator.dataset.operator

    const operatorKeys = keys.querySelectorAll('[data-type="operator"]')
    operatorKeys.forEach(key => delete key.dataset.state)
  }

  // Resets key type
  calculator.dataset.previousKeyType = type
})

function calculate(firstNumber, operator, secondNumber) {
  // FIX FOR 64-BIT FLOATING POINT NUMBERS IN JS
  // using decimal.js for more accurate numbers (IT WORKS THANK THE LORD)

  // Convert to type Decimal

  firstNumber = new Decimal(firstNumber)
  secondNumber = new Decimal(secondNumber)
  let result

  // if (operator === 'plus') return firstNumber + secondNumber
  // if (operator === 'minus') return firstNumber - secondNumber
  // if (operator === 'times') return firstNumber * secondNumber
  // if (operator === 'divide') return firstNumber / secondNumber

  // Run calculation and set to 'result'

  if (operator === 'plus') result = firstNumber.add(secondNumber).toFixed()
  if (operator === 'minus') result = firstNumber.sub(secondNumber).toFixed()
  if (operator === 'times') result = firstNumber.mul(secondNumber).toFixed()
  if (operator === 'divide') result = firstNumber.div(secondNumber).toFixed()

  // Check result length and convert to exponent

  if (result.length > 14) {
    let a = new Decimal(result)
    result = a.toExponential(12)
  }
  return result
}

// ====================
// TESTING
// ====================

function clearCalculator() {
  // Press the clear key
  const clearKey = document.querySelector('[data-type="clear"]')
  clearKey.click()

  const operatorKeys = keys.querySelectorAll('[data-type="operator"]')
  operatorKeys.forEach(key => delete key.dataset.state)
}

function testClearKey() {
  clearCalculator()
  console.assert(display.textContent === '0', 'Clear key. Display should be 0')
  console.assert(!calculator.dataset.firstNumber, 'Clear key. No first number')
  console.assert(!calculator.dataset.operator, 'Clear key. No operator')
}

function testKeySequence(test) {
  // Press keys
  test.keys.forEach(key => {
    document.querySelector(`[data-key="${key}"]`).click()
  })

  // Assertion
  console.assert(display.textContent === test.value, test.msg)

  // Clear keys
  clearCalculator()
  testClearKey()
}

// const test = {
//   keys: ['1', '5', '9'],
//   value: '159',
//   msg: 'Clicked 159',
// }

// testKeySequence(test)

const tests = [
  {
    keys: ['1'],
    value: '1',
    msg: 'Clicked 1',
  },
  {
    keys: ['1', '5'],
    value: '15',
    msg: 'Clicked 15',
  },
  {
    keys: ['1', '5', '9'],
    value: '159',
    msg: 'Clicked 159',
  },
  {
    keys: ['1', '5', 'times', '9', 'equal'],
    value: '135',
    msg: 'Calculation with times',
  },
  {
    keys: ['1', '5', 'plus', '2', 'equal'],
    value: '17',
    msg: 'Calculation with plus',
  },
  {
    keys: ['3', 'minus', '7', '0', 'equal'],
    value: '-67',
    msg: 'Calculation with minus',
  },
  {
    keys: ['9', '0', 'divide', '1', '0', 'equal'],
    value: '9',
    msg: 'Calculation with divide',
  },
  {
    keys: ['7', 'divide', '0', 'equal'],
    value: 'Infinity',
    msg: 'Divided by 0',
  },
  {
    keys: ['7', 'plus', '1', 'plus', '5', 'minus', '2', 'equal'],
    value: '11',
    msg: 'Used multiple operators',
  },
  {
    keys: ['1', 'plus', '0', 'decimal', '1', 'equal', 'equal'],
    value: '1.2',
    msg: 'Calculation with a decimal',
  },
]

// tests.forEach(test => testKeySequence(test))
// Refactored
tests.forEach(testKeySequence)

// One test
// one.click()
// console.assert(display.textContent === '1', 'Clicked one')
// clearCalculator()
// testClearKey()

// // 15
// one.click()
// five.click()
// console.assert(display.textContent === '15', 'Clicked 1 and 5')
// clearCalculator()
// testClearKey()

// // 159
// one.click()
// five.click()
// nine.click()
// console.assert(display.textContent === '159', 'Clicked 1 and 5')
// clearCalculator()
// testClearKey()
