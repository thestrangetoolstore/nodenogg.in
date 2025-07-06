// Prevent pinch-to-zoom on trackpad
export function preventPinchZoom() {
  // Prevent ctrl+wheel and cmd+wheel (pinch gesture on trackpad)
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
    }
  }, { passive: false })

  // // Prevent keyboard zoom shortcuts
  // document.addEventListener('keydown', (e) => {
  //   // Prevent Ctrl/Cmd + Plus/Minus/Zero
  //   if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
  //     e.preventDefault()
  //   }
  // }, { passive: false })

  // Prevent gesture events (for browsers that support them)
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  }, { passive: false })

  document.addEventListener('gesturechange', (e) => {
    e.preventDefault()
  }, { passive: false })

  document.addEventListener('gestureend', (e) => {
    e.preventDefault()
  }, { passive: false })
}