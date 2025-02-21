import { supabase } from './supabase';

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export async function sendEmail({ to, subject, body, from = 'support@foodrient.com' }: EmailConfig) {
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendGroupInviteEmail(
  invitedEmail: string,
  groupName: string,
  inviterName: string
) {
  const subject = `You've been invited to join ${groupName} on Foodrient`;
  const body = `
    <h2>Group Buy Invitation</h2>
    <p>Hi there!</p>
    <p>${inviterName} has invited you to join the group "${groupName}" on Foodrient.</p>
    <p>Join the group to participate in bulk buying and save money together!</p>
    <p>Click the link below to view the invitation:</p>
    <a href="${window.location.origin}/groups/invites">View Invitation</a>
  `;

  return sendEmail({ to: invitedEmail, subject, body });
}

export async function sendGroupUpdateEmail(
  userEmail: string,
  groupName: string,
  updateType: 'joined' | 'left' | 'completed' | 'cancelled',
  details?: string
) {
  const subject = `Update on your group "${groupName}"`;
  const body = `
    <h2>Group Update</h2>
    <p>Hi there!</p>
    <p>There's been an update to your group "${groupName}":</p>
    <p>${details || getDefaultUpdateMessage(updateType, groupName)}</p>
    <p>Click below to view the group:</p>
    <a href="${window.location.origin}/groups">View Group</a>
  `;

  return sendEmail({ to: userEmail, subject, body });
}

function getDefaultUpdateMessage(type: string, groupName: string): string {
  switch (type) {
    case 'joined':
      return 'A new member has joined the group.';
    case 'left':
      return 'A member has left the group.';
    case 'completed':
      return `The group "${groupName}" has reached its target size and is now complete!`;
    case 'cancelled':
      return `The group "${groupName}" has been cancelled.`;
    default:
      return 'There has been an update to your group.';
  }
}