export const example = {
  clientName: 'Sarah',
  amount: '$850',
  daysOverdue: 12,
  projectType: 'Website redesign',
  previousReminders: 'None',
  clientRelationship: 'Repeat client',
  recommendedStage: 'Firm Reminder',
  stageReason: 'The invoice is 12 days overdue, but this appears to be your first reminder. A firm reminder is clearer than a gentle nudge, but safer than starting with a final notice.',
  subject: 'Follow-up on website redesign invoice',
  body: `Hi Sarah,

I hope you’re doing well. I wanted to follow up on the $850 invoice for the website redesign project, which is now 12 days overdue.

Could you please let me know when I can expect payment, or if there is anything you need from me to process it?

Thanks,
[Your Name]`,
  dm: 'Hi Sarah — quick follow-up on the $850 website redesign invoice, which is now 12 days overdue. Could you let me know when I can expect payment?'
};

export const faqs = [
  ['What does FreelancerReply do?', 'FreelancerReply helps freelancers draft late payment reminder messages. You describe the payment situation, and it recommends a reminder stage with a draft email and short DM.'],
  ['Does FreelancerReply ask me to choose friendly, professional, or firm first?', 'No. FreelancerReply starts with the payment situation and recommends the right reminder stage before drafting the message.'],
  ['Is FreelancerReply free?', 'Yes. FreelancerReply is free while in beta. Free usage limits apply so we can prevent abuse and keep the beta available.'],
  ['How do free reminders and adjustments work?', 'Each free reminder draft is for one payment situation. You can use a free adjustment, such as “Make it softer” or “Make it firmer,” on that draft when available.'],
  ['Does FreelancerReply generate Gentle, Firm, and Final Notice all at once?', 'No. The current beta generates one recommended reminder for the situation you enter. Full reminder sequences may be added later as a Pro feature.'],
  ['How does it choose the reminder stage?', 'The stage is based mainly on days overdue and previous reminders sent. Client relationship may also affect how direct the recommendation should be.'],
  ['Does FreelancerReply send emails automatically?', 'No. FreelancerReply only creates drafts. You review, edit, copy, and send the message yourself.'],
  ['Is this legal advice?', 'No. FreelancerReply does not provide legal, financial, accounting, tax, debt collection, or professional advice. Reminder stage recommendations are product suggestions, not legal conclusions.'],
  ['Can I mention late fees or legal action?', 'Only mention late fees, service suspension, collections, or legal action if you have verified that your agreement and applicable rules allow it.'],
  ['Do you store my invoice or client details?', 'FreelancerReply is designed not to save generator inputs by default. However, the details you submit may be sent to an AI service to generate the draft, and usage limits, analytics, waitlist, or email verification systems may process related data.'],
  ['What happens if I hit the free limit?', 'You can come back later, verify your email for a higher free limit when available, or join the Pro Waitlist if you want future higher-limit workflow tools.'],
  ['Is Pro available now?', 'No. Pro is not available yet. The Pro Waitlist is an interest check, not a paid subscription.']
];
