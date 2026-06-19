/* eslint-env browser */
/* eslint-disable no-undef */
'use strict';
/**
 * Example 3: Theme Toggle Logic
 * Manipulates the data-theme attribute on the document root.
 */

const initializeThemeSwitcherEnvironment = () => {
  const documentRootElement = document.documentElement;
  const themeToggleButtonElement = document.getElementById('themeToggleBtn');

  // Store the current state to determine which theme to switch to
  let isCurrentlyDarkModeActive = false;

  themeToggleButtonElement.addEventListener('click', () => {
    // Toggle the boolean state
    isCurrentlyDarkModeActive = !isCurrentlyDarkModeActive;

    if (isCurrentlyDarkModeActive) {
      // Apply dark mode styling
      documentRootElement.setAttribute('data-theme', 'dark');
      themeToggleButtonElement.textContent = 'Switch to Light Mode';
      console.log('Dark mode has been enabled successfully.');
    } else {
      // Revert back to light mode styling
      documentRootElement.removeAttribute('data-theme');
      themeToggleButtonElement.textContent = 'Switch to Dark Mode';
      console.log('Light mode has been enabled successfully.');
    }
  });
};

// Execute initialization once the DOM is fully constructed
document.addEventListener('DOMContentLoaded', initializeThemeSwitcherEnvironment);
