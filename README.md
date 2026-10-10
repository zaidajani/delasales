# DelaSales

**An AI sales assistant that turns call recordings into transcripts, action items, and follow-up emails.**

DelaSales is a sales-call application built to transcribe calls, extract action items, and generate follow-up emails based on those commitments. Users upload a recording, receive a speaker-labelled transcript, review seller/client tasks and risks, and draft, edit, send, or schedule follow-up emails.

## Why this project exists

A meeting can end with useful commitments but still leave the salesperson with several manual jobs: transcribe the conversation, work out who promised what, identify unresolved questions, and write the next email. When those steps are disconnected, follow-ups can lose context or get delayed.

DelaSales was built to reduce the manual work after a sales call and keep follow-ups tied to what was actually discussed. It connects transcription, action-item extraction, and email generation in one workflow: the call provides the context, the extracted tasks identify the next steps, and generated emails help the salesperson act on them.

The core idea is to carry a conversation's commitments into the next action, with the user able to review and edit the output before sending.

## Integration highlights

- **Lemonfox AI:** transcribes uploaded audio with speaker labels.
- **OpenAI:** analyses transcripts, extracts action items, and generates or refines follow-up emails.
- **Microsoft/Google cloud services:** connect Outlook and Gmail mailboxes for email delivery.

The author reports orchestrating **three concurrent API integrations** across these services during development. The workflow still respects dependencies: a transcript is needed before transcript-based analysis, and an email draft is needed before sending. The repository does not include a concurrency benchmark harness.

## What is implemented

- **Recording upload:** upload audio to Supabase Storage and save meeting metadata.
- **Speaker-labelled transcription:** call Lemonfox and store transcript segments with speaker labels.
- **AI analysis:** generate a short meeting summary, seller/client action items, and risks/open loops.
- **Task management:** add action items, distinguish seller and client work, and update completion state.
- **Email drafting:** generate action-related follow-ups and meeting-summary emails.
- **Reusable templates:** manage email templates and template variables.
- **Rich-text editing:** edit HTML email content with TipTap.
- **Email copilot:** request AI assistance and refinements for email content.
- **Provider connections:** connect Gmail or Outlook through OAuth.
- **Sending and scheduling:** send messages, schedule drafts, inspect scheduled messages, and cancel schedules.
- **Dashboard views:** navigate recordings, templates, settings, and calendar-related interface.

## Typical workflow

1. Sign in and add a meeting recording with its title, time, and participants.
2. The browser uploads audio to Supabase; the server retrieves it for Lemonfox transcription.
3. Open the recording and run analysis on its speaker-labelled transcript.
4. Review the summary, seller/client tasks, and risks.
5. Generate a follow-up using the meeting context and, optionally, an email template.
6. Edit the subject, body, and recipient.
7. Send through a connected mailbox or schedule the draft.

Transcription is currently requested in English. Analysis and email generation use OpenAI's Responses API with `gpt-5-nano`. The user should review extracted commitments and generated emails against the transcript.

## Stack and data responsibilities

| Component | Role |
| --- | --- |
| Next.js 16.1.4, React 19.2.3, TypeScript | Application and API routes |
| Clerk | Account authentication |
| MongoDB and Mongoose | Users, recordings, transcripts, tasks, templates, and email state |
| Supabase Storage | Audio files |
| Lemonfox | Audio transcription and speaker labels |
| OpenAI Responses API | Meeting analysis and email generation/refinement |
| Gmail API / Microsoft Graph | Connected-mailbox sending |
| TipTap | Rich-text email editing |
| Tailwind CSS, Lucide, Chart.js | Interface and dashboard components |

Supabase is used for audio storage; MongoDB is the main application database.

## Run locally

You need Node.js/npm compatible with the lockfile, MongoDB, a Clerk application, Supabase Storage, and Lemonfox/OpenAI API credentials. Email sending also needs a configured Google or Microsoft OAuth application.

```bash
git clone https://github.com/zaidajani/delasales.git
cd delasales
npm ci
```

Create `.env.local`:

```dotenv
MONGODB_URI=mongodb://localhost:27017/delasales
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LEMONFOX_API_KEY=your_lemonfox_api_key
OPENAI_API_KEY=your_openai_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=replace_with_a_long_random_secret

# Gmail integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Outlook integration
OUTLOOK_CLIENT_ID=your_microsoft_client_id
OUTLOOK_CLIENT_SECRET=your_microsoft_client_secret
OUTLOOK_TENANT_ID=your_microsoft_tenant_id
OUTLOOK_REDIRECT_URI=http://localhost:3000/api/auth/outlook/callback
```

### Storage and authentication setup

1. Create a Supabase bucket named **`delasales_audio`**.
2. Configure upload policies so the browser upload using the anon key is allowed for your intended users.
3. The current client constructs a **public** audio URL. The server must be able to retrieve that URL for transcription. A private bucket requires corresponding code changes for signed access.
4. Configure Clerk sign-in/sign-up routing for `/login` and `/register`.
5. Ensure your account is initialised in MongoDB through the application's user-sync/signup flow.

### Email provider setup

For Gmail, register this redirect URI:

```text
http://localhost:3000/api/auth/gmail/callback
```

The Gmail flow requests send access and offline access. Configure the OAuth consent screen and any test-user restrictions accordingly.

For Outlook, register the callback configured in `OUTLOOK_REDIRECT_URI`, configure the tenant/application account settings, and grant the Microsoft Graph delegated permissions requested by the connection flow.

Use your deployed application origin in place of localhost when hosting the app.

```bash
npm run dev
```

Open [localhost:3000/dashboard](http://localhost:3000/dashboard). The root page still contains Next.js starter content; the product workflow is under `/dashboard`.

## Scheduled email delivery

Saving a scheduled time does not run a background worker automatically.

For local development, keep the app running and start the declared polling script in another terminal:

```bash
npm run cron
```

The script calls `http://localhost:3000/api/email/run-scheduler` once per minute. That endpoint finds due drafts and calls the send route with `INTERNAL_API_SECRET`.

For deployment, arrange a persistent scheduler or hosted recurring job to invoke the scheduler endpoint. The supplied polling script is hardcoded to localhost. The repository also contains in-process scheduler helpers; choose one delivery mechanism and verify it rather than running multiple schedulers concurrently.

## Main API areas

| Area | Purpose |
| --- | --- |
| `/api/newuser` | Initialise application user data |
| `/api/recordings/add` | Transcribe and save an uploaded recording |
| `/api/recordings/analysis` | Analyse a transcript |
| `/api/recordings/action-items` | Task operations |
| `/api/recordings/generate-email` | Generate an action-related email |
| `/api/recordings/generate-summary-email` | Generate a meeting-summary email |
| `/api/templates` | Template management |
| `/api/email/chat`, `/api/email/refine` | AI email assistance |
| `/api/auth/gmail`, `/api/auth/outlook` | Mailbox OAuth flows |
| `/api/email/send` | Send through a connected provider |
| `/api/email/schedule`, `/api/email/scheduled` | Schedule and list drafts |
| `/api/email/run-scheduler` | Process due scheduled messages |

## Repository guide

| Path | Purpose |
| --- | --- |
| `app/dashboard/` | Recording, template, settings, and calendar views |
| `app/components/` | Task, transcript, editor, and copilot interface |
| `app/api/recordings/` | Transcription, analysis, tasks, and email drafting |
| `app/api/email/`, `app/api/auth/` | Sending, scheduling, and mailbox connections |
| `app/api/models/user.ts` | Main embedded application schemas |
| `lib/` | Database, storage, template, and scheduler helpers |
| `scripts/cron.js` | Local scheduler polling |

## Current scope

This repository implements an uploaded-recording workflow; it does not contain a live meeting bot or automatic meeting capture integration.

The analysis prompt requests deadlines, confidence labels, and process milestones, but the current analysis route does not persist all those fields in its task mapping. They should not be presented as fully implemented scheduling or milestone intelligence.

Recordings are stored using public URLs in the current upload path. Transcripts are sent to OpenAI for analysis, audio is sent to Lemonfox for transcription, and mailbox refresh tokens are stored in the user model. These are material parts of the current implementation, rather than a claim of production privacy or compliance guarantees.

## Development

```bash
npm run lint
npm run build
npm start
```

The setup and feature descriptions were checked against source files. A full transcription-to-email deployment has not been tested as part of this documentation update.

## Author and licence

Built by [Zaid Ajani](https://github.com/zaidajani).

No licence file is present in this repository.
