
import * as Wb from 'expo-web-browser';

Wb.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    // if (result. === 'success') {
    //   // Handle successful authentication
    //   const { params } = result;
    //   const { code } = params;

    //   // Exchange authorization code for access token
    //   const tokenResponse = await fetch('https://your-backend.com/auth/callback/google', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ code }),
    //   });

    //   const tokenData = await tokenResponse.json();
    //   const { access_token } = tokenData;

    //   // Use access token for backend requests
    //   // Example: fetch('https://your-backend.com/api/data', {
    //   //   headers: {
    //   //     Authorization: `Bearer ${access_token}`,
    //   //   },
    //   // });

    // } else if (result.type === 'error') {
    //   // Handle error
    //   console.error('Authentication error:', result.error);
    // }
  } catch (error) {
    console.error('Authentication error:', error);
  }
};