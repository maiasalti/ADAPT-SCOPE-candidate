export interface ClaimSummaryRequest {
  claimId: string;
  ssn: string;
  patientName: string;
  condition: string;
}

export function summarizeClaimWithBedrock(request: ClaimSummaryRequest) {
  console.log('Bedrock request payload:', JSON.stringify(request));
  return {
    summary: `Claim ${request.claimId} reviewed for ${request.condition}.`,
    rawPayload: request,
  };
}
