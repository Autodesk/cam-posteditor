import React from 'react';

declare type CustomKeyboardHandler = (
    onClickHandler: () => void
) => (e: React.KeyboardEvent) => void;

/**
 * For non-interactive elements such as <div>, a key event handler needs to
 * be registered as well as onClick handler. This ensures that the navigation
 * with keyboard alone is possible.
 *
 * Read more here:
 * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
 *
 * @param {function} onClickHandler The onClick handler on such element.
 * @returns {CustomKeyboardHandler} A function that can handle the onKeyPressed event.
 */
const handleKeyDownAsOnClick: CustomKeyboardHandler = (
    onClickHandler: () => void,
) => (e: React.KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'Space') {
        onClickHandler();
    }
};

export { handleKeyDownAsOnClick };
