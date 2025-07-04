/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {initializeApp} from 'firebase-admin/app';

initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Re-export cloud functions
export {renderForBot} from './render-for-bot.js';
export {lemonSqueezyWebhook} from './lemon-squeezy-webhook.js';
export {syncProUsers} from './sync-pro-users.js';
export {renderPresentation} from './render-presentation.js';
