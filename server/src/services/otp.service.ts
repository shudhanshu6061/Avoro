interface SendOtpParams {
  phone: string;
  otpCode: string;
  customMessage?: string;
}

interface SendOtpResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends an OTP via BulkBlaster biotp API service
 * Endpoint: POST https://bulkblaster-biotp-api-290441563653.asia-south1.run.app/send-otp
 */
export const sendBulkBlasterOtp = async ({
  phone,
  otpCode,
  customMessage,
}: SendOtpParams): Promise<SendOtpResult> => {
  const apiKey =
    process.env.BULKBLASTER_API_KEY || 'bb_QClAekVvgArJzwLxmWr8SAiqD3qG3h87';
  const url =
    process.env.BULKBLASTER_OTP_URL ||
    'https://bulkblaster-biotp-api-290441563653.asia-south1.run.app/send-otp';

  if (!apiKey) {
    console.error('BulkBlaster OTP Error: BULKBLASTER_API_KEY is missing from environment variables');
    return {
      success: false,
      error: 'BULKBLASTER_API_KEY missing in server environment variables',
    };
  }


  // Format content message (BulkBlaster DLT template wraps raw OTP code)
  const content = otpCode;

  // Sanitize phone number (strip spaces/dashes)
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        phone: cleanPhone,
        content,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await response.json()) as any;


    if (!response.ok || data.success === false) {
      console.error('BulkBlaster OTP Delivery Failed:', data);
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status} Error`,
      };
    }

    return {
      success: true,
      message: data.message || 'OTP sent successfully',
    };
  } catch (error: any) {
    console.error('BulkBlaster OTP Request Exception:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to connect to BulkBlaster OTP service',
    };
  }
};
