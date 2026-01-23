// Enable the sidepanel for all URLs
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error('Failed to set panel behavior:', error))

// Listen for messages to open sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel') {
    chrome.sidePanel
      .open({ windowId: sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT })
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error('Failed to open side panel:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep the message channel open for async response
  }
})

// Optional: Set up keyboard shortcut command
chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'open-sidepanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.windowId) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId })
      }
    })
  }
})
