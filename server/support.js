// Team management functions (placeholders for server-side interaction)
function openGroupForm() {
  // Logic to open the team creation form (replace with your implementation)
  console.log("Opening team creation form");
}

function closeGroupForm() {
  // Logic to close the team creation form (replace with your implementation)
  console.log("Closing team creation form");
}

function openGroupJoinForm() {
  // Logic to open the team join form (replace with your implementation)
  console.log("Opening team join form");
}

function closeGroupJoinForm() {
  // Logic to close the team join form (replace with your implementation)
  console.log("Closing team join form");
}

function submitGroupForm() {
  // Logic to handle team creation form submission (replace with your implementation)
  console.log("Submitting team creation form");
}

function joinGroup() {
  // Logic to handle team join form submission (replace with your implementation)
  console.log("Joining team");
}

function confirmKick(userID) {
  // Logic to confirm kicking a user (replace with your implementation)
  console.log("Confirming kick for user:", userID);
  document.getElementById('kickConfirmation').value = userID;
  document.getElementById('kickConfirmation').style.display = 'block';
}

function confirmRoleChange(userID, role) {
  // Logic to confirm changing a user's role (replace with your implementation)
  console.log("Confirming role change for user:", userID, "to", role);
  document.getElementById('roleConfirmation').value = `${userID},${role}`;
  document.getElementById('roleConfirmation').style.display = 'block';
}

// Support ticket functionality
function openSupportPopup() {
  document.getElementById('support-popup').style.display = 'block';
}

function closeSupportPopup() {
  document.getElementById('support-popup').style.display = 'none';
  // Clear input fields (optional)
  document.getElementById('subject').value = '';
  document.getElementById('description').value = '';
}

function submitSupportTicket() {
  // Existing logic...

  // Additional validation (attachment)
  const attachment = document.getElementById('attachment').files;
  if (!attachment.length) {
    document.getElementById('support-message').textContent = 'Please attach a file.';
    document.getElementById('support-message').classList.add('error-message');
    return;
  }

  // Basic validation (subject & description)
  const subject = document.getElementById('subject').value;
  const description = document.getElementById('description').value;
  if (!subject || !description) {
    document.getElementById('support-message').textContent = 'Please enter a subject and description.';
    document.getElementById('support-message').classList.add('error-message');
    return;
  }

  // Simulate sending data (replace with your API call)
  fetch('/api/submit-ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subject, description, attachment: attachment[0] }) // Assuming single attachment
  })
  .then(response => {
    if (response.ok) {
      // Show success message
      document.getElementById('support-message').textContent = 'Support ticket submitted successfully!';
      document.getElementById('support-message').classList.add('success-message');
      closeSupportPopup();
    } else {
      // Show error message
      document.getElementById('support-message').textContent = 'Error submitting ticket. Please try again.';
      document.getElementById('support-message').classList.add('error-message');
    }
  });
}
