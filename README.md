# VoiceNotes App

This guide will walk you through the steps to set up and run the VoiceNotes React Native app on your local machine. By default, the app is configured to work with our staging environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VoiceNotes-AI/voicenotes-app.git
cd voicenotes-app
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Start the Expo Development Server

```bash
npx expo start
```

This will start the Expo development server and provide a QR code to open the app in the Expo Go app on your device.

## Running the App

1. Ensure the Expo development server is running.
2. Open the Expo Go app on your device and scan the QR code provided by the Expo CLI.

## Connecting to Local Backend (Optional)

If you need to connect to a local backend for development purposes, follow these steps:

1. Get your local IP address:
   ```bash
   ifconfig | grep 192 | cut -d ' ' -f 2
   ```

2. Update the `API_URL` in `src/api/api-constants.ts`:
   ```typescript
   API_URL = 'http://YOUR_LOCAL_IP:8000';
   ```
   Replace `YOUR_LOCAL_IP` with your actual local IP address.

3. Follow the [steps here](https://github.com/VoiceNotes-AI/voicenotes?tab=readme-ov-file#voicenotescom) to setup the backend server

4. Run backend server as php artisan server --host 192.168.88.137 

## Troubleshooting

- If you encounter network issues, make sure your device and development machine are on the same network.
- For Android emulators, you may need to use `10.0.2.2` instead of `localhost` to access your local machine.
- For iOS simulators, `localhost` should work fine to access your local machine.

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

If you encounter any issues or have questions, please create an issue in the repository or contact the project maintainers.

Happy coding!