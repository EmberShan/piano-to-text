// keySimulator.js
export function simulateKeyPress(action) {
    switch (action) {
      case "ENTER":
        triggerKeyboardEvent("Enter");
        break;
      case "SPACE":
        triggerKeyboardEvent(" ");
        break;
      case "BACKSPACE":
        triggerKeyboardEvent("Backspace");
        break;
      default:
        if (typeof action === "string" && action.length === 1) {
          triggerKeyboardEvent(action);
        }
    }
  }
  
  function triggerKeyboardEvent(key) {
    const event = new KeyboardEvent("keydown", { key });
    document.dispatchEvent(event);
    console.log(`Simulated key: ${key}`);
  }
  