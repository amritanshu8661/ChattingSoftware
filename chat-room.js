document.addEventListener("DOMContentLoaded", () => {
    // Constants
    const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    const POLLING_INTERVAL = 2000 // 2 seconds
  
    // Elements
    const messagesContainer = document.getElementById("messages-container")
    const emptyState = document.getElementById("empty-state")
    const chatMessages = document.getElementById("chat-messages")
    const messageForm = document.getElementById("message-form")
    const messageInput = document.getElementById("message-input")
    const sendBtn = document.getElementById("send-btn")
    const waitingBadge = document.getElementById("waiting-badge")
    const connectedBadge = document.getElementById("connected-badge")
    const partnerName = document.getElementById("partner-name")
    const connectionIndicator = document.getElementById("connection-indicator")
    const connectionText = document.getElementById("connection-text")
    const reconnectBtn = document.getElementById("reconnect-btn")
    const timeRemaining = document.getElementById("time-remaining")
    const timeValue = document.getElementById("time-value")
    const shareBtn = document.getElementById("share-btn")
    const endChatBtn = document.getElementById("end-chat-btn")
    const endChatDialog = document.getElementById("end-chat-dialog")
    const closeDialogBtn = document.getElementById("close-dialog-btn")
    const cancelEndChatBtn = document.getElementById("cancel-end-chat-btn")
    const confirmEndChatBtn = document.getElementById("confirm-end-chat-btn")
    const errorDialog = document.getElementById("error-dialog")
    const errorMessageText = document.getElementById("error-message-text")
    const refreshBtn = document.getElementById("refresh-btn")
  
    // Variables
    let roomId = ""
    let username = ""
    let messages = []
    let pollingInterval = null
    let activityCheckInterval = null
    const isConnected = true
    let partnerPresent = false
    let partnerUsername = null
  
    // Get URL parameters
    function getUrlParams() {
      const params = new URLSearchParams(window.location.search)
      return {
        roomId: params.get("roomId"),
      }
    }
  
    // Simple "encryption" (just for demo purposes)
    function encryptMessage(message) {
      try {
        return btoa(message)
      } catch (error) {
        console.error("Encryption error:", error)
        return message
      }
    }
  
    // Simple "decryption" (just for demo purposes)
    function decryptMessage(encryptedMessage) {
      try {
        return atob(encryptedMessage)
      } catch (error) {
        console.error("Decryption error:", error)
        return "[Encrypted message]"
      }
    }
  
    // Get stored messages
    function getStoredMessages() {
      try {
        const stored = localStorage.getItem(`chat_room_${roomId}`)
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error reading from localStorage:", error)
        return []
      }
    }
  
    // Store messages
    function storeMessages(messages) {
      try {
        localStorage.setItem(`chat_room_${roomId}`, JSON.stringify(messages))
        // Update last activity timestamp
        localStorage.setItem(`chat_room_${roomId}_lastActivity`, Date.now().toString())
        return true
      } catch (error) {
        console.error("Error writing to localStorage:", error)
        return false
      }
    }
  
    // Get last activity timestamp
    function getLastActivity() {
      try {
        const lastActivity = localStorage.getItem(`chat_room_${roomId}_lastActivity`)
        return lastActivity ? Number.parseInt(lastActivity, 10) : 0
      } catch (error) {
        console.error("Error reading last activity:", error)
        return 0
      }
    }
  
    // Delete room data
    function deleteRoomData() {
      try {
        localStorage.removeItem(`chat_room_${roomId}`)
        localStorage.removeItem(`chat_room_${roomId}_lastActivity`)
        localStorage.removeItem(`chat_username_${roomId}`)
        localStorage.removeItem(`chat_room_${roomId}_created`)
        return true
      } catch (error) {
        console.error("Error deleting from localStorage:", error)
        return false
      }
    }
  
    // Show error
    function showError(message) {
      errorMessageText.textContent = message
      errorDialog.classList.remove("hidden")
    }
  
    // Update time remaining
    function updateTimeRemaining() {
      const lastActivity = getLastActivity()
      if (lastActivity > 0) {
        const timeElapsed = Date.now() - lastActivity
        const timeLeft = INACTIVITY_TIMEOUT - timeElapsed
  
        if (timeLeft <= 0) {
          // Chat has expired
          deleteRoomData()
          showError("This chat has expired due to inactivity. All messages have been deleted.")
          clearInterval(pollingInterval)
          clearInterval(activityCheckInterval)
          return
        }
  
        // Format time remaining
        const hours = Math.floor(timeLeft / (60 * 60 * 1000))
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
        timeValue.textContent = `${hours}h ${minutes}m`
        timeRemaining.classList.remove("hidden")
      }
    }
  
    // Update participants
    function updateParticipants() {
      const senders = new Set(messages.map((m) => m.sender))
  
      if (username && senders.size > 1) {
        const otherSenders = Array.from(senders).filter((sender) => sender !== username)
        if (otherSenders.length > 0) {
          partnerUsername = otherSenders[0]
          partnerName.textContent = partnerUsername
          partnerPresent = true
          waitingBadge.classList.add("hidden")
          connectedBadge.classList.remove("hidden")
        }
      }
    }
  
    // Render messages
    function renderMessages() {
      if (messages.length === 0) {
        emptyState.classList.remove("hidden")
        messagesContainer.classList.add("hidden")
        return
      }
  
      emptyState.classList.add("hidden")
      messagesContainer.classList.remove("hidden")
  
      // Clear existing messages
      const messagesList = document.querySelector(".messages-list")
      if (messagesList) {
        messagesList.remove()
      }
  
      // Create messages list
      const list = document.createElement("div")
      list.className = "messages-list"
  
      // Process messages for display
      const displayMessages = messages.map((message) => {
        // If message is already decrypted or is from current user, display as is
        if (!message.isEncrypted || message.sender === username) {
          return message
        }
  
        // Otherwise decrypt the message
        try {
          if (typeof message.content === "string") {
            return {
              ...message,
              content: decryptMessage(message.content),
              isEncrypted: false,
            }
          }
        } catch (error) {
          console.error("Error decrypting message:", error)
        }
  
        return {
          ...message,
          content: "[Encrypted message]",
        }
      })
  
      // Render each message
      displayMessages.forEach((message) => {
        const isOutgoing = message.sender === username
  
        const messageEl = document.createElement("div")
        messageEl.className = `message ${isOutgoing ? "outgoing" : ""}`
  
        const avatar = document.createElement("div")
        avatar.className = "avatar"
        avatar.textContent = message.sender.substring(0, 2).toUpperCase()
  
        const contentEl = document.createElement("div")
        contentEl.className = "message-content"
  
        const bubble = document.createElement("div")
        bubble.className = "message-bubble"
        bubble.textContent = message.content
  
        const meta = document.createElement("div")
        meta.className = "message-meta"
  
        const sender = document.createElement("span")
        sender.textContent = message.sender
  
        const time = document.createElement("span")
        time.textContent = new Date(message.timestamp).toLocaleTimeString()
  
        meta.appendChild(sender)
        meta.appendChild(time)
  
        contentEl.appendChild(bubble)
        contentEl.appendChild(meta)
  
        messageEl.appendChild(avatar)
        messageEl.appendChild(contentEl)
  
        list.appendChild(messageEl)
      })
  
      messagesContainer.appendChild(list)
  
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  
    // Send message
    async function sendMessage(e) {
      e.preventDefault()
  
      const content = messageInput.value.trim()
      if (!content) return
  
      // Clear input
      messageInput.value = ""
  
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
      // Create message object with plaintext for local display
      const localMessage = {
        id: messageId,
        sender: username,
        content: content,
        timestamp: Date.now(),
        isEncrypted: false,
      }
  
      // Create encrypted message for storage
      const encryptedContent = encryptMessage(content)
  
      const storageMessage = {
        id: messageId,
        sender: username,
        content: encryptedContent,
        timestamp: Date.now(),
        isEncrypted: true,
      }
  
      // Add to messages array
      messages.push(storageMessage)
  
      // Store in localStorage
      storeMessages(messages)
  
      // Render messages
      renderMessages()
    }
  
    // Initialize chat
    async function initializeChat() {
      const params = getUrlParams()
      roomId = params.roomId
  
      if (!roomId) {
        showError("Invalid room ID. Please check the URL.")
        return
      }
  
      // Get username from localStorage or prompt for one
      username = localStorage.getItem(`chat_username_${roomId}`)
      if (!username) {
        username = prompt("Enter your name to join the chat:")
        if (!username) {
          username = `User-${Math.floor(Math.random() * 10000)}`
        }
        localStorage.setItem(`chat_username_${roomId}`, username)
      }
  
      // Check if chat has expired due to inactivity
      const lastActivity = getLastActivity()
      if (lastActivity > 0) {
        const inactiveTime = Date.now() - lastActivity
        if (inactiveTime > INACTIVITY_TIMEOUT) {
          // Chat has expired
          deleteRoomData()
          showError("This chat has expired due to inactivity. All messages have been deleted.")
          return
        }
      }
  
      // Load messages from localStorage
      messages = getStoredMessages()
  
      // Update participants
      updateParticipants()
  
      // Render messages
      renderMessages()
  
      // Update time remaining
      updateTimeRemaining()
  
      // Set up polling interval
      pollingInterval = setInterval(() => {
        // In a real app, this would fetch messages from the server
        // For this demo, we'll just check localStorage for changes
        const storedMessages = getStoredMessages()
        if (JSON.stringify(storedMessages) !== JSON.stringify(messages)) {
          messages = storedMessages
          updateParticipants()
          renderMessages()
        }
      }, POLLING_INTERVAL)
  
      // Set up activity check interval
      activityCheckInterval = setInterval(() => {
        updateTimeRemaining()
      }, 60000) // Check every minute
    }
  
    // Event listeners
    messageForm.addEventListener("submit", sendMessage)
  
    shareBtn.addEventListener("click", () => {
      const url = window.location.href
      navigator.clipboard
        .writeText(url)
        .then(() => {
          shareBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>'
          setTimeout(() => {
            shareBtn.innerHTML = '<i class="fas fa-copy"></i><span>Share Link</span>'
          }, 2000)
        })
        .catch((err) => {
          console.error("Failed to copy:", err)
        })
    })
  
    endChatBtn.addEventListener("click", () => {
      endChatDialog.classList.remove("hidden")
    })
  
    closeDialogBtn.addEventListener("click", () => {
      endChatDialog.classList.add("hidden")
    })
  
    cancelEndChatBtn.addEventListener("click", () => {
      endChatDialog.classList.add("hidden")
    })
  
    confirmEndChatBtn.addEventListener("click", () => {
      deleteRoomData()
      window.location.href = "index.html"
    })
  
    refreshBtn.addEventListener("click", () => {
      window.location.reload()
    })
  
    // Initialize
    initializeChat()
  })
  