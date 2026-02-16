export const DEFAULT_TEMPLATES = [
  {
    name: "Next Steps Follow-Up",
    subject: "Next steps from our discussion",
    isDefault: true,
    body: `<p>Hi {{client_name}},</p>

<p>{{introduction_meeting_reference}}</p>

<p>I’m sure improving your {{objective}} is a top priority for you.<br/><br/>
Based on our discussion, here’s a quick recap:<br/><br/>
• Current setup: {{current_tool}}<br/>
• Key challenge: {{pain_point}}<br/>
• Desired outcome: {{desired_outcome}}</p>

<p>Next steps:<br/>
• I’ll share: {{your_next_step}}<br/>
• You’ll: {{client_next_step}}<br/><br/>
If you’d like any additional details about {{solution_area}}, I’d be happy to schedule a quick follow-up.<br/><br/>
Just let me know if anything needs clarification — I’m here to help.</p>

<p>{{closing}},<br/>{{signature}}</p>`
  },

  {
    name: "Technical Evaluation Follow-Up",
    subject: "Resources for your technical evaluation",
    isDefault: true,
    body: `<p>Hi {{client_name}},</p>

<p>{{introduction_meeting_reference}}</p>

<p>I’m sure ensuring smooth {{technical_goal}} is a top priority for you.<br/><br/>
As discussed, here are the resources for your evaluation:<br/><br/>
• API docs: {{api_docs_link}}<br/>
• Sandbox access: {{sandbox_link}}<br/>
• Example implementation: {{example_link}}</p>

<p>If you’d like any additional information about {{integration_scope}}, I’d be more than happy to assist your team during evaluation.<br/><br/>
Just let me know if questions come up — I’m here whenever you need me.</p>

<p>{{closing}},<br/>{{signature}}</p>`
  },

  {
    name: "Post-Call Nudge",
    subject: "Any thoughts after our call?",
    isDefault: true,
    body: `<p>Hi {{client_name}},</p>

<p>{{introduction_call_reference}}</p>

<p>I’m sure aligning on {{objective}} is a priority for your team.<br/><br/>
Have you had a chance to review {{discussion_topic}} internally?</p>

<p>If you’d like any additional information about {{decision_factors}}, I’d be happy to provide details to support your evaluation.<br/><br/>
Just let me know if timing has shifted or if you’d like to continue the conversation.</p>

<p>{{closing}},<br/>{{signature}}</p>`
  },

  {
    name: "Start Trial Follow-Up",
    subject: "Getting started — next step",
    isDefault: true,
    body: `<p>Hi {{client_name}},</p>

<p>{{introduction_meeting_reference}}</p>

<p>I’m sure improving your {{objective}} is a top priority for you.<br/><br/>
As discussed, the next step is to get started here:<br/><br/>
→ {{trial_link}}</p>

<p>If you’d like any additional information about {{setup_process}}, I’d be happy to guide you through the first steps.<br/><br/>
Just let me know once you’re in, and we can review results together.</p>

<p>{{closing}},<br/>{{signature}}</p>`
  },
];
