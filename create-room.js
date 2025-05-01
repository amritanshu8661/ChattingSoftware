document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const createForm = document.getElementById("create-form")
    const roomCreated = document.getElementById("room-created")
    const cardDescription = document.getElementById("card-description")
    const usernameInput = document.getElementById("username")
    const createBtn = document.getElementById("create-btn")
    const createBtnText = document.getElementById("create-btn-text")
    const createBtnLoading = document.getElementById("create-btn-loading")
    const roomButtons = document.getElementById("room-buttons")
    const secretLinkEl = document.getElementById("secret-link")
    const copyBtn = document.getElementById("copy-btn")
    const joinBtn = document.getElementById("join-btn")
    const copyLinkBtn = document.getElementById("copy-link-btn")
    const errorMessage = document.getElementById("error-message")
  
    // Variables
    let secretLink = ""
    let roomId = ""
  
    // Generate a secure random room ID
    function generateRoomId() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  
    // Show error message
    function showError(message) {
      errorMessage.textContent = message
      errorMessage.classList.remove("hidden")
    }
  
    // Hide error message
    function hideError() {
      errorMessage.classList.add("hidden")
    }
  
    // Create room
    createBtn.addEventListener("click", async () => {
      const username = usernameInput.value.trim()
  
      if (!username) {
        showError("Please enter a username")
        return
      }
  
      hideError()
  
      // Show loading state
      createBtnText.classList.add("hidden")
      createBtnLoading.classList.remove("hidden")
      createBtn.disabled = true
  
      try {
        // Generate room ID
        roomId = generateRoomId()
  
        // Create secret link
        secretLink = `${window.location.origin}/chat-room.html?roomId=${roomId}`
  
        // Store username in localStorage
        localStorage.setItem(`chat_username_${roomId}`, username)
  
        // Store room creation time
        localStorage.setItem(`chat_room_${roomId}_created`, Date.now().toString())
  
        // Initialize empty messages array
        localStorage.setItem(`chat_room_${roomId}`, JSON.stringify([]))
  
        // Update last activity timestamp
        localStorage.setItem(`chat_room_${roomId}_lastActivity`, Date.now().toString())
  
        // Show success state
        createForm.classList.add("hidden")
        roomCreated.classList.remove("hidden")
        roomButtons.classList.remove("hidden")
        createBtn.classList.add("hidden")
        cardDescription.textContent = "Your secure chat room is ready! Share this secret code with one person."
  
        // Update secret link display
        secretLinkEl.textContent = secretLink
      } catch (error) {
        console.error("Error creating room:", error)
        showError("Failed to create room. Please try again.")
  
        // Reset loading state
        createBtnText.classList.remove("hidden")
        createBtnLoading.classList.add("hidden")
        createBtn.disabled = false
      }
    })
  
    // Copy link
    function copyToClipboard() {
      navigator.clipboard
        .writeText(secretLink)
        .then(() => {
          copyBtn.innerHTML = '<i class="fas fa-check"></i>'
          copyLinkBtn.textContent = "Copied!"
  
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>'
            copyLinkBtn.textContent = "Copy Secret Link"
          }, 2000)
        })
        .catch((err) => {
          console.error("Failed to copy:", err)
          showError("Failed to copy link. Please try again.")
        })
    }
  
    copyBtn.addEventListener("click", copyToClipboard)
    copyLinkBtn.addEventListener("click", copyToClipboard)
  
    // Join room
    joinBtn.addEventListener("click", () => {
      window.location.href = secretLink
    })
  })
  