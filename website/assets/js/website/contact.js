/**
 * Contact JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/7/2022
 * Updated: 1/7/2022
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { getUrlParameter } from '../utils.js';

export const contact = {

  cannedMessages: {
    custom: {
      message: 'I have a custom project that I need developed.',
      subject: 'Custom Development',
    },
    data: {
      message: 'I am seeking your open cannabis data.',
      subject: 'Seeking Cannabis Data',
    },
    general: {
      message: 'I am reaching out, please email me back.',
      subject: 'Contacting Cannlytics',
    },
    join: {
      message: 'I am interested in joining Cannlytics.',
      subject: 'Joining Cannlytics',
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

  mathCheckTotal: 0,

  initializeContactForm() {
    /**
     * Initialize the contact form.
     */

    // Create a simple math check.
    const min = this.randomIntFromInterval(0, 5);
    const max = this.randomIntFromInterval(0, 4);
    this.mathCheckTotal = min + max;
    document.getElementById('math-check-min').textContent = min;
    document.getElementById('math-check-max').textContent = max;

    // Load any canned contact message.
    this.setContactFormTopic();
  },

  randomIntFromInterval(min, max) {
    /**
     * Generate a random number in a given interval.
     * @param {Number} min The minimum of the range.
     * @param {Number} max The maximum of the range.
     */
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  setContactFormTopic(selectedTopic) {
    /**
     * Set the topic of the contact form.
     * @param {String} selectedTopic A user selected topic.
     */
    const topic = selectedTopic || getUrlParameter('topic');
    if (topic) {
      const cannedMessage = this.cannedMessages[topic];
      document.getElementById('message_input').value = cannedMessage.message;
      // document.getElementById('subject_input').value = cannedMessage.subject;
      document.getElementById('topic_input').value = topic;
    }
  },

  submitContactForm() {
    /**
      * Submit the contact form after validation.
      */
    const mathCheck = parseInt(document.getElementById('math_input').value);
    console.log(mathCheck, this.mathCheckTotal);
    if (mathCheck !== this.mathCheckTotal) {
      cannlytics.showNotification('Match Check Mismatch', "Please try the math check again. We've implemented this to thwart abuse.", 'error');
      return false;
    }
    const email = document.getElementById('email_input').value;
    if (email === null || email === '') {
      cannlytics.showNotification('Email Required', 'Please enter a valid email so we can reply to your message.', 'error');
      return false;
    }
    const message = document.getElementById('message_input').value;
    if (message === null || message === '') {
      cannlytics.showNotification('Message Required', 'Please enter a message so we can reply to you.', 'error');
      return false;
    }
    return true;
  },

}
