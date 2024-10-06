/**
 * Stats JavaScript | Cannlytics Website
 * Copyright (c) 2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 10/5/2024
 * Updated: 10/5/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { Modal } from 'bootstrap';
import { getCurrentUser, getDocument } from '../firebase.js';
import { authRequest, showNotification  } from '../utils.js';

export function initializeReportButtons() {
  /* Initialize the report buttons. */

  // Add event listeners to all "Report" buttons
  document.querySelectorAll('.report-link').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const reportModal = new Modal(document.getElementById('reportModal'));
      reportModal.show();
      const card = this.closest('.observation');
      const resultId = card.dataset.id;
      const dataType = card.dataset.type;
      const submitButton = document.getElementById('submitReport');
      submitButton.dataset.hash = resultId;
      submitButton.dataset.type = dataType;
    });
  });

  // Handle the form submission
  document.getElementById('submitReport').addEventListener('click', function() {
    const reportReason = document.querySelector('input[name="reason"]:checked').value;
    const details = document.getElementById('reportDetails').value;
    const data = {
      id: this.dataset.hash,
      data_type: this.dataset.type,
      reason: reportReason,
      details: details,
    };
    authRequest('/src/report', { data })
      .then(response => {
        showNotification('Report Submitted', 'Thank you for reporting. We will review the issue.', 'success');
      })
      .catch(error => {
        showNotification('Error', 'There was an error submitting your report. Please try again later.', 'error');
      });
    const reportModal = Modal.getInstance(document.getElementById('reportModal'));
    reportModal.hide();
  });
};

export function initializeShareButtons() {
  // Initialize the share buttons.
  document.querySelectorAll('.share-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const link = `https://cannlytics.com${this.dataset.link}`;
      navigator.clipboard.writeText(link).then(() => {
        showNotification('Link Copied!', 'Link copied. Share as you see fit.', 'success');
      }).catch(err => {
        // Show an error notification if something goes wrong.
        showNotification('Error', 'Failed to copy the link.', 'error');
        console.error('Could not copy text: ', err);
      });
    });
  });
};

export function initializeStarButtons() {
  /* Initialize the star buttons. */
  document.querySelectorAll('.star-btn').forEach(button => {
    button.addEventListener('click', function() {
      const icon = this.querySelector('.star-icon');
      const observationId = this.dataset.hash;
      const dataType = this.dataset.type;
      const isStarred = this.dataset.starred === "true";
      const starCountElement = this.querySelector('.star-count');
      let starCount = parseInt(starCountElement.textContent, 10);
      
      if (!isStarred) {
        // User is starring the observation
        icon.classList.remove('bi-star');
        icon.classList.add('bi-star-fill');
        this.dataset.starred = "true";
        starCountElement.textContent = starCount + 1;

        // Send star request to server
        starObservation(observationId, true, dataType);

      } else {
        // User is unstarring the observation
        icon.classList.remove('bi-star-fill');
        icon.classList.add('bi-star');
        this.dataset.starred = "false";
        starCountElement.textContent = starCount - 1;

        // Send unstar request to server
        starObservation(observationId, false, dataType);
      }
    });
  });
};

export function initializeVoteButtons() {
  /* Initialize the vote buttons. */

  // Initialize up-vote buttons.
  document.querySelectorAll('.upvote').forEach(button => {
    button.addEventListener('click', function() {
      const img = this.querySelector('.arrow-icon');
      const observationId = this.dataset.hash;
      const dataType = this.dataset.type;
      const isVoted = this.dataset.voted === "true";
      const ratingElement = this.nextElementSibling.querySelector('.rating');
      let currentRating = parseInt(ratingElement.textContent, 10);

      if (!isVoted) {
        // User is upvoting
        img.src = '/static/website/images/ai-icons/up-arrow-filled-dark.svg';
        this.dataset.voted = "true";
        this.nextElementSibling.nextElementSibling.disabled = true;
        ratingElement.textContent = currentRating + 1; // Increment vote count in UI

        // Send upvote request to server
        voteObservation(observationId, 'up', dataType);
      } else {
        // User is removing the upvote
        img.src = '/static/website/images/ai-icons/up-arrow.svg';
        this.dataset.voted = "false";
        this.nextElementSibling.nextElementSibling.disabled = false;
        ratingElement.textContent = currentRating - 1; // Decrement vote count in UI

        // Remove vote request to server
        voteObservation(observationId, null, dataType);
      }
    });
  });

  // Initialize down-vote buttons.
  document.querySelectorAll('.downvote').forEach(button => {
    button.addEventListener('click', function() {
      const img = this.querySelector('.arrow-icon');
      const observationId = this.dataset.hash;
      const dataType = this.dataset.type;
      const isVoted = this.dataset.voted === "true";
      const ratingElement = this.previousElementSibling.querySelector('.rating');
      let currentRating = parseInt(ratingElement.textContent, 10);

      if (!isVoted) {
        // User is down-voting.
        img.src = '/static/website/images/ai-icons/down-arrow-filled-dark.svg';
        this.dataset.voted = "true";
        this.previousElementSibling.previousElementSibling.disabled = true;
        ratingElement.textContent = currentRating - 1; // Decrement vote count in UI

        // Send downvote request to server
        voteObservation(observationId, 'down', dataType);
      } else {
        // User is removing the downvote
        img.src = '/static/website/images/ai-icons/down-arrow.svg';
        this.dataset.voted = "false";
        this.previousElementSibling.previousElementSibling.disabled = false;
        ratingElement.textContent = currentRating + 1; // Increment vote count in UI

        // Remove vote request to server
        voteObservation(observationId, null, dataType);
      }
    });
  });
};

export async function fetchUserStarsAndVotes(observations) {
  /* Fetch the stars and votes for the current user. */
  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid;

  // Loop through the observations and fetch stars/votes.
  for (let obs of observations) {
    const starPath = `users/${uid}/stars/${obs.id}`;
    const votePath = `users/${uid}/votes/${obs.id}`;
    
    // Fetch stars.
    const starData = await getDocument(starPath);
    if (Object.keys(starData).length > 0) {
      // Star exists, mark the star button as active.
      const starButton = document.querySelector(`.star-btn[data-hash="${obs.id}"]`);
      if (starButton) {
        const icon = starButton.querySelector('.star-icon');
        starButton.dataset.starred = "true";
        icon.classList.remove('bi-star');
        icon.classList.add('bi-star-fill');
      }
    }

    // Fetch votes.
    const voteData = await getDocument(votePath);
    if (Object.keys(voteData).length > 0) {
      const voteType = voteData.vote_type;
      const upvoteButton = document.querySelector(`.upvote[data-hash="${obs.id}"]`);
      const downvoteButton = document.querySelector(`.downvote[data-hash="${obs.id}"]`);
      if (voteType === 'up' && upvoteButton) {
        upvoteButton.dataset.voted = "true";
        upvoteButton.querySelector('.arrow-icon').src = '/static/website/images/ai-icons/up-arrow-filled-dark.svg';
        downvoteButton.disabled = true; // Disable opposite vote button
      } else if (voteType === 'down' && downvoteButton) {
        downvoteButton.dataset.voted = "true";
        downvoteButton.querySelector('.arrow-icon').src = '/static/website/images/ai-icons/down-arrow-filled-dark.svg';
        upvoteButton.disabled = true; // Disable opposite vote button
      }
    }
  }
};

async function voteObservation(observationId, voteType, dataType) {
  /* Vote on an observation. */
  const data = {
    id: observationId,
    vote: voteType,
    data_type: dataType
  };
  try {
    const response = await authRequest('/src/vote', data);
    if (response.status === 'success') {
      console.log(`Observation ${observationId} in ${dataType} collection voted as ${voteType}!`);
    } else {
      console.error('Vote failed:', response.error);
    }
  } catch (err) {
    console.error('Error voting on observation:', err);
  }
};

async function starObservation(observationId, isStarred, dataType) {
  /* Star or unstar an observation. */
  console.log('OBSERVATION ID:', observationId);
  const data = {
    id: observationId,
    star: isStarred,
    data_type: dataType
  };
  try {
    const response = await authRequest('/src/star', data);
    if (response.status === 'success') {
      console.log(`Observation ${observationId} in ${dataType} collection star status updated!`);
    } else {
      console.error('Star operation failed:', response.error);
    }
  } catch (err) {
    console.error('Error starring/un-starring observation:', err);
  }
};
