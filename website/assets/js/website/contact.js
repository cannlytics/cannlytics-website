/**
 * Contact JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 1/7/2022
 * Updated: 9/23/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { getCookie, getUrlParameter } from '../utils.js';

export const contact = {

  cannedMessages: {
    api: {
      message: 'I need support using the Cannlytics API.',
      subject: 'Using the Cannlytics API',
    },
    algorithms: {
      message: 'I am seeking help with a cannabis-related algorithm.',
      subject: 'Seeking Algorithm Help',
    },
    analyses: {
      message: 'I would like to suggest the following analyses and their prices:',
      subject: 'Suggest Analyses',
    },
    coas: {
      message: 'I am interested in extracting the data from my CoAs.',
      subject: 'CoA Data Extraction',
    },
    custom: {
      message: 'I have a custom project that I need developed.',
      subject: 'Custom Development',
    },
    data: {
      message: 'I am seeking your open cannabis data.',
      subject: 'Seeking Cannabis Data',
    },
    edit: {
      message: 'I would like to suggest the following data edit:',
      subject: 'Suggest Data Edit',
    },
    economics: {
      message: 'I am seeking assistance with economic analysis.',
      subject: 'Seeking Economic Analysis',
    },
    forecasting: {
      message: 'I am seeking forecasting.',
      subject: 'Seeking Forecasting',
    },
    general: {
      message: 'I am reaching out, please email me back.',
      subject: 'Contacting Cannlytics',
    },
    join: {
      message: 'I am interested in joining Cannlytics.',
      subject: 'Joining Cannlytics',
    },
    contribute: {
      message: 'I am interested in contributing to Cannlytics.',
      subject: 'Contributing to Cannlytics',
    },
    invest: {
      message: 'I am interested in investing in Cannlytics.',
      subject: 'Invest in Cannlytics',
    },
    lims: {
      message: 'I am interested in using the Cannlytics LIMS.',
      subject: 'Cannlytics LIMS',
    },
    metrc: {
      message: 'I am interested in using Cannlytics to integrate with Metrc.',
      subject: 'Metrc Integration',
    },
    paper: {
      message: 'I have a paper to submit.',
      subject: 'Submitting a Paper',
    },
    partner: {
      message: 'I am seeking to partner with Cannlytics.',
      subject: 'Partner with Cannlytics',
    },
    regulations: {
      message: 'I am interested in talking with you about regulations.',
      subject: 'Asking about Regulations',
    },
  },

  initializeContactForm() {
    /**
     * Initialize the contact form and loading any canned contact message.
     */
    this.setContactFormTopic();
  },

  setContactFormTopic(selectedTopic) {
    /**
     * Set the topic of the contact form.
     * @param {String} selectedTopic A user selected topic.
     */
    const topic = selectedTopic || getUrlParameter('topic');
    if (topic) {
      const cannedMessage = this.cannedMessages[topic] || this.cannedMessages.general;
      document.getElementById('message_input').value = cannedMessage.message;
      // document.getElementById('subject_input').value = cannedMessage.subject;
      document.getElementById('topic_input').value = topic;
    }
  },

  submitContactForm() {
    /**
      * Submit the contact form after validation.
      */
    
    // Gather form data.
    const name = document.getElementById('name_input').value;
    const email = document.getElementById('email_input').value;
    const topic = document.getElementById('topic_input').value;
    const message = document.getElementById('message_input').value;

    // Validate form data (basic validation example).
    if (!email || !message) {
      cannlytics.utils.showNotification('Error', 'Email and message are required.', 'error');
      return false;
    }

    // Prepare form data for submission.
    const formData = new FormData();
    const csrftoken = getCookie('csrftoken');
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', topic);
    formData.append('message', message);
    formData.append('csrfmiddlewaretoken', csrftoken);

    // Submit form data via fetch.
    fetch(window.location.origin + '/src/message', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // // Show a success notification
        // cannlytics.utils.showNotification('Success', 'Message sent successfully!', 'success');
        // // Optionally, reset the form
        // document.getElementById('contact-form').reset();
        window.location.href = window.location.origin + "/thank-you";
      } else {
        // Show an error notification
        cannlytics.utils.showNotification('Error', 'There was a problem submitting your message.', 'error');
      }
    })
    .catch(error => {
      // Handle any errors
      cannlytics.utils.showNotification('Error', 'An unexpected error occurred.', 'error');
    });
    return false; // Prevent default form submission behavior
  },

}
