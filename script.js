// Get references to HTML elements we'll be working with
const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');
const smsForm = document.getElementById('smsForm');
const phoneInput = document.getElementById('phoneInput');
const smsBtn = document.getElementById('smsBtn');
const smsStatus = document.getElementById('smsStatus');

// Function to save notes to localStorage
// localStorage is a browser feature that stores data locally on the user's computer
function saveNoteToStorage(note) {
    // Get existing notes from localStorage (or empty array if none exist)
    // JSON.parse converts the string back to an array
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Add the new note to the array
    notes.push(note);
    
    // Save the updated array back to localStorage
    // JSON.stringify converts the array to a string (localStorage only stores strings)
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Function to load notes from localStorage and display them
function loadNotes() {
    // Get notes from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Clear the container first
    notesContainer.innerHTML = '';
    
    // If there are no notes, show a message
    if (notes.length === 0) {
        notesContainer.innerHTML = '<p class="empty-message">No notes yet. Create your first note above! 📝</p>';
        return;
    }
    
    // Loop through each note and create a card for it
    // We reverse the array so newest notes appear first
    notes.reverse().forEach((note, index) => {
        // Create a div element for the note card
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        
        // Create elements for the note text and date
        const noteText = document.createElement('p');
        noteText.className = 'note-text';
        noteText.textContent = note.text;
        
        const noteDate = document.createElement('p');
        noteDate.className = 'note-date';
        noteDate.textContent = `Created: ${note.date}`;
        
        // Create a delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        
        // When delete button is clicked, remove this note
        deleteBtn.addEventListener('click', () => {
            deleteNote(notes.length - 1 - index); // Calculate original index
        });
        
        // Add all elements to the note card
        noteCard.appendChild(noteText);
        noteCard.appendChild(noteDate);
        noteCard.appendChild(deleteBtn);
        
        // Add the note card to the container
        notesContainer.appendChild(noteCard);
    });
}

// Function to delete a note
function deleteNote(index) {
    // Get notes from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Remove the note at the specified index
    notes.splice(index, 1);
    
    // Save the updated array back to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Reload the notes to update the display
    loadNotes();
}

// Function to handle form submission
function handleFormSubmit(event) {
    // Prevent the form from submitting normally (which would refresh the page)
    event.preventDefault();
    
    // Get the text from the textarea
    const noteText = noteInput.value.trim();
    
    // Don't save if the note is empty
    if (noteText === '') {
        alert('Please write something before saving!');
        return;
    }
    
    // Create a note object with text and current date/time
    const note = {
        text: noteText,
        date: new Date().toLocaleString() // Creates a readable date/time string
    };
    
    // Save the note to localStorage
    saveNoteToStorage(note);
    
    // Clear the textarea
    noteInput.value = '';
    
    // Reload and display all notes
    loadNotes();
    
    // Show a success message (optional)
    alert('Note saved successfully! ✅');
}

// Add event listener to the form
// This listens for when the user submits the form (clicks "Save Note" or presses Enter)
noteForm.addEventListener('submit', handleFormSubmit);

// Load and display notes when the page loads
loadNotes();

// ============================================================================
// DEMO SMS FEATURE - FOR DEMONSTRATION PURPOSES ONLY
// ============================================================================
// WARNING: In a real application, you should NEVER put your API key directly
// in JavaScript code that runs in the browser. Anyone can view the source code
// and see your API key, which could be misused. This approach is ONLY for
// short live demos. In production, API calls should be made from a backend server.
// ============================================================================

/**
 * Function to format phone number to Ghana local format (0XXXXXXXXX)
 * This ensures the phone number is in the correct format for mNotify API
 */
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters (spaces, dashes, etc.)
    phone = phone.toString().replace(/\D/g, '');
    
    // If phone starts with 233 (Ghana country code), convert to local format
    if (phone.startsWith('233')) {
        phone = '0' + phone.substring(3);
    }
    // If phone doesn't start with 0 and is 9 digits, add 0 at the beginning
    else if (!phone.startsWith('0') && phone.length === 9) {
        phone = '0' + phone;
    }
    
    return phone;
}

/**
 * Function to send motivational SMS using mNotify API
 * This function makes a POST request to the mNotify SMS API endpoint
 */
async function sendMotivationSMS(phoneNumber) {
    // Format the phone number to ensure it's in the correct format
    phoneNumber = formatPhoneNumber(phoneNumber);
    
    // Validate phone number (should be 10 digits starting with 0)
    if (!phoneNumber || phoneNumber.length !== 10 || !phoneNumber.startsWith('0')) {
        showSMSStatus('error', 'Invalid phone number. Please use format: 0200463804');
        return false;
    }
    
    // ============================================================================
    // DEMO CONFIGURATION - API Key and Sender ID
    // ============================================================================
    // These values are hardcoded for demo purposes only.
    // In production, these should be stored securely on a backend server.
    const apiKey = 'WUKb6M3un9vveHesNTHVbDyjQ'; // Your mNotify API key
    const senderId = 'SkillUp'; // Your registered sender ID (max 11 characters)
    
    // Static motivational message (hardcoded as requested)
    const motivationalMessage = 'Keep pushing forward! You are doing great things today. Stay motivated and never give up on your dreams! 💪';
    
    // mNotify API endpoint - API key is passed as a query parameter
    const apiUrl = `https://api.mnotify.com/api/sms/quick?key=${apiKey}`;
    
    // Prepare the data to send to the API
    // mNotify expects: recipient (array), sender, message, is_schedule, schedule_date
    const payload = {
        recipient: [phoneNumber], // Array of phone numbers
        sender: senderId,
        message: motivationalMessage,
        is_schedule: 'false',
        schedule_date: ''
    };
    
    // Show "sending" status
    showSMSStatus('sending', 'Sending SMS...');
    
    // Disable the button while sending
    smsBtn.disabled = true;
    
    try {
        // Make the POST request to mNotify API
        // fetch() is a built-in JavaScript function for making HTTP requests
        const response = await fetch(apiUrl, {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json' // Tell the server we're sending JSON data
            },
            body: JSON.stringify(payload) // Convert JavaScript object to JSON string
        });
        
        // Get the response status code (200 = success, 400/500 = error)
        const responseCode = response.status;
        
        // Get the response data as text
        const responseText = await response.text();
        
        // Try to parse the response as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // If response isn't JSON, use the text directly
            result = { message: responseText };
        }
        
        // Check if the request was successful
        if (responseCode === 200 || responseCode === 201) {
            // Success! Show success message
            showSMSStatus('success', '✅ Motivation SMS sent successfully! Check your phone.');
            phoneInput.value = ''; // Clear the input field
            return true;
        } else {
            // Error occurred - show error message
            const errorMsg = result.message || result.error || 'Failed to send SMS';
            showSMSStatus('error', `❌ Error: ${errorMsg}`);
            return false;
        }
        
    } catch (error) {
        // Network error or other exception occurred
        console.error('SMS Error:', error);
        showSMSStatus('error', '❌ Failed to connect to SMS service. Please check your internet connection.');
        return false;
    } finally {
        // Re-enable the button after request completes (success or error)
        smsBtn.disabled = false;
    }
}

/**
 * Helper function to display status messages on the page
 * @param {string} type - 'success', 'error', or 'sending'
 * @param {string} message - The message to display
 */
function showSMSStatus(type, message) {
    // Remove any existing status classes
    smsStatus.className = '';
    
    // Add the appropriate class based on type
    smsStatus.classList.add(type);
    
    // Set the message text
    smsStatus.textContent = message;
    
    // If it's a success message, clear it after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            smsStatus.textContent = '';
            smsStatus.className = '';
        }, 5000);
    }
}

/**
 * Function to handle SMS form submission
 * This is called when the user clicks "Send Motivation 💪" button
 */
function handleSMSFormSubmit(event) {
    // Prevent the form from submitting normally (which would refresh the page)
    event.preventDefault();
    
    // Get the phone number from the input field
    const phoneNumber = phoneInput.value.trim();
    
    // Validate that a phone number was entered
    if (!phoneNumber) {
        showSMSStatus('error', 'Please enter a phone number');
        return;
    }
    
    // Send the SMS
    sendMotivationSMS(phoneNumber);
}

// Add event listener to the SMS form
// This listens for when the user submits the form (clicks button or presses Enter)
smsForm.addEventListener('submit', handleSMSFormSubmit);
