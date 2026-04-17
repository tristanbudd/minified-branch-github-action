/* eslint-env browser */
/* eslint-disable no-undef */
'use strict';

/**
 * Example 1: Counter Logic
 * This file handles the click events for the increment and decrement buttons.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Grab the DOM elements required for the counter operations
  const displayElementForCounter = document.getElementById('counterValue');
  const buttonToDecreaseValue = document.getElementById('decrementButton');
  const buttonToIncreaseValue = document.getElementById('incrementButton');

  // Initialize the starting state variable
  let currentNumericalValue = 0;

  // Attach event listener for the decrease action
  buttonToDecreaseValue.addEventListener('click', function () {
    currentNumericalValue = currentNumericalValue - 1;
    displayElementForCounter.textContent = currentNumericalValue;
    console.log('The counter was decreased to: ' + currentNumericalValue);
  });

  // Attach event listener for the increase action
  buttonToIncreaseValue.addEventListener('click', function () {
    currentNumericalValue = currentNumericalValue + 1;
    displayElementForCounter.textContent = currentNumericalValue;
    console.log('The counter was increased to: ' + currentNumericalValue);
  });
});
