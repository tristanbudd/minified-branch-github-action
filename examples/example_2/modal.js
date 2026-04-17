/* eslint-env browser */
/* eslint-disable no-undef */
'use strict';
/**
 * Example 2: Modal Logic
 * Controls the visibility of the modal overlay.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Locate the modal overlay and the control buttons
  const overlayElement = document.getElementById('informationModal');
  const openModalButtonElement = document.getElementById('triggerModalBtn');
  const closeModalButtonElement = document.getElementById('closeModalBtn');

  // Function to show the modal
  const executeModalOpenSequence = () => {
    overlayElement.classList.remove('hidden');
    console.log('Modal sequence initiated and displayed.');
  };

  // Function to hide the modal
  const executeModalCloseSequence = () => {
    overlayElement.classList.add('hidden');
    console.log('Modal sequence terminated and hidden.');
  };

  // Bind the functions to the button click events
  openModalButtonElement.addEventListener('click', executeModalOpenSequence);
  closeModalButtonElement.addEventListener('click', executeModalCloseSequence);
});
