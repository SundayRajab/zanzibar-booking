export interface FlutterwaveSessionResponse {
  id: string;
  checkout_url: string;
}

export async function getFlutterwaveToken() {
  const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
  const clientSecret = process.env.FLUTTERWAVE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Flutterwave Client ID or Secret is missing in environment variables.');
  }

  const response = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Flutterwave Auth Error:', errorData);
    throw new Error(`Failed to get Flutterwave access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createFlutterwaveSession(params: {
  amount: number;
  currency: string;
  tx_ref: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
  customizations: {
    title: string;
    description: string;
  };
  redirect_url: string;
}) {
  const token = await getFlutterwaveToken();

  // Use sandbox URL for development
  const baseUrl = 'https://developersandbox-api.flutterwave.com/v4';
  
  const response = await fetch(`${baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      tx_ref: params.tx_ref,
      customer: params.customer,
      customizations: params.customizations,
      redirect_url: params.redirect_url,
      payment_options: 'card,mobilemoney,ussd',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Flutterwave Session Error:', errorData);
    throw new Error(`Failed to create Flutterwave session: ${errorData.message || response.statusText}`);
  }

  const result = await response.json();
  return result.data as FlutterwaveSessionResponse;
}
