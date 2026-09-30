import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  createReminderCampaign,
  getReminderCampaign,
  listReminderCampaigns,
} from '@/lib/reminder-db';
import { copyReminderAttachments } from '@/lib/reminder-attachments';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.reminders.list',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const campaigns = await listReminderCampaigns();
    return adminJson({ success: true, campaigns });
  } catch (error) {
    console.error('Unable to list reminders.', error);
    return adminJson({ error: 'Unable to load reminders.' }, { status: 500 });
  }
}

// Creates a reminder, or duplicates one (copy and attachments) when
// duplicateFrom is given, so the next T-day starts from the last one.
export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.create',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const sourceId =
      typeof body.duplicateFrom === 'string' ? body.duplicateFrom : '';
    const source = sourceId ? await getReminderCampaign(sourceId) : null;
    const campaign = await createReminderCampaign({
      input: source
        ? {
            name: body.name || `Copy of ${source.campaign.name}`,
            subject: source.campaign.subject,
            body: source.campaign.body,
          }
        : body,
      operator: authResult.operator,
    });

    let warning = null;
    if (source) {
      try {
        await copyReminderAttachments({
          fromId: source.campaign.id,
          toId: campaign.id,
          operator: authResult.operator,
        });
      } catch (copyError) {
        console.error('Unable to copy reminder attachments.', copyError);
        warning =
          'The copy was created, but its attachments could not be copied. Add them again.';
      }
    }
    return adminJson({ success: true, campaign, warning }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create reminder.';
    return adminJson(
      { error: message },
      { status: reminderErrorStatus(message) }
    );
  }
}
