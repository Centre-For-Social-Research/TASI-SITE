function resolveRegistrationReviewFields(
  existing,
  { reviewNotes, speakerFlag, vipFlag }
) {
  return {
    reviewNotes:
      typeof reviewNotes === 'string'
        ? reviewNotes.trim()
        : existing.review_notes || '',
    speakerFlag:
      typeof speakerFlag === 'boolean' ? speakerFlag : existing.speaker_flag,
    vipFlag: typeof vipFlag === 'boolean' ? vipFlag : existing.vip_flag,
  };
}

module.exports = { resolveRegistrationReviewFields };
